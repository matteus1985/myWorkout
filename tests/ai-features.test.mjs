import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/src/index.mjs';

const token='test-private-token-with-at-least-32-characters';
const food={name:'Cooked rice',grams:150,confidence:.9,nutritionPer100g:{kcal:130,protein:3,carbs:28,fat:.3},estimatedFields:['kcal','protein','carbs','fat']};
function jsonRequest(path,payload){return new Request('https://worker.example'+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload)});}
function fakeEnv(result){const calls=[];return {APP_TOKEN:token,calls,AI:{async run(model,input){calls.push({model,input});if(result instanceof Error)throw result;return {response:JSON.stringify(result)};}}};}

test('new AI endpoints require the existing private token before model execution',async()=>{
  for(const path of ['/coach','/describe-meal','/transcribe']){
    const env=fakeEnv({});const response=await worker.fetch(new Request('https://worker.example'+path,{method:'POST',body:'{}'}),env);
    assert.equal(response.status,401);assert.equal(env.calls.length,0);
  }
});
test('spoken meal description returns validated editable portions and rejects invalid nutrition',async()=>{
  const env=fakeEnv({foods:[food,{...food,name:'Impossible',nutritionPer100g:{...food.nutritionPer100g,kcal:2000}}]});
  const response=await worker.fetch(jsonRequest('/describe-meal',{description:'150 grams of cooked rice'}),env);
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.foods.length,1);assert.equal(result.foods[0].grams,150);
  assert.match(env.calls[0].input.messages[0].content,/untrusted/);
  const tooLong=await worker.fetch(jsonRequest('/describe-meal',{description:'x'.repeat(2001)}),env);assert.equal(tooLong.status,400);assert.equal(env.calls.length,1);
});
test('recording is sent to English Whisper without storing audio',async()=>{
  let input;const env={APP_TOKEN:token,AI:{async run(model,value){assert.equal(model,'@cf/openai/whisper-large-v3-turbo');input=value;return {text:'Two eggs and toast'};}}};
  const request=new Request('https://worker.example/transcribe',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'audio/mp4'},body:new Uint8Array(200)});
  const response=await worker.fetch(request,env);assert.equal(response.status,200);assert.equal((await response.json()).transcript,'Two eggs and toast');assert.equal(input.language,'en');assert.equal(typeof input.audio,'string');
});
test('unsupported, oversized and silent recordings give usable errors',async()=>{
  const env={APP_TOKEN:token,AI:{async run(){return {text:''};}}};
  const req=(type,body,extra={})=>new Request('https://worker.example/transcribe',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':type,...extra},body});
  assert.equal((await worker.fetch(req('text/plain','audio'),env)).status,400);
  assert.equal((await worker.fetch(req('audio/webm',new Uint8Array(200)),env)).status,422);
  assert.equal((await worker.fetch(req('audio/webm',new Uint8Array(200),{'Content-Length':'4000001'}),env)).status,413);
});
test('workout proposal excludes invented exercises, duplicate IDs, missing history and unsafe loads',async()=>{
  const exercises=[{id:'press',history:[{sets:[{weight:20,reps:10}]}],referenceWeight:20,minWeight:17.5,maxWeight:22.5,step:2.5,minReps:6,maxReps:12},{id:'new',history:[],minWeight:0,maxWeight:5,step:2.5,minReps:6,maxReps:12}];
  const env=fakeEnv({summary:'Keep progressing',suggestions:[{exerciseId:'press',weight:22.5,reps:8},{exerciseId:'press',weight:20,reps:10},{exerciseId:'invented',weight:20,reps:10},{exerciseId:'new',weight:2.5,reps:10}]});
  const result=await (await worker.fetch(jsonRequest('/coach',{mode:'next-workout',data:{exercises}}),env)).json();assert.equal(result.suggestions.length,1);assert.equal(result.suggestions[0].weight,22.5);
  for(const proposal of [{weight:100,reps:8},{weight:21,reps:8},{weight:20,reps:15},{weight:'20',reps:8}]){
    const response=await worker.fetch(jsonRequest('/coach',{mode:'next-workout',data:{exercises}}),fakeEnv({suggestions:[{exerciseId:'press',...proposal}]}));assert.deepEqual((await response.json()).suggestions,[]);
  }
});
test('nutrition suggestions fit remaining calories and require nutrition targets',async()=>{
  const data={targets:{kcal:2500},remaining:{kcal:300,protein:20,carbs:50,fat:10}};
  const accepted=await worker.fetch(jsonRequest('/coach',{mode:'nutrition',data}),fakeEnv({summary:'A useful addition',foods:[food]}));assert.equal((await accepted.json()).foods.length,1);
  const over=await worker.fetch(jsonRequest('/coach',{mode:'nutrition',data:{...data,remaining:{...data.remaining,kcal:50}}}),fakeEnv({foods:[food]}));assert.deepEqual((await over.json()).foods,[]);
  assert.equal((await worker.fetch(jsonRequest('/coach',{mode:'nutrition',data:{}}),fakeEnv({}))).status,400);
});
test('quota/model failure preserves a recoverable server response',async()=>{
  const response=await worker.fetch(jsonRequest('/describe-meal',{description:'two eggs'}),fakeEnv(new Error('Quota exceeded')));assert.equal(response.status,503);assert.match((await response.json()).error,/Quota exceeded/);
});

const appSource=readFileSync(new URL('../app.js',import.meta.url),'utf8');
function catalogueFixture(){
  const elements=new Map();
  const element=selector=>{if(selector==='#catalogue-more')return null;if(!elements.has(selector))elements.set(selector,{value:'',innerHTML:'',textContent:'',classList:{add(){}},setAttribute(){},addEventListener(){}});return elements.get(selector);};
  const item={id:'press',name:'Press',primary:['Chest'],secondary:[],equipment:'dumbbell',level:'beginner'};
  const add={dataset:{add:item.id}},image={},preview={dataset:{imagePreview:item.id},addEventListener(){}},guide={dataset:{catalogueGuide:item.id}};
  const lists={'#catalogue-list .catalogue-thumb':[image],'#catalogue-list [data-image-preview]':[preview],'[data-catalogue-guide]':[guide],'[data-add]':[add]};
  let scopeAction,scopeCalls=0,saves=0;
  const state={equipment:['dumbbell'],experience:'beginner'},day={exercises:[]},edits={add:[]};
  const context={$:element,$$:selector=>lists[selector]||[],catalogueMode:'add',catalogueLimit:60,state,activeDay:day,LIFT_CATALOGUE:{exercises:[item],levels:['beginner'],equipmentLabels:{dumbbell:'Dumbbells'},find:()=>item},LIFT_REPDB_ART:{press:'image.svg'},LIFT_ENGINE:{descriptor:(item,id)=>({id,catalogId:item.id,sets:[{weight:10}]})},escapeHtml:String,escapeAttr:String,setExerciseArt(){},openImagePreview(){},showGuide(){},showToast(){},suggestionText:()=>'',openScope:(...args)=>{scopeAction=args.at(-1);scopeCalls++;},persistentDay:()=>edits,markEdited:()=>{saves++;},Date,Math};
  vm.createContext(context);const start=appSource.indexOf('  function renderCatalogue()'),end=appSource.indexOf('  function initializeEditors()',start);vm.runInContext(appSource.slice(start,end),context);
  return {context,add,state,day,edits,element,scope:()=>scopeAction,scopeCalls:()=>scopeCalls,saves:()=>saves};
}
test('catalogue Add binds after images and persists this-week and future additions',()=>{
  for(const scope of ['week','future']){const f=catalogueFixture();f.context.renderCatalogue();assert.equal(typeof f.add.onclick,'function');f.add.onclick();assert.equal(f.scopeCalls(),1);f.scope()(scope);assert.equal(f.day.exercises.length,1);assert.equal(f.saves(),1);assert.equal(f.edits.add.length,scope==='future'?1:0);f.add.onclick();assert.equal(f.scopeCalls(),1);assert.match(f.element('#catalogue-count').textContent,/already/);}
});
test('catalogue displays missing equipment instead of an apparently dead Add button',()=>{
  const f=catalogueFixture();f.state.equipment=[];f.context.renderCatalogue();f.add.onclick();assert.equal(f.scopeCalls(),0);assert.match(f.element('#catalogue-count').textContent,/Dumbbells.*Settings/);
});

function trainingFixture(){
  const day={id:'d1',name:'Upper',exercises:[{id:'e1',name:'Press',catalogId:'press',equipment:'dumbbell',sets:[{min:6,max:12},{min:6,max:12}]}]},logs={};
  const state={week:1,planRevision:0,equipment:['dumbbell'],experience:'beginner',weightSteps:{dumbbell:2},logs};let saves=0;
  const context={state,days:[day],activeDay:null,itemFor:()=>({id:'press'}),logFor:(_week,id)=>logs[id],LIFT_ENGINE:{histories:()=>[{sets:[{weight:20,reps:12},{weight:20,reps:12}],effort:3}]},reviewKey:JSON.stringify,currentLog:day=>logs[day.id]||(logs[day.id]={completed:false,exercises:{}}),showToast(){},saveState:()=>{saves++;},renderWorkout(){},updateHome(){},window:{},Date,Math};vm.createContext(context);
  vm.runInContext(appSource.slice(appSource.indexOf('  function nextWorkoutContext(){'),appSource.indexOf('  initializeEditors();renderSettings();updateHome();')),context);
  return {context,day,logs,state,saves:()=>saves};
}
test('app applies only approved valid loads as unfinished sets and rejects stale/finished workouts',()=>{
  const f=trainingFixture(),proposal={exerciseId:'e1',weight:22,reps:8},context=f.context.nextWorkoutContext();
  assert.equal(f.context.applyNextWorkoutSuggestions(context,[proposal]),true);assert.equal(f.logs.d1.exercises.e1.sets[0].done,false);assert.equal(f.logs.d1.exercises.e1.sets[0].weight,22);assert.equal(f.saves(),1);
  assert.equal(f.context.applyNextWorkoutSuggestions(context,[proposal]),false);
  const stale=trainingFixture(),snapshot=stale.context.nextWorkoutContext();stale.state.planRevision++;assert.equal(stale.context.applyNextWorkoutSuggestions(snapshot,[proposal]),false);
  const done=trainingFixture(),pending=done.context.nextWorkoutContext();done.logs.d1={completed:true,exercises:{}};assert.equal(done.context.applyNextWorkoutSuggestions(pending,[proposal]),false);
});
test('manual entries are preserved and unlogged exercises never receive a load proposal',()=>{
  const f=trainingFixture();f.logs.d1={completed:false,exercises:{e1:{sets:[{weight:17}]}}};assert.equal(f.context.nextWorkoutContext().data.exercises.length,0);
  const empty=trainingFixture();empty.context.LIFT_ENGINE.histories=()=>[];const snapshot=empty.context.nextWorkoutContext();assert.equal(empty.context.applyNextWorkoutSuggestions(snapshot,[{exerciseId:'e1',weight:2,reps:8}]),false);
});
test('weekly summary includes completed sets from replaced exercises',()=>{
  const day={id:'d1',name:'Upper',exercises:[]},context={days:[day],state:{week:2,logs:{}},logFor:()=>({completed:false,exercises:{},variantHistory:[{name:'Old press',catalogId:'old',sets:[{done:true,weight:20,reps:10}]}]}),itemFor:()=>({unit:'reps'})};vm.createContext(context);
  vm.runInContext(appSource.slice(appSource.indexOf('  function buildWeekReviewData(){'),appSource.indexOf('  function requestWeekReview()')),context);assert.equal(context.buildWeekReviewData().workouts[0].exercises[0].sets.length,1);
});

function coachFixture(){
  const elements=new Map(),events=new Map();
  const element=id=>{if(!elements.has(id)){const listeners=new Map(),classes=new Set();elements.set(id,{value:'',disabled:false,hidden:false,open:true,textContent:'',innerHTML:'',classList:{contains:name=>classes.has(name),add:name=>classes.add(name),remove:name=>classes.delete(name)},setAttribute(){},replaceChildren(){this.innerHTML='';},querySelectorAll:()=>[],addEventListener:(type,cb)=>listeners.set(type,cb),listeners});}return elements.get(id);};
  let draft={},shown=[];
  const nutrition={hasAISetup:()=>true,isPhotoBusy:()=>false,draftIdentity:()=>draft,requestAI:async()=>({foods:[food]}),showCoachFoods:(...args)=>shown.push(args),nutritionContext:()=>({date:'2026-10-24',remaining:{kcal:300}})};
  const document={hidden:false,querySelector:element,querySelectorAll:()=>[],addEventListener:(type,cb)=>events.set(type,cb)};
  const window={LiftNutrition:nutrition,LiftTrainingAI:{nextWorkoutContext:()=>null},isSecureContext:false,addEventListener(){}};
  const context={document,window,navigator:{onLine:true},AbortController,Blob,setTimeout,clearTimeout,setInterval,clearInterval,Date};vm.createContext(context);vm.runInContext(readFileSync(new URL('../coach.js',import.meta.url),'utf8'),context);
  return {element,events,nutrition,context,window,shown,newDraft:()=>{draft={};}};
}
test('voice UI keeps typed fallback when microphone is unavailable or denied',async()=>{
  const f=coachFixture();await f.element('#voice-record').onclick();assert.match(f.element('#voice-meal-status').textContent,/type your meal/);
  f.window.isSecureContext=true;f.window.MediaRecorder=function(){};f.context.MediaRecorder=f.window.MediaRecorder;f.context.navigator.mediaDevices={async getUserMedia(){throw Object.assign(new Error('Denied'),{name:'NotAllowedError'});}};
  await f.element('#voice-record').onclick();assert.equal(f.element('#voice-description').disabled,false);assert.match(f.element('#voice-meal-status').textContent,/access denied/);
});
test('describing a meal previews foods without saving and discards responses for a closed or changed draft',async()=>{
  const f=coachFixture();f.element('#voice-description').value='Two eggs and toast';await f.element('#voice-analyze').onclick();assert.equal(f.shown.length,1);assert.equal(f.shown[0][1],'spoken-meal');
  let resolve;f.nutrition.requestAI=()=>new Promise(r=>resolve=r);
  const request=f.element('#voice-analyze').onclick();f.element('#meal-cancel').listeners.get('click')();f.element('#meal-editor').classList.add('hidden');resolve({foods:[food]});await request;assert.equal(f.shown.length,1);assert.equal(f.element('#voice-description').disabled,false);
  f.element('#meal-editor').classList.remove('hidden');f.element('#voice-description').value='Rice';const next=f.element('#voice-analyze').onclick();f.newDraft();resolve({foods:[food]});await next;assert.equal(f.shown.length,1);
});
test('recording cancellation releases microphone tracks without uploading audio',async()=>{
  const f=coachFixture();let tracksStopped=0,uploads=0;
  const stream={getTracks:()=>[{stop(){tracksStopped++;}}]};
  class Recorder {static isTypeSupported(){return true;}constructor(){this.state='inactive';this.mimeType='audio/webm';}start(){this.state='recording';}stop(){this.state='inactive';this.onstop?.();}}
  f.window.isSecureContext=true;f.window.MediaRecorder=Recorder;f.context.MediaRecorder=Recorder;f.context.navigator.mediaDevices={getUserMedia:async()=>stream};f.nutrition.requestAI=async()=>{uploads++;return {};};
  await f.element('#voice-record').onclick();assert.equal(f.element('#voice-stop').hidden,false);f.element('#voice-cancel').onclick();assert.ok(tracksStopped>0);assert.equal(uploads,0);assert.equal(f.element('#voice-description').disabled,false);
});
test('nutrition response is discarded when the selected day changes',async()=>{
  const f=coachFixture();let resolve;f.nutrition.requestAI=()=>new Promise(r=>resolve=r);const task=f.element('#nutrition-coach-generate').onclick();f.nutrition.nutritionContext=()=>({date:'2026-10-25',remaining:{kcal:300}});resolve({foods:[food]});await task;assert.equal(f.shown.length,0);assert.match(f.element('#nutrition-coach-status').textContent,/changed/);
});

test('spoken food preview supports partial Add all without duplicates, portion adjustment and removal',()=>{
  const source=readFileSync(new URL('../nutrition.js',import.meta.url),'utf8'),nodes=new Map(),get=selector=>{if(!nodes.has(selector))nodes.set(selector,{hidden:true,textContent:'',dataset:{}});return nodes.get(selector);};
  const foods=[food,{...food,name:'Egg',grams:50}],add=foods.map((_,index)=>({dataset:{aiAdd:String(index)}})),remove=foods.map((_,index)=>({dataset:{aiRemove:String(index)}})),adjust=foods.flatMap((_,index)=>['-','+'].map(sign=>({dataset:{aiAdjust:sign,aiIndex:String(index)}}))),all={};
  const root={innerHTML:'',querySelector:selector=>selector==='[data-ai-add-all]'?all:get(selector)};
  const draft={photoMode:'meal',items:[]};let renders=0;
  const context={draft,$:()=>root,$$:selector=>({'[data-ai-add]':add,'[data-ai-remove]':remove,'[data-ai-adjust]':adjust}[selector]||[]),esc:String,api:{showToast(){}},renderDraft:()=>{renders++;},Date,Math};vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  function aiFoodItem('),source.indexOf('  function writeMealStatus(')),context);
  context.renderAISuggestions(foods,'spoken-meal');assert.equal(draft.items.length,0);
  add[0].onclick();add[0].onclick();assert.equal(draft.items.length,1);all.onclick();assert.equal(draft.items.length,2);assert.equal(all.disabled,true);all.onclick();assert.equal(draft.items.length,2);assert.equal(draft.items[0].nutritionSource,'spoken-meal');
  adjust[1].onclick();assert.equal(draft.items[0].grams,160);assert.equal(draft.items[0].kcal,208);
  remove[0].onclick();assert.equal(draft.items.length,1);assert.equal(all.disabled,false);add[0].onclick();assert.equal(draft.items.length,2);assert.ok(renders>0);
});

test('all new UI controls and cached coach script exist once in the app shell',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),shell=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  for(const id of ['next-coach-generate','next-coach-status','next-coach-result','nutrition-coach-generate','nutrition-coach-status','voice-meal-card','voice-record','voice-stop','voice-cancel','voice-description','voice-analyze','voice-meal-status'])assert.equal(html.split(`id="${id}"`).length-1,1,id);
  const script=html.match(/src="(coach\.js\?[^\"]+)"/)[1];assert.ok(shell.includes('./'+script));
});

test('nutrition ideas generate automatically, reuse unchanged data and require review before opening a meal',async()=>{
  const f=coachFixture();let requests=0;
  f.nutrition.requestAI=async()=>{requests++;return {summary:'A useful snack',foods:[food]};};
  f.element('#nutrition-screen').classList.add('active');
  f.events.get('lift:nutrition-updated')();await new Promise(resolve=>setTimeout(resolve,650));
  assert.equal(requests,1);assert.equal(f.shown.length,0);
  f.events.get('lift:nutrition-updated')();await new Promise(resolve=>setTimeout(resolve,650));assert.equal(requests,1);
  f.element('#meal-editor').classList.add('hidden');f.element('#nutrition-coach-review').onclick();assert.equal(f.shown.length,1);
});
test('plan insights load on expansion without a separate manual trigger',()=>{
  const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{hidden:true,setAttribute(){}});return elements.get(id);};let requests=0;
  const context={$:element,buildProgramReviewData:()=>({days:[]}),reviewKey:()=>'',loadAIReview:()=>{requests++;}};vm.createContext(context);
  vm.runInContext(appSource.slice(appSource.indexOf('  function setWorkoutAIExpanded('),appSource.indexOf('  function requestProgramReview(')),context);
  context.setWorkoutAIExpanded(true);assert.equal(requests,1);assert.equal(element('#workout-ai-content').hidden,false);context.setWorkoutAIExpanded(false);assert.equal(requests,1);
});
