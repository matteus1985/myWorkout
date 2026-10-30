import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/src/index.mjs';
const source=fs.readFileSync('app.js','utf8');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('catalogue.js','utf8'),c);c.LIFT_CATALOGUE=c.window.LIFT_CATALOGUE;vm.runInContext(fs.readFileSync('planner.js','utf8'),c);c.LIFT_ENGINE=c.window.LIFT_ENGINE;
const catalogue=c.window.LIFT_CATALOGUE;
test('all previous IDs survive and every imported record has local image and GIF',()=>{
 const coverage=JSON.parse(fs.readFileSync('data/exercises/coverage.json'));
 assert.equal(coverage.previousCount,316);assert.equal(coverage.importedCount,1324);
 for(const old of coverage.exercises)assert.ok(catalogue.find(old.id),old.id);
 const imported=catalogue.exercises.filter(e=>e.datasetId);assert.equal(imported.length,1324);
 for(const e of imported){assert.ok(fs.existsSync(e.image),e.image);assert.ok(fs.existsSync(e.animation),e.animation);assert.ok(!/^https?:/.test(e.image));assert.ok(e.primary.length);}
 assert.equal(new Set(catalogue.exercises.map(e=>e.id)).size,catalogue.exercises.length);
});
test('every exercise muscle resolves to a muscle-map region',()=>{
 const start=source.indexOf('  function progressMuscleGroup('),end=source.indexOf('\n  function ',start+4);
 const scope={LIFT_ENGINE:c.LIFT_ENGINE,progressMuscleGroups:['Chest','Shoulders','Biceps','Triceps','Core','Back','Traps','Quadriceps','Adductors','Glutes','Hamstrings','Calves']};vm.createContext(scope);vm.runInContext(source.slice(start,end),scope);
 for(const e of catalogue.exercises)for(const m of [...e.primary,...e.secondary])assert.ok(scope.progressMuscleGroup(m),e.name+': '+m);
});
function migrationFixture(fail=false){
 const initial={week:29,planRevision:0,experience:'advanced',daysPerWeek:4,logs:{'28-d1':{completed:true}},nutrition:{profile:{}},weekPlans:{'29:0':{days:[{id:'d1'}]}}};
 const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,{classList:{add(){},remove(){}},setAttribute(){}});return elements.get(id);};
 const state=structuredClone(initial),scope={KEY:'test',state,days:[{id:'d1'}],activeDay:null,currentPlanBusy:false,CATALOGUE_MIGRATION:'test',$,logFor:()=>null,showToast(){},updateHome(){},renderSettings(){},updateProgressScreen(){},weekPlanInput:()=>({}),validateWeekPlan:()=>({aiGenerated:true,days:[{id:'new'}]}),updateDropSuggestion(){},LIFT_ENGINE:{clone:structuredClone},localStorage:{setItem(){if(fail)throw Error('Storage full');}},window:{LiftNutrition:{hasAISetup:()=>true,requestAI:async()=>({plan:{}})}}};
 vm.createContext(scope);const start=source.indexOf('  async function generateCurrentAIPlan('),end=source.indexOf('  async function commentOnWorkout(',start);vm.runInContext(source.slice(start,end),scope);return scope;
}
test('one-time AI migration preserves historical logs and the previous plan snapshot',async()=>{const c=migrationFixture();await c.generateCurrentAIPlan();assert.equal(c.state.planRevision,1);assert.ok(c.state.logs['28-d1'].completed);assert.ok(c.state.weekPlans['29:0']);assert.ok(c.state.weekPlans['29:1'].aiGenerated);const current=c.state;await c.generateCurrentAIPlan();assert.equal(c.state,current);});
test('failed saving and an active workout leave the existing plan untouched',async()=>{const c=migrationFixture(true),original=c.state;await c.generateCurrentAIPlan();assert.equal(c.state,original);assert.equal(c.days[0].id,'d1');c.activeDay={id:'d1'};await c.generateCurrentAIPlan();assert.equal(c.state,original);});
test('workout summary Worker returns a concise comment from supplied actual data',async()=>{const response=await worker.fetch(new Request('https://worker.test/coach',{method:'POST',headers:{Authorization:'Bearer secret','Content-Type':'application/json'},body:JSON.stringify({mode:'workout-summary',data:{dayName:'Push A',partial:true,exercises:[{name:'Bench',actual:[{done:true,weight:20,reps:8}]}]}})}),{APP_TOKEN:'secret',AI:{run:async()=>({response:JSON.stringify({summary:'You completed part of Push A. Keep the same load next time.'})})}});assert.equal(response.status,200);assert.match((await response.json()).summary,/Push A/);});
