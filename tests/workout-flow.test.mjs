import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/src/index.mjs';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
function extract(name){
  let start=source.indexOf('  function '+name+'(');
  if(start<0)start=source.indexOf('  async function '+name+'(');
  assert.ok(start>=0,name+' exists');
  const next=source.indexOf('\n  function ',start+4);
  return source.slice(start,next<0?source.length:next);
}
function run(names,context){vm.createContext(context);for(const name of names)vm.runInContext(extract(name),context);return context;}

test('normal recovery points at the exact next set and stops after the final set',()=>{
  const log={exercises:{a:{sets:[{done:true},{done:false}]},b:{sets:[{done:false}]}}};
  const c=run(['nextWorkoutStep','stepLabel'],{activeDay:{exercises:[{id:'a',name:'Bench',rest:150,sets:[{},{}]},{id:'b',name:'Row',rest:120,sets:[{}]}]},currentLog:()=>log});
  assert.equal(c.stepLabel(c.nextWorkoutStep(0,0)),'Bench · Set 2/2');
  log.exercises.a.sets[1].done=true;
  assert.equal(c.stepLabel(c.nextWorkoutStep(0,1)),'Row · Set 1/1');
  log.exercises.b.sets[0].done=true;
  assert.equal(c.nextWorkoutStep(1,0),null);
});

test('supersets alternate before resting and rest-pause uses a 15-second mini-set recovery',()=>{
  const log={exercises:{a:{sets:[{done:true},{}]},b:{sets:[{},{}]}}};
  const c=run(['nextWorkoutStep'],{activeDay:{exercises:[{id:'a',rest:90,supersetGroup:'pair',sets:[{},{}]},{id:'b',rest:90,supersetGroup:'pair',sets:[{},{}]}]},currentLog:()=>log});
  let next=c.nextWorkoutStep(0,0);assert.equal(next.ei,1);assert.equal(next.rest,0);
  log.exercises.b.sets[0].done=true;next=c.nextWorkoutStep(1,0);assert.equal(next.ei,0);assert.equal(next.si,1);assert.equal(next.rest,90);
  c.activeDay.exercises[0].supersetGroup=null;c.activeDay.exercises[0].sets[1].mini=true;
  assert.equal(c.nextWorkoutStep(0,0).rest,15);
});

test('exercise completion does not require optional effort but still requires enabled drop sets',()=>{
  const c=run(['exerciseComplete'],{}),e={id:'a',sets:[{},{}]},log={exercises:{a:{sets:[{done:true},{done:true}]}}};
  assert.equal(c.exerciseComplete(e,log,0),true);
  log.exercises.a.dropSet={enabled:true,done:false};assert.equal(c.exerciseComplete(e,log,0),false);
  log.exercises.a.dropSet.done=true;assert.equal(c.exerciseComplete(e,log,0),true);
});

test('elapsed time starts with the first completed set, includes background time and stops at Finish',()=>{
  let now=Date.parse('2026-10-26T10:00:00Z');const c=run(['sessionSeconds'],{Date:{parse:Date.parse,now:()=>now}}),log={};
  assert.equal(c.sessionSeconds(log),0);
  log.firstSetCompletedAt='2026-10-26T10:00:00Z';now+=45*60000;assert.equal(c.sessionSeconds(log),2700);
  log.completedAt='2026-10-26T10:45:00Z';now+=24*60*60000;assert.equal(c.sessionSeconds(log),2700);
});

function planFixture(){
  const item={id:'press',name:'Press',primary:['Chest'],equipment:'machine',unit:'reps',pattern:'chestPress',level:'beginner'};
  const c=run(['areAntagonists','validateWeekPlan'],{state:{},itemFor:e=>e.catalogId==='press'?item:null,LIFT_CATALOGUE:{find:()=>item},LIFT_ENGINE:{descriptor:(item,id,state,{sets})=>({id,catalogId:item.id,muscle:'Chest',sets:Array.from({length:sets},()=>({min:6,max:12}))}),minutes:()=>55}});
  const input={count:3,week:2,experience:'intermediate',catalogue:['press','row','squat'].map(id=>({id,weight:20,step:2.5,minReps:6,maxReps:12,equipment:'machine',pattern:'chestPress'}))};
  const raw={summary:'Progress gradually',days:Array.from({length:3},()=>({name:'Upper',exercises:input.catalogue.map(c=>({catalogId:c.id,sets:3,reps:8,weight:20,rest:90,rir:2}))}))};return {c,input,raw};
}
test('weekly plan validation rejects unknown exercises, excessive loads, incomplete plans and unsafe techniques',()=>{
  const {c,input,raw}=planFixture();assert.equal(c.validateWeekPlan(raw,input).days.length,3);
  const invalid=structuredClone(raw);invalid.days[0].exercises[0].weight=100;assert.throws(()=>c.validateWeekPlan(invalid,input),/incompatible/);
  invalid.days[0].exercises[0].weight=20;invalid.days[0].exercises[0].catalogId='invented';assert.throws(()=>c.validateWeekPlan(invalid,input),/incompatible/);
  assert.throws(()=>c.validateWeekPlan({days:[]},input),/number/);
  invalid.days[0].exercises[0]={...raw.days[0].exercises[0],restPause:true};assert.throws(()=>c.validateWeekPlan(invalid,input),/rest-pause/);
  for(const minutes of [40,70]){c.LIFT_ENGINE.minutes=()=>minutes;assert.equal(c.validateWeekPlan(raw,input).days[0].minutes,minutes);} c.LIFT_ENGINE.minutes=()=>39;assert.throws(()=>c.validateWeekPlan(raw,input),/40.*70/); c.LIFT_ENGINE.minutes=()=>71;assert.throws(()=>c.validateWeekPlan(raw,input),/40–70/);
});

