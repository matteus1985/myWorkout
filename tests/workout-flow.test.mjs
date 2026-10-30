import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/src/index.mjs';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const splitTitles=count=>({3:['Full Body A','Full Body B','Full Body C'],4:['Upper A','Lower A','Upper B','Lower B'],5:['Push A','Pull A','Legs A','Upper B','Lower B'],6:['Push A','Pull A','Legs A','Push B','Pull B','Legs B']})[count];
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

test('exercise completion does not require optional effort or an optional drop set',()=>{
  const c=run(['exerciseComplete'],{}),e={id:'a',sets:[{},{}]},log={exercises:{a:{sets:[{done:true},{done:true}]}}};
  assert.equal(c.exerciseComplete(e,log,0),true);
  log.exercises.a.dropSet={enabled:true,done:false};assert.equal(c.exerciseComplete(e,log,0),true);
  log.exercises.a.dropSet.done=true;assert.equal(c.exerciseComplete(e,log,0),true);
});

test('elapsed time starts with the first completed set, includes background time and stops at Finish',()=>{
  let now=Date.parse('2026-10-26T10:00:00Z');const c=run(['sessionSeconds'],{Date:{parse:Date.parse,now:()=>now}}),log={};
  assert.equal(c.sessionSeconds(log),0);
  log.firstSetCompletedAt='2026-10-26T10:00:00Z';assert.equal(c.sessionSeconds(log),120);now+=45*60000;assert.equal(c.sessionSeconds(log),2820);
  log.completedAt='2026-10-26T10:45:00Z';now+=24*60*60000;assert.equal(c.sessionSeconds(log),2820);
});

function planFixture(){
  const item={id:'press',name:'Press',primary:['Chest'],equipment:'machine',unit:'reps',pattern:'chestPress',level:'beginner'};
  const catalogue=['press','row','squat','curl','pulldown'].map((id,index)=>({id,primary:[['Chest'],['Back'],['Quadriceps'],['Biceps'],['Back']][index],weight:20,step:2.5,minReps:6,maxReps:12,equipment:'machine',pattern:'chestPress'}));
  const items={exercises:catalogue,find:id=>catalogue.find(item=>item.id===id)};
  const c=run(['weekSplitTitles','areAntagonists','validateWeekPlan'],{state:{},itemFor:e=>items.find(e.catalogId),LIFT_CATALOGUE:items,LIFT_ENGINE:{descriptor:(item,id,state,{sets})=>({id,catalogId:item.id,muscle:item.primary[0],sets:Array.from({length:sets},()=>({min:6,max:12}))}),minutes:()=>55}});
  const input={count:3,week:2,experience:'intermediate',catalogue};
  const raw={summary:'Progress gradually',days:Array.from({length:3},(_,index)=>({name:splitTitles(3)[index],exercises:input.catalogue.map(c=>({catalogId:c.id,sets:3,reps:8,weight:20,rest:90,rir:2}))}))};return {c,input,raw};
}
test('weekly plan validation rejects unknown exercises, excessive loads, incomplete plans and unsafe techniques',()=>{
  const {c,input,raw}=planFixture();assert.equal(c.validateWeekPlan(raw,input).days.length,3);
  const fourExercises=structuredClone(raw);fourExercises.days[0].exercises=fourExercises.days[0].exercises.slice(0,4);assert.equal(c.validateWeekPlan(fourExercises,input).days[0].exercises.length,4);
  const tooMany=structuredClone(raw);tooMany.days[0].exercises=Array.from({length:11},(_,i)=>({...raw.days[0].exercises[i%raw.days[0].exercises.length],catalogId:'press-'+i}));assert.throws(()=>c.validateWeekPlan(tooMany,input),/incomplete workout/);
  const wrongTitle=structuredClone(raw);wrongTitle.days[0].name='Push A';assert.throws(()=>c.validateWeekPlan(wrongTitle,input),/must be named Full Body A/);
  const missingBody=structuredClone(raw);missingBody.days[0].exercises=missingBody.days[0].exercises.filter(exercise=>exercise.catalogId!=='squat');assert.throws(()=>c.validateWeekPlan(missingBody,input),/upper push, upper pull and lower body/);
  const invalid=structuredClone(raw);invalid.days[0].exercises[0].weight=100;assert.throws(()=>c.validateWeekPlan(invalid,input),/incompatible/);
  invalid.days[0].exercises[0].weight=20;invalid.days[0].exercises[0].catalogId='invented';assert.throws(()=>c.validateWeekPlan(invalid,input),/incompatible/);
  assert.throws(()=>c.validateWeekPlan({days:[]},input),/number/);
  invalid.days[0].exercises[0]={...raw.days[0].exercises[0],restPause:true};assert.throws(()=>c.validateWeekPlan(invalid,input),/rest-pause/);
  for(const minutes of [40,70]){c.LIFT_ENGINE.minutes=()=>minutes;assert.equal(c.validateWeekPlan(raw,input).days[0].minutes,minutes);} c.LIFT_ENGINE.minutes=()=>39;assert.throws(()=>c.validateWeekPlan(raw,input),/40.*70/); c.LIFT_ENGINE.minutes=()=>71;assert.throws(()=>c.validateWeekPlan(raw,input),/40–70/);
});

