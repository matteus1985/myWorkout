import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={window:{}};vm.createContext(context);
for(const file of ['catalogue.js','exercise-gif-map.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
context.LIFT_CATALOGUE=context.window.LIFT_CATALOGUE;
vm.runInContext(readFileSync(new URL('../planner.js',import.meta.url),'utf8'),context);
const engine=context.window.LIFT_ENGINE,catalogue=context.LIFT_CATALOGUE;
const state=(days=5)=>({daysPerWeek:days,experience:'advanced',week:2,equipment:['barbell','dumbbell','machine','smith','cable','bodyweight','band'],weightSteps:{barbell:2.5,dumbbell:2,machine:2.5,smith:2.5,cable:1,bodyweight:1,band:.5},logs:{},weekPlans:{},priorityMuscles:['Abs'],lowerFocusMuscles:[],persistentEdits:{}});

test('local plans cover the requested 3–6 sessions within the duration and equipment limits',()=>{
  for(const count of [3,4,5,6]){const s=state(count),plan=engine.generate(s);assert.equal(plan.days.length,count);for(const d of plan.days){assert.ok(d.exercises.length>=4&&d.exercises.length<=10);assert.ok(d.minutes>=40&&d.minutes<=70);for(const e of d.exercises){const item=catalogue.find(e.catalogId);assert.ok(item&&s.equipment.includes(item.equipment));assert.ok(catalogue.levels.indexOf(item.level)<=catalogue.levels.indexOf(s.experience));}if(count===3){const primary=d.exercises.flatMap(e=>catalogue.find(e.catalogId).primary);assert.ok(primary.includes('Chest')&&primary.includes('Back'));assert.ok(primary.some(m=>['Quadriceps','Hamstrings','Glutes'].includes(m)));}}}
});

test('progression uses completed history and top/back-off sets retain distinct weights',()=>{
  const s=state(),item=catalogue.find('Incline Barbell Bench Press');assert.ok(item);s.logs['1-d1']={updatedAt:'2026-01-01',exercises:{x:{catalogId:item.id,effort:2,sets:Array.from({length:3},()=>({weight:20,reps:12,done:true}))}}};
  const target=engine.targets(s,item,Array.from({length:3},()=>({weight:null,min:6,max:12})));assert.equal(target.sets[0].weight,22.5);
  const plan=engine.generate(s),exercise=plan.days.flatMap(d=>d.exercises).find(e=>e.catalogId===item.id);assert.ok(exercise);assert.equal(exercise.sets[0].role,'top');assert.equal(exercise.sets[1].role,'backoff');assert.ok(exercise.sets[1].weight<exercise.sets[0].weight);
});

test('equipment and level filters hold for different profiles',()=>{
  for(const level of ['beginner','intermediate','advanced']){const s=state();s.experience=level;s.equipment=['dumbbell','bodyweight'];const plan=engine.generate(s);for(const day of plan.days)for(const exercise of day.exercises){const item=catalogue.find(exercise.catalogId);assert.ok(s.equipment.includes(item.equipment));assert.ok(catalogue.levels.indexOf(item.level)<=catalogue.levels.indexOf(level));}}
});

test('an incomplete session does not trigger a load increase',()=>{
  const s=state(),item=catalogue.find('Incline Barbell Bench Press');s.logs['1-d1']={updatedAt:'2026-01-01',exercises:{x:{catalogId:item.id,effort:2,sets:[{weight:20,reps:12,done:true},{weight:20,reps:12,done:true},{weight:20,reps:12,done:false}]}}};
  const target=engine.targets(s,item,Array.from({length:3},()=>({weight:null,min:6,max:12})));assert.equal(target.sets[0].weight,20);
});

test('plan generation no longer sends weekly plan requests and retains snapshots by revision',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.doesNotMatch(app,/requestAI\(['"]weekly-plan/);assert.match(app,/next\.planRevision=\(Number\(next\.planRevision\)\|\|0\)\+1/);assert.match(app,/next\.weekPlans\[next\.week\+':'\+next\.planRevision\]=plan/);
});

test('end of week generates locally with the requested days and weight',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),start=app.indexOf('  function confirmEndWeek('),end=app.indexOf('  function endWeek(',start);
  const elements={'#endweek-weight':{value:'73'},'#next-week-days':{value:'3'}},current=state(5);current.nutrition={profile:{}};let committed=0;
  const ctx={state:current,LIFT_ENGINE:engine,pendingWeekPlan:null,$:id=>elements[id],showToast(){},commitEndWeek(){committed++;}};
  vm.createContext(ctx);vm.runInContext(app.slice(start,end),ctx);ctx.confirmEndWeek();assert.equal(committed,1);assert.equal(ctx.pendingWeekPlan.plan.days.length,3);assert.equal(ctx.pendingWeekPlan.plan.week,current.week+1);assert.equal(current.week,2);
});

test('replacing a plan preserves history, while an active workout postpones the replacement',async()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),start=app.indexOf('  async function generateCurrentAIPlan('),end=app.indexOf('  async function commentOnWorkout(',start);
  const prior={completed:true,exercises:{x:{sets:[{done:true,weight:20,reps:8}]}}},oldPlan={days:[{id:'d1'}]},saved=[];
  const base={week:2,planRevision:0,daysPerWeek:3,experience:'advanced',logs:{'2-d1':prior},weekPlans:{'2:0':oldPlan}};
  const plan={days:Array.from({length:3},(_,i)=>({id:'d'+i,minutes:45,exercises:[{},{},{},{}]}))};
  const ctx={state:structuredClone(base),days:oldPlan.days,activeDay:null,currentPlanBusy:false,CATALOGUE_MIGRATION:'local-hypertrophy-v1',LIFT_ENGINE:{clone:structuredClone,generate:()=>plan},localStorage:{setItem:(key,value)=>saved.push(JSON.parse(value))},KEY:'test',$:()=>({disabled:false,textContent:''}),renderSettings(){},updateHome(){},updateProgressScreen(){},showToast(){},saveState(){}};
  vm.createContext(ctx);vm.runInContext(app.slice(start,end),ctx);await ctx.generateCurrentAIPlan({},true);
  assert.equal(ctx.state.planRevision,1);assert.deepEqual(ctx.state.logs,base.logs);assert.deepEqual(ctx.state.weekPlans['2:0'],oldPlan);assert.equal(saved.length,1);
  ctx.state=structuredClone(base);ctx.activeDay={id:'d1'};saved.length=0;await ctx.generateCurrentAIPlan({daysPerWeek:4},true);assert.equal(ctx.state.planRevision,0);assert.equal(ctx.state.pendingLocalPlan.daysPerWeek,4);assert.equal(saved.length,0);
});