test('failed storage leaves both current week and archived weeks unchanged',()=>{
  const initial={week:4,endedWeeks:{},weekPlans:{},nutrition:{profile:{},weightChecks:[]}};
  const elements={'#endweek-weight':{value:'75'},'#next-week-days':{value:'3'}};
  const c=run(['commitEndWeek'],{state:initial,pendingWeekPlan:{plan:{days:[]}},days:[],LIFT_ENGINE:{clone:structuredClone},$:id=>elements[id],endWeekWeightDate:()=> '2026-10-26',snapshotKey:()=> '4:0',logFor:()=>null,KEY:'test',localStorage:{setItem(){throw Error('Full');}},showToast(){}});
  c.commitEndWeek();assert.equal(c.state,initial);assert.equal(c.state.week,4);assert.deepEqual(c.state.endedWeeks,{});assert.ok(c.pendingWeekPlan);
});

test('weekly Worker authenticates, validates targets and preserves retryable errors',async()=>{
  const token='test-token',data={count:3,catalogue:[{id:'press',weight:20,step:2.5,minReps:6,maxReps:12}]};
  const req=(auth=token)=>new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({data})});
  let calls=0;const env={APP_TOKEN:token,AI:{run:async()=>{calls++;return {response:JSON.stringify({days:[]})};}}};
  assert.equal((await worker.fetch(req('wrong'),env)).status,401);assert.equal(calls,0);
  let response=await worker.fetch(req(),env);assert.equal(response.status,503);assert.equal((await response.json()).code,'WEEK_PLAN_FAILED');
  env.AI.run=async()=>({response:JSON.stringify({days:Array.from({length:3},()=>({name:'Upper',exercises:Array.from({length:3},()=>({catalogId:'press',weight:1000,reps:8,sets:3}))}))})});
  response=await worker.fetch(req(),env);assert.equal(response.status,503);
});

test('weekly Worker returns a complete valid programme within the actual duration budget',async()=>{
  const catalogue=['press','row','squat'].map(id=>({id,weight:20,step:2.5,minReps:6,maxReps:12,primary:[id==='row'?'Back':id==='press'?'Chest':'Quadriceps'],equipment:'machine',pattern:id}));
  const plan={summary:'Build gradually',days:Array.from({length:3},()=>({name:'Full body',exercises:catalogue.map(c=>({catalogId:c.id,sets:4,reps:8,weight:20,rest:180,rir:2}))}))};
  const request=new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data:{count:3,catalogue,experience:'intermediate'}})});
  const response=await worker.fetch(request,{APP_TOKEN:'test-token',AI:{run:async()=>({response:JSON.stringify(plan)})}});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.plan.days.length,3);assert.equal(result.rulesVersion,'weekly-v3');
});

test('leaving the workout view does not stop the elapsed session measurement',()=>{
  let stopped=0,screen='workout';const log={firstSetCompletedAt:'2026-10-26T10:00:00Z'};
  const c=run(['closeWorkout','sessionSeconds'],{activeDay:{id:'d1'},stopRestTimer:()=>stopped++,setScreen:value=>{screen=value;},Date:{parse:Date.parse,now:()=>Date.parse('2026-10-26T10:10:00Z')}});
  c.closeWorkout();assert.equal(c.activeDay,null);assert.equal(screen,'home-screen');assert.equal(stopped,1);assert.equal(c.sessionSeconds(log),600);
});

test('closing the week-generation dialog discards a late AI response without committing',async()=>{
  const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{value:id==='#endweek-weight'?'75':'3',disabled:false,hidden:false,textContent:'',classList:{add(){},remove(){},contains(){return id==='#endweek-modal'&&closed;}},setAttribute(){}});return elements.get(id);};
  let closed=false,resolve,commits=0;
  const response=new Promise(r=>{resolve=r;});
  const c=run(['confirmEndWeek'],{state:{week:1},weekRequest:null,weekRequestVersion:0,$:element,showToast(){},AbortController,window:{LiftNutrition:{hasAISetup:()=>true,requestAI:()=>response}},weekPlanInput:()=>({count:3}),validateWeekPlan:()=>({days:[]}),commitEndWeek:()=>commits++});
  const pending=c.confirmEndWeek();closed=true;resolve({plan:{days:[]}});await pending;assert.equal(commits,0);assert.equal(c.state.week,1);assert.equal(c.weekRequest,null);
});