test('failed storage leaves both current week and archived weeks unchanged',()=>{
  const initial={week:4,endedWeeks:{},weekPlans:{},nutrition:{profile:{},weightChecks:[]}};
  const elements={'#endweek-weight':{value:'75'},'#next-week-days':{value:'3'}};
  const c=run(['clearWeekWorkoutReviews','commitEndWeek'],{state:initial,pendingWeekPlan:{plan:{days:[]}},days:[],LIFT_ENGINE:{clone:structuredClone},updateDropSuggestion(){},$:id=>elements[id],endWeekWeightDate:()=> '2026-10-26',snapshotKey:()=> '4:0',logFor:()=>null,KEY:'test',localStorage:{setItem(){throw Error('Full');}},showToast(){}});
  c.commitEndWeek();assert.equal(c.state,initial);assert.equal(c.state.week,4);assert.deepEqual(c.state.endedWeeks,{});assert.ok(c.pendingWeekPlan);
});

test('new week removes only archived-week AI recap data and Home recap selection is current-week-only',()=>{
  const logs={'27-d1':{completed:true,dayName:'Old',aiComment:'Old recap',aiCommentStatus:'ready',aiReviewProgress:{done:2,planned:3,pct:67},exercises:{press:{sets:[{done:true}]}}},'26-d1':{completed:true,aiComment:'Older history',aiCommentStatus:'ready'},'28-d1':{completed:true,aiComment:'Current',aiCommentStatus:'ready',completedAt:'2026-10-28'}};
  const c=run(['clearWeekWorkoutReviews','latestWorkoutReview','calendarPeriods','workoutLogDate','hasDone','isoWeekInfo','progressDateStart'],{});c.clearWeekWorkoutReviews(logs,27);
  assert.equal(logs['27-d1'].aiComment,undefined);assert.equal(logs['27-d1'].aiCommentStatus,undefined);assert.equal(logs['27-d1'].aiReviewProgress,undefined);assert.deepEqual(logs['27-d1'].exercises.press.sets,[{done:true}]);
  assert.equal(logs['26-d1'].aiComment,'Older history');assert.equal(c.latestWorkoutReview(logs,new Date('2026-10-28T12:00:00')).aiComment,'Current');assert.equal(c.latestWorkoutReview(logs,new Date('2026-10-20T12:00:00')),null);
});

