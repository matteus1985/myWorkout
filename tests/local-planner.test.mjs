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

test('local plans cover the requested 4–6 sessions within the duration and equipment limits',()=>{
  for(const count of [4,5,6]){const s=state(count),plan=engine.generate(s),maxMinutes=count<=4?80:70;assert.equal(plan.days.length,count);const weekIds=plan.days.flatMap(day=>day.exercises.map(exercise=>exercise.catalogId));assert.equal(new Set(weekIds).size,weekIds.length,`${count} days: the same exercise must not repeat during the week`);for(const d of plan.days){assert.ok(d.exercises.length>=4&&d.exercises.length<=10);assert.ok(d.minutes>=40&&d.minutes<=maxMinutes);assert.ok(d.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Abs')).length<=1,`${count} days: ${d.name} has stacked ab isolations`);assert.ok(d.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Calves')).length<=1,`${count} days: ${d.name} has stacked calf exercises`);for(const e of d.exercises){const item=catalogue.find(e.catalogId);assert.ok(item&&s.equipment.includes(item.equipment));assert.ok(catalogue.levels.indexOf(item.level)<=catalogue.levels.indexOf(s.experience));}if(count===3){const primary=d.exercises.flatMap(e=>catalogue.find(e.catalogId).primary);assert.ok(primary.includes('Chest')&&primary.includes('Back'));assert.ok(primary.some(m=>['Quadriceps','Hamstrings','Glutes'].includes(m)));}}}
});

test('each supported priority gets direct work on at least two days without stacking calf isolations',()=>{
  const groups=[...new Set(catalogue.exercises.flatMap(item=>item.primary))];
  for(const count of [4,5,6])for(const muscle of groups){
    const s=state(count);s.priorityMuscles=[muscle];const target=muscle==='Core'?'Abs':muscle,plan=engine.generate(s),rows=plan.days.flatMap(day=>day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes(target)).map(e=>({day,e})));
    assert.ok(new Set(rows.map(row=>row.day.id)).size>=2,`${count} days: ${muscle} needs two focused days`);
    assert.ok(rows.reduce((sum,row)=>sum+row.e.sets.length,0)>=10,`${count} days: ${muscle} needs the planned priority volume`);
    const weekIds=plan.days.flatMap(day=>day.exercises.map(exercise=>exercise.catalogId));assert.equal(new Set(weekIds).size,weekIds.length,`${count} days with ${muscle} focus: repeated exercise`);
    for(const day of plan.days){assert.ok(day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Calves')).length<=1,`${count} days: ${day.name} has more than one direct calf exercise`);assert.ok(day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Abs')).length<=1,`${count} days: ${day.name} has stacked ab isolations`);}
  }
  for(const count of [4,5,6])for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){
    const pair=[groups[i],groups[j]],targets=[...new Set(pair.map(m=>m==='Core'?'Abs':m))];if(targets.length<2)continue;
    const s=state(count);s.priorityMuscles=pair;const plan=engine.generate(s);
    for(const muscle of targets){const rows=plan.days.flatMap(day=>day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes(muscle)).map(e=>({day,e})));assert.ok(new Set(rows.map(row=>row.day.id)).size>=2,`${count} days: combined focus ${pair} needs two days for ${muscle}`);assert.ok(rows.reduce((sum,row)=>sum+row.e.sets.length,0)>=10,`${count} days: combined focus ${pair} needs priority volume for ${muscle}`);}
    const weekIds=plan.days.flatMap(day=>day.exercises.map(exercise=>exercise.catalogId));assert.equal(new Set(weekIds).size,weekIds.length,`${count} days with focus ${pair}: repeated exercise`);
    for(const day of plan.days){assert.ok(day.exercises.length>=4&&day.exercises.length<=10&&day.minutes>=40&&day.minutes<=(count<=4?80:70),`${count} days: combined focus ${pair} made ${day.name} invalid`);assert.ok(day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Calves')).length<=1,`${count} days: ${day.name} has more than one direct calf exercise`);assert.ok(day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Abs')).length<=1,`${count} days: ${day.name} has stacked ab isolations`);}
  }
});

test('lower-focus settings preserve the same balanced weekly distribution for 4–6 days',()=>{
  const groups=[...new Set(catalogue.exercises.flatMap(item=>item.primary).filter(muscle=>muscle!=='Abs'&&muscle!=='Core'))];
  for(const count of [4,5,6])for(let i=0;i<groups.length;i++)for(let j=i;j<groups.length;j++){
    const focus=j===i?[groups[i]]:[groups[i],groups[j]],s=state(count);s.lowerFocusMuscles=focus;s.priorityMuscles=['Abs'];
    const plan=engine.generate(s),ids=plan.days.flatMap(day=>day.exercises.map(exercise=>exercise.catalogId));
    assert.equal(new Set(ids).size,ids.length,`${count} days, lower focus ${focus}: repeated exercise`);
    for(const day of plan.days){assert.ok(day.exercises.length>=4&&day.exercises.length<=10&&day.minutes>=40&&day.minutes<=(count<=4?80:70),`${count} days, lower focus ${focus}: invalid ${day.name}`);assert.ok(day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Calves')).length<=1,`${count} days, lower focus ${focus}: stacked calves in ${day.name}`);assert.ok(day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Abs')).length<=1,`${count} days, lower focus ${focus}: stacked abs in ${day.name}`);}
  }
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
  const elements={'#endweek-weight':{value:'73'},'#next-week-days':{value:'4'}},current=state(5);current.nutrition={profile:{}};let committed=0;
  const ctx={state:current,LIFT_ENGINE:engine,pendingWeekPlan:null,$:id=>elements[id],showToast(){},commitEndWeek(){committed++;}};
  vm.createContext(ctx);vm.runInContext(app.slice(start,end),ctx);ctx.confirmEndWeek();assert.equal(committed,1);assert.equal(ctx.pendingWeekPlan.plan.days.length,4);assert.equal(ctx.pendingWeekPlan.plan.week,current.week+1);assert.equal(current.week,2);
});

