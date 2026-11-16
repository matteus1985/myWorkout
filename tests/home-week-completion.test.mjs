import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const start=source.indexOf('  function updateHome()'),end=source.indexOf('  function renderVolume()',start);
assert.ok(start>=0&&end>start,'home update function is present');

function homeContext(days,logs={}){
  const ids=['plan-count','next-title','next-subtitle','start-next','setup-level','choose-level','week-sessions','week-exercises'];
  const elements=Object.fromEntries(ids.map(id=>['#'+id,{textContent:'',disabled:false,onclick:null,classList:{toggle(){}}}]));let ended=0;
  const context={days,state:{week:12,experience:'advanced'},currentPlanBusy:false,$:selector=>elements[selector],localized:text=>text,logFor:(week,id)=>logs[id]||null,hasDone:()=>false,workoutDisplayName:day=>day.name,programWeekLogEntries:()=>Object.entries(logs),endWeek:()=>{ended++;},generateCurrentAIPlan(){},setScreen(){},renderDays(){},renderVolume(){},renderWorkoutComment(){},updateBackupStatus(){},document:{dispatchEvent(){}},Event};
  vm.createContext(context);vm.runInContext(source.slice(start,end),context);return {context,elements,ended:()=>ended};
}

test('completed required sessions show End week in the main action; optional sessions do not block it',()=>{
  const days=[{id:'d1',name:'Push A',exercises:[],minutes:50},{id:'d2',name:'Pull A',exercises:[],minutes:50},{id:'optional',name:'Optional',optional:true,exercises:[],minutes:40}],logs={d1:{completed:true},d2:{completed:true}};
  const {context,elements,ended}=homeContext(days,logs);context.updateHome();assert.equal(elements['#next-title'].textContent,'Week complete');assert.equal(elements['#start-next'].textContent,'End week');elements['#start-next'].onclick();assert.equal(ended(),1);
});

test('an unfinished required session remains the next workout action',()=>{
  const days=[{id:'d1',name:'Push A',exercises:[],minutes:50},{id:'d2',name:'Pull A',exercises:[],minutes:50}],logs={d1:{completed:true}};
  const {context,elements}=homeContext(days,logs);context.updateHome();assert.equal(elements['#next-title'].textContent,'Pull A');assert.equal(elements['#start-next'].textContent,'Start workout →');
});

test('an empty schedule still offers plan generation',()=>{
  const {context,elements}=homeContext([]);context.updateHome();assert.equal(elements['#next-title'].textContent,'Plan needed');assert.equal(elements['#start-next'].textContent,'Generate plan');
});