test('weekly Worker authenticates, validates targets and preserves retryable errors',async()=>{
  const token='test-token',data={count:3,catalogue:[{id:'press',weight:20,step:2.5,minReps:6,maxReps:12}]};
  const req=(auth=token)=>new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({data})});
  let calls=0;const env={APP_TOKEN:token,AI:{run:async()=>{calls++;return {response:JSON.stringify({days:[]})};}}};
  assert.equal((await worker.fetch(req('wrong'),env)).status,401);assert.equal(calls,0);
  let response=await worker.fetch(req(),env);assert.equal(response.status,503);const failure=await response.json();assert.equal(failure.code,'WEEK_PLAN_FAILED');assert.equal(failure.diagnostics.stage,'validation');assert.ok(failure.requestId);
  env.AI.run=async()=>({response:JSON.stringify({days:Array.from({length:3},()=>({name:'Upper',exercises:Array.from({length:3},()=>({catalogId:'press',weight:1000,reps:8,sets:3}))}))})});
  response=await worker.fetch(req(),env);assert.equal(response.status,503);
});

test('weekly Worker returns a complete valid programme within the actual duration budget',async()=>{
  const catalogue=['press','row','squat','curl','pulldown'].map(id=>({id,weight:20,step:2.5,minReps:6,maxReps:12,primary:[id==='row'||id==='pulldown'?'Back':id==='press'?'Chest':id==='squat'?'Quadriceps':'Biceps'],equipment:'machine',pattern:id}));
  const plan={summary:'Build gradually',days:Array.from({length:3},(_,index)=>({name:splitTitles(3)[index],exercises:catalogue.map(c=>({catalogId:c.id,sets:4,reps:8,weight:20,rest:180,rir:2}))}))};
  const request=new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data:{count:3,catalogue,experience:'intermediate'}})});
  const response=await worker.fetch(request,{APP_TOKEN:'test-token',AI:{run:async()=>({response:JSON.stringify(plan)})}});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.plan.days.length,3);assert.deepEqual(result.plan.days.map(day=>day.name),splitTitles(3));assert.equal(result.rulesVersion,'weekly-v9');
});

test('weekly Worker rotates a recent accessory to a compatible alternative and preserves compounds',async()=>{
  const catalogue=[
    {id:'press',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Chest'],equipment:'machine',pattern:'chestPress'},
    {id:'row',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Back'],equipment:'machine',pattern:'row'},
    {id:'squat',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Quadriceps'],equipment:'machine',pattern:'squat'},
    {id:'curl',weight:10,step:1,minReps:8,maxReps:15,primary:['Biceps'],equipment:'cable',pattern:'curl'},
    {id:'curl-alt',weight:10,step:1,minReps:8,maxReps:15,primary:['Biceps'],equipment:'cable',pattern:'curl'},
    {id:'pulldown',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Back'],equipment:'machine',pattern:'verticalPull'}
  ];
  const days=splitTitles(3).map(name=>({name,exercises:catalogue.filter(item=>item.id!=='curl-alt').map(item=>({catalogId:item.id,sets:3,reps:10,weight:item.weight,rest:90,rir:2}))}));
  const data={count:3,catalogue,experience:'intermediate',recentAccessoryIds:['curl']};
  const request=new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data})});
  const response=await worker.fetch(request,{APP_TOKEN:'test-token',AI:{run:async()=>({response:JSON.stringify({summary:'Rotate accessories',days})})}});
  assert.equal(response.status,200);const result=await response.json();
  assert.equal(result.plan.days[0].exercises.some(item=>item.catalogId==='curl-alt'),true);
  assert.equal(result.plan.days[0].exercises.some(item=>item.catalogId==='curl'),false);
  assert.equal(result.diagnostics.rotatedAccessories,3);
  assert.equal(result.plan.days[0].exercises.some(item=>item.catalogId==='press'),true);
});