test('replacing a plan preserves history, while an active workout postpones the replacement',async()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),start=app.indexOf('  async function generateCurrentAIPlan('),end=app.indexOf('  async function commentOnWorkout(',start);
  const prior={completed:true,exercises:{x:{sets:[{done:true,weight:20,reps:8}]}}},oldPlan={days:[{id:'d1'}]},saved=[];
  const base={week:2,planRevision:0,daysPerWeek:4,experience:'advanced',logs:{'2-d1':prior},weekPlans:{'2:0':oldPlan}};
  const plan={days:Array.from({length:4},(_,i)=>({id:'d'+i,minutes:45,exercises:[{},{},{},{}]}))};
  const ctx={state:structuredClone(base),days:oldPlan.days,activeDay:null,currentPlanBusy:false,CATALOGUE_MIGRATION:'local-hypertrophy-v2',LIFT_ENGINE:{clone:structuredClone,generate:()=>plan},localStorage:{setItem:(key,value)=>saved.push(JSON.parse(value))},KEY:'test',$:()=>({disabled:false,textContent:''}),renderSettings(){},updateHome(){},updateProgressScreen(){},showToast(){},saveState(){}};
  vm.createContext(ctx);vm.runInContext(app.slice(start,end),ctx);await ctx.generateCurrentAIPlan({},true);
  assert.equal(ctx.state.planRevision,1);assert.deepEqual(ctx.state.logs,base.logs);assert.deepEqual(ctx.state.weekPlans['2:0'],oldPlan);assert.equal(saved.length,1);
  ctx.state=structuredClone(base);ctx.activeDay={id:'d1'};saved.length=0;await ctx.generateCurrentAIPlan({daysPerWeek:4},true);assert.equal(ctx.state.planRevision,0);assert.equal(ctx.state.pendingLocalPlan.daysPerWeek,4);assert.equal(saved.length,0);
});

test('six-week plans have two abdominal sessions, selective techniques and a lighter deload',()=>{
 for(const count of [4,5,6]){
  const s=state(count);s.priorityMuscles=[];const normal=engine.generate({...s,mesocycleWeek:1}),peak=engine.generate({...s,mesocycleWeek:4}),deload=engine.generate({...s,mesocycleWeek:6});
  const abs=normal.days.flatMap(d=>d.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Abs')));assert.equal(abs.length,2);assert.ok(abs.every(e=>e.sets.length>=4&&e.sets.length<=5));
  for(const day of normal.days){assert.ok(day.minutes>=45&&day.minutes<=75);assert.equal(day.optionalDropSet,-1);const glutes=day.exercises.filter(e=>catalogue.find(e.catalogId).primary.includes('Glutes'));assert.ok(glutes.length<=1,day.name);for(const e of day.exercises.slice(1))assert.ok(!e.sets.some(x=>x.role==='top'));}
  for(const day of peak.days)if(day.optionalDropSet>=0)assert.ok(!catalogue.find(day.exercises[day.optionalDropSet].catalogId).primary.includes('Abs'));
  for(let i=0;i<normal.days.length;i++)for(let j=0;j<normal.days[i].exercises.length;j++)assert.ok(deload.days[i].exercises[j].sets.length<=normal.days[i].exercises[j].sets.length);
  assert.ok(deload.days.every(d=>d.optionalDropSet===-1));
 }
});

test('quick swaps preserve movement and vary equipment, and future set counts match the exercise identity',()=>{
  const s=state(5),plan=engine.generate(s),day=plan.days[0],exercise=day.exercises[0];
  const source=catalogue.find(exercise.catalogId),used=day.exercises.map(e=>e.catalogId);
  const alternatives=engine.quickAlternatives(source,s,used);
  assert.ok(alternatives.length>0&&alternatives.length<=3);
  assert.equal(new Set(alternatives.map(x=>x.equipment)).size,alternatives.length);
  for(const item of alternatives){
    assert.equal(item.pattern,source.pattern);
    assert.equal(item.primary[0],source.primary[0]);
    assert.notEqual(item.equipment,source.equipment);
    assert.ok(!used.includes(item.id));
  }
  assert.equal(engine.quickAlternatives(source,{...s,equipment:[source.equipment]},used).length,0);
  s.persistentEdits[plan.programId]={[day.id]:{setCounts:[{id:exercise.id,catalogId:exercise.catalogId,count:4}]}};
  assert.equal(engine.generate(s).days[0].exercises[0].sets.length,4);
  s.persistentEdits[plan.programId][day.id].setCounts[0].catalogId='different-exercise';
  assert.equal(engine.generate(s).days[0].exercises[0].sets.length,exercise.sets.length);
});