test('three-day full-body plans are rejected when a session misses a major movement group',async()=>{
 const catalogue=[{id:'press',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Chest']},{id:'row',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Back']},{id:'squat',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Quadriceps']},{id:'curl',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Biceps']},{id:'shoulder',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Front delts']}];
 const days=splitTitles(3).map(name=>({name,exercises:catalogue.map(c=>({catalogId:c.id,sets:3,reps:8,weight:20,rest:240,rir:2}))}));days[1].exercises=days[1].exercises.filter(e=>e.catalogId!=='squat').concat({catalogId:'curl',sets:3,reps:8,weight:20,rest:240,rir:2});
 const response=await worker.fetch(new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data:{count:3,catalogue}})}),{APP_TOKEN:'test-token',AI:{run:async()=>({response:JSON.stringify({days})})}});
 const result=await response.json();assert.equal(response.status,503);assert.match(result.error,/full-body session/);
});

test('weekly Worker keeps the programme when an optional superset is not antagonistic',async()=>{
  const catalogue=[
    {id:'press-a',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Chest'],equipment:'machine',pattern:'chestPress'},
    {id:'press-b',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Chest'],equipment:'machine',pattern:'chestPress'},
    {id:'squat',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Quadriceps'],equipment:'machine',pattern:'squat'},
    {id:'row',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Back'],equipment:'machine',pattern:'row'},
    {id:'curl',weight:20,step:2.5,minReps:6,maxReps:12,primary:['Biceps'],equipment:'machine',pattern:'curl'}
  ];
  const plan={summary:'Build gradually',days:Array.from({length:3},(_,index)=>({name:splitTitles(3)[index],exercises:catalogue.map(c=>({catalogId:c.id,sets:4,reps:8,weight:20,rest:180,rir:2,supersetGroup:c.id==='squat'?null:'invalid-pair'}))}))};
  const request=new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data:{count:3,catalogue,experience:'intermediate'}})});
  const response=await worker.fetch(request,{APP_TOKEN:'test-token',AI:{run:async()=>({response:JSON.stringify(plan)})}});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.plan.days.length,3);assert.equal(result.plan.days[0].exercises[0].supersetGroup,null);assert.equal(result.plan.days[0].exercises[1].supersetGroup,null);
});

test('leaving the workout view does not stop the elapsed session measurement',()=>{
  let stopped=0,screen='workout';const log={firstSetCompletedAt:'2026-10-26T10:00:00Z'};
  const c=run(['closeWorkout','sessionSeconds'],{activeDay:{id:'d1'},stopRestTimer:()=>stopped++,setScreen:value=>{screen=value;},Date:{parse:Date.parse,now:()=>Date.parse('2026-10-26T10:10:00Z')}});
  c.closeWorkout();assert.equal(c.activeDay,null);assert.equal(screen,'home-screen');assert.equal(stopped,1);assert.equal(c.sessionSeconds(log),720);
});

test('closing the week-generation dialog discards a late AI response without committing',async()=>{
  const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{value:id==='#endweek-weight'?'75':'3',disabled:false,hidden:false,textContent:'',classList:{add(){},remove(){},contains(){return id==='#endweek-modal'&&closed;}},setAttribute(){}});return elements.get(id);};
  let closed=false,resolve,commits=0;
  const response=new Promise(r=>{resolve=r;});
  const c=run(['confirmEndWeek'],{state:{week:1},weekRequest:null,weekRequestVersion:0,$:element,showToast(){},AbortController,window:{LiftNutrition:{hasAISetup:()=>true,requestAI:()=>response}},weekPlanInput:()=>({count:3}),validateWeekPlan:()=>({days:[]}),commitEndWeek:()=>commits++});
  const pending=c.confirmEndWeek();closed=true;resolve({plan:{days:[]}});await pending;assert.equal(commits,0);assert.equal(c.state.week,1);assert.equal(c.weekRequest,null);
});


function realPlannerContext(){
 const context={window:{}};vm.createContext(context);
 vm.runInContext(readFileSync(new URL('../catalogue.js',import.meta.url),'utf8'),context);
 context.LIFT_CATALOGUE=context.window.LIFT_CATALOGUE;
 vm.runInContext(readFileSync(new URL('../planner.js',import.meta.url),'utf8'),context);
 context.LIFT_ENGINE=context.window.LIFT_ENGINE;context.state={experience:'intermediate',week:27,logs:{},weightSteps:{}};
 context.itemFor=e=>context.LIFT_CATALOGUE.find(e.catalogId);context.snapshotKey=()=> '27:0';
 return run(['weekSplitTitles','areAntagonists','validateWeekPlan'],context);
}

test('weekly plans normalize model targets and pass the real app validator for 3, 4, 5 and 6 sessions',async()=>{
 for(const count of [3,4,5,6]){
  const context=realPlannerContext();
  const items=['flat-barbell-bench-press','seated-cable-row','leg-extension'].map(id=>context.LIFT_CATALOGUE.find(id));items.push(context.LIFT_CATALOGUE.exercises.find(item=>item.pattern==='lateralRaise'),context.LIFT_CATALOGUE.exercises.find(item=>item.pattern==='verticalPull'));
  assert.ok(items.every(Boolean));
  const catalogue=items.map(item=>({...item,weight:7.5,step:2.5,minReps:6,maxReps:12}));
  const input={count,week:28,experience:'intermediate',catalogue:items.map(item=>({...item,weight:7.5,step:2.5,minReps:6,maxReps:12}))};
  const raw={days:Array.from({length:count},(_,index)=>({name:splitTitles(count)[index],exercises:input.catalogue.map(c=>({catalogId:c.id,sets:'3',reps:'15',weight:'999',rest:'45',rir:'2'}))}))};
  let calls=0;
  const response=await worker.fetch(new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data:input})}),{APP_TOKEN:'test-token',AI:{run:async()=>{calls++;return {response:JSON.stringify(raw)};}}});
  const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));assert.equal(calls,1);
  const accepted=context.validateWeekPlan(result.plan,input);assert.equal(accepted.days.length,count);
  for(const day of accepted.days){assert.ok(day.minutes>=40&&day.minutes<=70);assert.equal(day.exercises.length,5);for(const e of day.exercises){assert.equal(e.sets[0].weight,10);assert.equal(e.sets[0].target,12);assert.ok(e.rest>=45&&e.rest<=150);}}
 }
});

test('weekly Worker identifies an unreadable target without logging or exposing the model response',async()=>{
 const catalogue=['press','row','squat','curl','pulldown'].map(id=>({id,weight:20,step:2.5,minReps:6,maxReps:12,primary:id==='press'?['Chest']:id==='row'||id==='pulldown'?['Back']:id==='squat'?['Quadriceps']:['Biceps']}));
 const plan={days:Array.from({length:3},(_,index)=>({name:splitTitles(3)[index],exercises:catalogue.map(c=>({catalogId:c.id,sets:4,reps:8,weight:'twenty',rest:180}))}))};
 const response=await worker.fetch(new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data:{count:3,catalogue}})}),{APP_TOKEN:'test-token',AI:{run:async()=>({response:JSON.stringify(plan)})}});
 const result=await response.json();assert.equal(response.status,503);assert.match(result.error,/Workout 1, exercise 1.*unreadable weight/);assert.doesNotMatch(result.error,/twenty/);assert.ok(result.requestId);
});


function weeklyReferenceFixture(count=6){
 const context=realPlannerContext(),catalogue=context.LIFT_CATALOGUE.exercises.slice(0,6).map(item=>{
  const exercise=context.LIFT_ENGINE.descriptor(item,'candidate',context.state,{baseline:true});
  return {...item,weight:20,step:2.5,minReps:exercise.sets[0].min,maxReps:exercise.sets[0].max,history:[]};
 });
 const data={count,week:28,experience:'intermediate',catalogue};
 const plan={days:Array.from({length:count},(_,index)=>({name:splitTitles(count)[index],exercises:catalogue.map((c,i)=>({exerciseRef:'E'+(i+1),sets:3,reps:c.minReps,weight:20,rest:120,rir:2}))}))};
 return {context,data,plan};
}

async function generateWeeklyFixture(data,plan){
 let calls=0,prompt='';
 const response=await worker.fetch(new Request('https://worker.example/weekly-plan',{method:'POST',headers:{Authorization:'Bearer test-token','Content-Type':'application/json'},body:JSON.stringify({data})}),{APP_TOKEN:'test-token',AI:{run:async(model,input)=>{calls++;prompt=input.messages[0].content;return {response:JSON.stringify(plan)};}}});
 return {response,result:await response.json(),calls,prompt};
}

test('six-day week survives an unavailable sixth exercise in workout five and passes the actual app validator',async()=>{
 const {context,data,plan}=weeklyReferenceFixture();plan.days[4].exercises[5].exerciseRef='E999';
 const {response,result,calls,prompt}=await generateWeeklyFixture(data,plan);
 assert.equal(response.status,200,JSON.stringify(result));assert.equal(calls,1);
 assert.equal(result.plan.days.length,6);assert.equal(result.plan.days[4].exercises.length,5);assert.equal(result.diagnostics.omittedExercises,1);
 assert.ok(result.plan.days.every(day=>day.exercises.every(e=>data.catalogue.some(item=>item.id===e.catalogId))));
 const accepted=context.validateWeekPlan(result.plan,data);assert.equal(accepted.days.length,6);assert.equal(context.state.week,27);
 const sent=JSON.parse(prompt.slice(prompt.lastIndexOf('Data: ')+6));assert.equal(sent.catalogue[0].exerciseRef,'E1');assert.equal(sent.catalogue[0].id,undefined);
 assert.match(prompt,/exerciseRef,sets/);assert.ok(accepted.days.every(day=>day.minutes>=40&&day.minutes<=70));
});

test('weekly catalogue names and ID formatting resolve uniquely while duplicate choices are removed',async()=>{
 const {context,data,plan}=weeklyReferenceFixture(4);
 for(const day of plan.days){
  day.exercises[0]={...day.exercises[0],exerciseRef:undefined,catalogId:data.catalogue[0].name.toUpperCase()};
  day.exercises[1]={...day.exercises[1],exerciseRef:undefined,name:data.catalogue[1].name};
  day.exercises[5]={...day.exercises[0]};
 }
 const {response,result}=await generateWeeklyFixture(data,plan);assert.equal(response.status,200,JSON.stringify(result));assert.equal(result.diagnostics.duplicateExercises,4);
 for(const day of result.plan.days){assert.equal(day.exercises[0].catalogId,data.catalogue[0].id);assert.equal(day.exercises[1].catalogId,data.catalogue[1].id);assert.equal(day.exercises.length,5);}
 assert.equal(context.validateWeekPlan(result.plan,data).days.length,4);
});

test('ambiguous catalogue names are never guessed, and insufficient available exercises remain a recoverable failure',async()=>{
 const {data,plan}=weeklyReferenceFixture(4);data.catalogue[0].name='Ambiguous press';data.catalogue[1].name='Ambiguous press';
 for(const day of plan.days)day.exercises[5]={...day.exercises[5],exerciseRef:undefined,name:'Ambiguous press'};
 let result=await generateWeeklyFixture(data,plan);assert.equal(result.response.status,200);assert.equal(result.result.diagnostics.omittedExercises,4);
 plan.days[0].exercises=plan.days[0].exercises.slice(0,3).concat({exerciseRef:'E999',sets:3,reps:8,weight:20,rest:120});
 result=await generateWeeklyFixture(data,plan);assert.equal(result.response.status,503);assert.match(result.result.error,/fewer than four available exercises/);assert.equal(result.result.plan,undefined);assert.equal(result.calls,1);
});
