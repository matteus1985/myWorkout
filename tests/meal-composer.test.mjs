import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/src/index.mjs';

const source=readFileSync(new URL('../nutrition.js',import.meta.url),'utf8');
const token='test-private-token-at-least-32-characters';
const rice={name:'Rice, cooked',grams:150,confidence:.9,requiresConfirmation:false,nutritionPer100g:{kcal:130,protein:3,carbs:28,fat:.3},estimatedFields:['grams','kcal','protein','carbs','fat']};
const vegetables={name:'Cooked vegetables',grams:80,confidence:.5,requiresConfirmation:true,nutritionPer100g:{kcal:40,protein:2,carbs:7,fat:.5},estimatedFields:['grams','kcal','protein','carbs','fat']};
function fixture(){
  const elements=new Map(),element=selector=>{
    if(!elements.has(selector)){
      const classes=new Set(),attrs=new Map();
      elements.set(selector,{value:'',hidden:false,innerHTML:'',textContent:'',classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value),toggle:(value,on)=>on?classes.add(value):classes.delete(value)},setAttribute:(key,value)=>attrs.set(key,value),getAttribute:key=>attrs.get(key),querySelector:()=>null,querySelectorAll:()=>[],focus(){}});
    }
    return elements.get(selector);
  };
  const nutrition={foodLogs:{},favorites:[],customFoods:[]};let saves=0,closed=0;
  const storage=new Map();
  const context={navigator:{onLine:true},matchingFoodId:null,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},draft:{date:'2026-10-25',name:'Meal',items:[],photoMode:'meal'},photoRequest:null,photoUrl:null,mealInputBusy:false,searchRequest:null,searchVersion:0,onlineFoods:[],searchTimer:null,$:element,$$:()=>[],esc:String,api:{getState:()=>({nutrition}),saveState:()=>saves++,showToast(){}},nutrition:()=>nutrition,getDay:date=>nutrition.foodLogs[date]||{meals:[]},allFoods:()=>[],today:()=>'',totals:meals=>meals.flatMap(meal=>meal.items).reduce((sum,item)=>{for(const key of ['kcal','protein','carbs','fat'])sum[key]+=Number(item[key])||0;return sum;},{kcal:0,protein:0,carbs:0,fat:0}),aiEndpoint:()=>({url:'https://worker.test/identify',token}),hasAISetup:()=>true,recordAIUsage(){},closeMeal:()=>closed++,render(){},document:{dispatchEvent(){}},Event,AbortController,setTimeout,clearTimeout,Date,Math};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  const PHOTO_CACHE_KEY'),source.indexOf('  const $ =')),context);
  const load=(start,end)=>vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start))),context);
  load('  function aiFoodItem(','  function writeMealStatus(');
  load('  function writeMealStatus(','  function etaText(');
  load('  function normalizeFoodName(','  function isFoodQuery(');
  load('  function isFoodQuery(','  const openDb=');
  load('  async function commitMeal(','  async function saveWeight(');
  load('  function validAIFoods(','  window.LiftNutrition=');
  return {context,element,nutrition,saves:()=>saves,closed:()=>closed};
}

test('one grid selects clear foods, keeps uncertain foods unchecked and deduplicates repeated recognition',()=>{
  const f=fixture(),c=f.context;c.renderAISuggestions([rice,vegetables]);
  assert.equal(c.draft.items.length,2);assert.equal(c.selectedDraftItems().length,1);
  assert.equal(c.draft.items[1].selected,false);assert.match(f.element('#meal-draft-list').innerHTML,/To confirm/);
  assert.equal(f.element('#meal-draft-list').innerHTML.match(/data-meal-card=/g).length,2);
  c.renderAISuggestions([{...rice,name:'Cooked rice'}]);assert.equal(c.draft.items.length,2);c.draft.items[0].selected=false;c.renderAISuggestions([rice,vegetables]);assert.equal(c.draft.items.length,2);assert.equal(c.draft.items[0].selected,false);c.draft.items[0].selected=true;c.updateMealFooter();
  assert.match(f.element('#meal-draft-total').innerHTML,/195/);
  c.draft.items[1].selected=true;c.updateMealFooter();assert.match(f.element('#meal-draft-total').innerHTML,/227/);
  assert.equal(f.element('#meal-selection-count').textContent,'2 selected');
});

test('old Worker responses remain selectable and lower-confidence responses require confirmation',()=>{
  const {context:c}=fixture();const old={...rice};delete old.requiresConfirmation;c.renderAISuggestions([old,{...vegetables,requiresConfirmation:undefined}]);
  assert.equal(c.draft.items[0].selected,true);assert.equal(c.draft.items[1].selected,false);
  c.draft.items[0].selected=false;c.renderDraft();assert.equal(c.selectedDraftItems().length,0);
});

test('portion edits rescale nutrition and saving excludes unselected foods and selection metadata',async()=>{
  const f=fixture(),c=f.context;c.renderAISuggestions([rice,vegetables]);
  c.setItemGrams(c.draft.items[0],200);assert.equal(c.draft.items[0].kcal,260);assert.equal(c.draft.items[0].carbs,56);
  c.updateMealFooter();assert.match(f.element('#meal-draft-total').innerHTML,/260/);
  await c.commitMeal();const meals=f.nutrition.foodLogs['2026-10-25'].meals;assert.equal(meals.length,1);assert.equal(meals[0].items.length,1);assert.equal(meals[0].items[0].grams,200);
  assert.equal('selected' in meals[0].items[0],false);assert.equal('requiresConfirmation' in meals[0].items[0],false);assert.equal(f.saves(),1);assert.equal(f.closed(),1);
});

test('zero selection and pending analysis cannot save; legacy favorites get scalable portions',async()=>{
  const f=fixture(),c=f.context;c.renderAISuggestions([vegetables]);await c.commitMeal();assert.equal(f.saves(),0);assert.equal(f.element('#meal-save').disabled,true);
  c.appendDraftItems([{name:'Toast',foodId:'toast',grams:50,kcal:125,protein:4,carbs:24,fat:1,selected:true}]);
  c.setItemGrams(c.draft.items[1],100);assert.equal(c.draft.items[1].kcal,250);
  c.mealInputBusy=true;await c.commitMeal();assert.equal(f.saves(),0);
});

test('a single-food search stays a search while quantities and meal descriptions use AI',()=>{
  const {context:c}=fixture();for(const value of ['rice','Chicken breast cooked','Greek yogurt'])assert.equal(c.isFoodQuery(value),true,value);
  for(const value of ['150 g rice','two eggs','rice and chicken','a bowl of pasta'])assert.equal(c.isFoodQuery(value),false,value);
});

test('online results from an old query cannot replace the current search',async()=>{
  const f=fixture(),c=f.context;let resolve;c.fetch=()=>new Promise(done=>resolve=done);f.element('#voice-description').value='rice';
  const pending=c.searchOnlineFoods();f.element('#voice-description').value='yogurt';c.cancelFoodSearch();
  resolve(new Response(JSON.stringify({usda:[{id:'rice',name:'Rice',kcal:130,protein:3,carbs:28,fat:.3}]}),{status:200}));await pending;
  assert.equal(c.onlineFoods.length,0);assert.equal(f.element('#food-results').innerHTML,'');assert.equal(f.element('#food-search-status').getAttribute('aria-busy'),'false');
});

test('photo retry preserves existing foods and stale photo responses are ignored',async()=>{
  const f=fixture(),c=f.context,requests=[];
  c.compressMealPhoto=async()=>({size:100});c.blobToBase64=async()=>'AQID';c.fetch=()=>new Promise(resolve=>requests.push(resolve));
  c.renderAISuggestions([rice]);c.draft.photo={name:'first'};const old=c.identifyFood();await new Promise(setImmediate);
  c.draft.photo={name:'second'};const current=c.identifyFood();await new Promise(setImmediate);
  requests[0](new Response(JSON.stringify({mode:'meal',foods:[vegetables]})));await old;assert.equal(c.draft.items.length,1);
  requests[1](new Response(JSON.stringify({mode:'meal',foods:[]})));await current;
  assert.equal(c.draft.items.length,1);assert.equal(f.element('#meal-photo-retry').hidden,false);assert.equal(f.element('#ai-recognition-status').getAttribute('aria-busy'),'false');
  const retry=c.identifyFood();await new Promise(setImmediate);requests[2](new Response(JSON.stringify({mode:'meal',foods:[rice,vegetables]})));await retry;
  assert.equal(c.draft.items.length,2);assert.equal(c.selectedDraftItems().length,1);assert.equal(f.element('#meal-photo-retry').hidden,true);
});

test('photo analysis carries identity uncertainty, rejects unusable entries and calls the model once',async()=>{
  const cases=[[rice],[rice,vegetables],[{...rice,name:'Mixed vegetable stew'}],[],[{...rice,name:'Invalid',grams:-2},vegetables]];
  for(const foods of cases){
    const calls=[],env={APP_TOKEN:token,AI:{async run(model,input){calls.push({model,input});return {response:JSON.stringify({foods})};}}};
    const request=new Request('https://worker.test/identify',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({mode:'meal',mimeType:'image/jpeg',imageBase64:'AQID'})});
    const response=await worker.fetch(request,env),result=await response.json();assert.equal(response.status,200);assert.equal(calls.length,1);
    assert.equal(result.foods.length,foods.filter(food=>food.name).length);
    for(const item of result.foods)assert.equal(item.requiresConfirmation,item.name==='Cooked vegetables'||item.name==='Invalid');
  }
  let calls=0;const response=await worker.fetch(new Request('https://worker.test/identify',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({mode:'meal',mimeType:'image/jpeg',imageBase64:'AQID'})}),{APP_TOKEN:token,AI:{async run(){calls++;return {};}}});assert.equal(response.status,502);assert.equal((await response.json()).code,'AI_EMPTY_RESPONSE');assert.equal(calls,1);
});

test('photo compression keeps small pictures and fits a larger picture within 1536 pixels',async()=>{
  for(const [width,height,expectedWidth,expectedHeight] of [[4000,3000,1536,1152],[600,400,600,400]]){
    const f=fixture(),c=f.context,canvas={getContext:()=>({drawImage(){}}),toBlob:callback=>callback({size:150000})};
    c.window={createImageBitmap:true};c.createImageBitmap=async()=>({width,height,close(){}});c.document.createElement=()=>canvas;
    // Restore the actual compressor for this focused image-dimension check.
    vm.runInContext(source.slice(source.indexOf('  async function compressMealPhoto('),source.indexOf('  function blobToBase64(')),c);
    const blob=await c.compressMealPhoto({});assert.equal(canvas.width,expectedWidth);assert.equal(canvas.height,expectedHeight);assert.ok(blob.size<=4000000);
  }
});

test('day navigation advances by a calendar day across month, year and daylight-saving boundaries',()=>{
  const input={value:'',dispatchEvent(event){assert.equal(event.type,'change');this.changed=(this.changed||0)+1;}};
  const context={$:()=>input,today:()=> '2026-10-25',Date,Event};vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  function shiftDiaryDate('),source.indexOf('  function dateLabel(')),context);
  for(const [start,offset,expected] of [['2026-01-01',-1,'2025-12-31'],['2025-12-31',1,'2026-01-01'],['2024-02-28',1,'2024-02-29'],['2024-03-01',-1,'2024-02-29'],['2026-03-28',1,'2026-03-29'],['2026-10-25',1,'2026-10-26']]){input.value=start;context.shiftDiaryDate(offset);assert.equal(input.value,expected);}
  assert.equal(input.changed,6);
});

test('Nutrition initializes against the real shell IDs and opens the new meal composer',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),nodes=new Map(),events=new Map();
  function makeNode(){const classes=new Set(),listeners=new Map();return {value:'',innerHTML:'',textContent:'',hidden:false,style:{setProperty(){}},classList:{contains:value=>classes.has(value),add:value=>classes.add(value),remove:value=>classes.delete(value)},focus(){},removeAttribute(){},setAttribute(){},addEventListener(type,fn){listeners.set(type,fn);},dispatchEvent(event){listeners.get(event.type)?.(event);},contains(){return false;}};}
  for(const match of html.matchAll(/id="([^"]+)"/g)){assert.equal(nodes.has(match[1]),false,'Duplicate ID '+match[1]);nodes.set(match[1],makeNode());}
  nodes.get('meal-editor').classList.add('hidden');
  const document={activeElement:null,body:makeNode(),querySelector:selector=>selector.startsWith('#')?nodes.get(selector.slice(1))||null:null,querySelectorAll:()=>[],addEventListener:(type,fn)=>events.set(type,fn),dispatchEvent:event=>events.get(event.type)?.(event)};
  const window={LIFT_FOODS:[]},state={nutrition:{profile:{},foodLogs:{},weightChecks:[],favorites:[],customFoods:[]}};
  const context={window,document,localStorage:{getItem:()=>null},Date,Math,Event,AbortController,setTimeout,clearTimeout};vm.createContext(context);vm.runInContext(source,context);
  window.LiftNutrition.init({getState:()=>state,saveState(){},showToast(){},escapeHtml:String});
  assert.equal(typeof nodes.get('nutrition-add-meal').onclick,'function');nodes.get('nutrition-add-meal').onclick();assert.equal(nodes.get('meal-editor').classList.contains('hidden'),false);assert.match(nodes.get('meal-draft-list').innerHTML,/Search or describe a food above/);assert.equal(nodes.get('meal-save').disabled,true);
  nodes.get('meal-cancel').onclick();assert.equal(nodes.get('meal-editor').classList.contains('hidden'),true);
  nodes.get('nutrition-date').value='2026-12-31';nodes.get('nutrition-next-day').onclick();assert.equal(nodes.get('nutrition-date').value,'2027-01-01');assert.match(nodes.get('nutrition-meals').innerHTML,/No meals logged/);
});

async function photoWorker(run,payload={}){
  let calls=0,input;
  const response=await worker.fetch(new Request('https://worker.test/identify',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({mode:'meal',mimeType:'image/jpeg',imageBase64:'AQID',...payload})}),{APP_TOKEN:token,AI:{async run(model,value){calls++;input=value;return run(value);}}});
  return {response,body:await response.json(),calls,input};
}
test('vision accepts structured and text identity responses, preserves portions to confirm, and never repeats inference',async()=>{
  const identity={name:'Spaghetti',searchName:'pasta',preparation:'cooked',grams:null,confidence:.9};
  for(const result of [{response:{foods:[identity]}},{response:JSON.stringify({foods:[identity]})},{choices:[{message:{content:JSON.stringify({foods:[identity]})}}]}]){
    const f=await photoWorker(()=>result);assert.equal(f.response.status,200);assert.equal(f.calls,1);assert.equal(f.body.foods[0].grams,150);assert.equal(f.body.foods[0].requiresConfirmation,true);assert.equal(f.body.foods[0].nutritionPer100g,undefined);
    assert.equal(f.input.messages[0].content[1].image_url.url,'data:image/jpeg;base64,AQID');assert.match(f.input.messages[0].content[0].text,/nutritionPer100g/);
  }
});
test('photo Worker returns nutrition estimates and the app uses them immediately when no exact local match exists',async()=>{
  const estimate={name:'Roasted aubergine',searchName:'eggplant cooked',preparation:'cooked',grams:180,confidence:.9,nutritionPer100g:{kcal:35,protein:1,carbs:8,fat:.2}};
  const response=await photoWorker(()=>({response:{foods:[estimate]}}));assert.equal(response.response.status,200);assert.deepEqual(response.body.foods[0].estimatedFields,['kcal','protein','carbs','fat']);
  const f=fixture(),c=f.context;c.fetch=()=>{throw Error('No secondary nutrition lookup should be needed');};
  const [food]=await c.resolvePhotoFoods(response.body.foods,new AbortController().signal);assert.equal(food.nutritionResolved,true);assert.equal(food.nutritionReference,'AI photo estimate');
  c.renderAISuggestions([food]);assert.equal(c.selectedDraftItems().length,1);assert.equal(c.draft.items[0].kcal,63);c.setItemGrams(c.draft.items[0],250);assert.equal(c.draft.items[0].kcal,88);assert.equal(c.draft.items[0].carbs,20);
});
test('photo service errors distinguish quota, capacity, timeout, empty, malformed and missing food data',async()=>{
  const cases=[
    [{response:''},'AI_EMPTY_RESPONSE',502],
    [{response:'this is not JSON'},'AI_INVALID_RESPONSE',502],
    [{response:{foods:'wrong type'}},'AI_INVALID_RESPONSE',502],
    [{response:{foods:[{grams:100}]}},'FOOD_DATA_INCOMPLETE',422],
    [{response:{foods:[]}},'NO_FOOD_FOUND',200],
    [{errors:[{code:3036,message:'Account limited'}]},'AI_QUOTA_EXHAUSTED',429],
    [{errors:[{code:3040,message:'Capacity temporarily exceeded'}]},'AI_BUSY',503],
    [{errors:[{code:3007,message:'Request timeout'}]},'AI_TIMEOUT',504],
    [{errors:[{code:5004,message:'Invalid image input'}]},'AI_REQUEST_REJECTED',502],
    [{errors:[{code:5035,message:'Model requires paid plan'}]},'AI_MODEL_UNAVAILABLE',503]
  ];
  for(const [result,code,status] of cases){const f=await photoWorker(()=>result);assert.equal(f.body.code,code);assert.equal(f.response.status,status);assert.equal(f.calls,1);assert.ok(f.body.requestId);assert.ok(f.body.workerVersion);}
  const rate=await photoWorker(()=>{throw new Error('HTTP 429: rate limited');});assert.notEqual(rate.body.code,'AI_QUOTA_EXHAUSTED');
});
test('worker reports partial results and logs metadata without image, prompt or private code',async()=>{
  const logs=[],original=console.info,requestId='12345678-1234-4234-9234-123456789012';let f;
  try{console.info=value=>logs.push(value);f=await photoWorker(()=>({response:{foods:[{name:'Pasta',preparation:'cooked',grams:180,confidence:.95},null]}}),{requestId,imageBase64:'UEhPVE9fU0VDUkVU'});}finally{console.info=original;}
  assert.equal(f.body.partial,true);assert.equal(f.body.foods.length,1);assert.equal(f.body.requestId,requestId);assert.equal(f.body.diagnostics.returned,2);assert.equal(f.body.diagnostics.accepted,1);
  assert.ok(logs.length);assert.doesNotMatch(logs.join(''),/UEhPVE9fU0VDUkVU|test-private-token|Identify visible foods/);
});
function realCatalog(f){const data={window:{}};vm.createContext(data);vm.runInContext(readFileSync(new URL('../nutrition-data.js',import.meta.url),'utf8'),data);f.context.allFoods=()=>data.window.LIFT_FOODS;}
test('pasta and rice use cooked catalog nutrition and cannot silently use the dry entry',async()=>{
  const f=fixture(),c=f.context;realCatalog(f);c.fetch=()=>{throw Error('No catalog network needed');};
  const foods=await c.resolvePhotoFoods([{name:'Spaghetti',searchName:'pasta',preparation:'cooked',grams:200,confidence:.95},{name:'Rice',preparation:'cooked',grams:150,confidence:.9}],new AbortController().signal);
  assert.equal(foods[0].nutritionPer100g.kcal,157);assert.equal(foods[1].nutritionPer100g.kcal,130);assert.equal(foods[0].nutritionResolved,true);
  const unknown=await c.resolvePhotoFoods([{name:'Pasta',grams:200}],new AbortController().signal);assert.equal(unknown[0].nutritionResolved,false);assert.equal(unknown[0].requiresConfirmation,true);
});
test('USDA matching caches data and ambiguous or failed lookups preserve visible unselected foods',async()=>{
  const f=fixture(),c=f.context;let calls=0;
  c.fetch=async(_url,options)=>{calls++;assert.equal(JSON.parse(options.body).source,'usda');return new Response(JSON.stringify({usda:[{id:'usda-1',name:'Couscous, cooked',source:'USDA FoodData Central',kcal:112,protein:3.8,carbs:23.2,fat:.2}]}));};
  const identity={name:'Couscous',preparation:'cooked',grams:100,confidence:.9};
  const first=await c.resolvePhotoFoods([identity],new AbortController().signal),again=await c.resolvePhotoFoods([identity],new AbortController().signal);assert.equal(calls,1);assert.equal(first[0].nutritionResolved,true);assert.equal(again[0].nutritionPer100g.kcal,112);
  c.fetch=async()=>{throw new TypeError('Failed to fetch');};
  const unresolved=await c.resolvePhotoFoods([{name:'Mixed vegetable curry',grams:250,confidence:.7}],new AbortController().signal);c.renderAISuggestions(unresolved);
  assert.equal(c.draft.items.length,1);assert.equal(c.selectedDraftItems().length,0);assert.doesNotMatch(f.element('#meal-draft-list').innerHTML,/Nutrition needed|disabled/);
  c.setDraftSelection(0,true);assert.equal(c.selectedDraftItems().length,1);assert.match(f.element('#meal-draft-total').innerHTML,/—/);await c.commitMeal();assert.equal(f.saves(),0);
  c.applyNutritionMatch(c.draft.items[0],{id:'match',name:'Vegetable curry',kcal:80,protein:3,carbs:10,fat:3});assert.equal(c.draft.items[0].grams,250);assert.equal(c.draft.items[0].kcal,200);assert.equal(c.selectedDraftItems().length,1);
});
test('frontend distinguishes unreadable Worker responses, no-food results and offline failures without losing existing items',async()=>{
  for(const [response,expected] of [[new Response('<html>Worker failed</html>',{status:502}),'WORKER_INVALID_RESPONSE'],[new Response(JSON.stringify({foods:[],code:'NO_FOOD_FOUND'})),'NO_FOOD_FOUND'],[new Response(JSON.stringify({error:'Cloudflare AI: 3040: Capacity temporarily exceeded'}),{status:503}),'AI_BUSY']]){
    const f=fixture(),c=f.context;c.renderAISuggestions([rice]);c.draft.photo={};c.compressMealPhoto=async()=>({size:100});c.blobToBase64=async()=>'AQID';c.fetch=async()=>response;
    await c.identifyFood();assert.equal(c.draft.items.length,1);assert.ok(c.draft.photo);assert.match(f.element('#meal-photo-diagnostics').textContent,new RegExp(expected));
  }
  const f=fixture();f.context.navigator.onLine=false;f.context.draft.photo={};await f.context.identifyFood();assert.match(f.element('#ai-recognition-status').textContent,/offline/);
});
test('content-based titles use selected foods, preserve custom names and shorten long names',()=>{
  const c=fixture().context;
  assert.equal(c.mealDisplayName({name:'Meal',items:[{name:'Cooked shakshuka',grams:200},{name:'Bread',grams:30}]}),'Shakshuka');
  assert.equal(c.mealDisplayName({name:'Meal',items:[{name:'Brasato (raw)',grams:140},{name:'Polenta (cooked)',grams:140}]}),'Brasato & Polenta');
  assert.equal(c.mealDisplayName({name:'Meal',items:[{name:'Pasta, cooked',grams:200},{name:'Cheese',grams:200,selected:false}]}),'Pasta');
  assert.equal(c.mealDisplayName({name:'Breakfast',items:[rice]}),'Breakfast');assert.ok(c.mealDisplayName({name:'Meal',items:[{name:'A'.repeat(100),grams:100}]}).length<=48);
});

test('whole-card pointer and keyboard selection stay synchronized with checkbox without toggling embedded controls',()=>{
  const f=fixture(),c=f.context;c.renderAISuggestions([rice]);
  const card=f.element('#test-card'),checkbox={checked:true,dataset:{selectDraft:'0'},closest:()=>card};card.dataset={mealCard:'0'};card.querySelector=()=>checkbox;
  c.$$=selector=>selector==='[data-meal-card]'?[card]:selector==='[data-select-draft]'?[checkbox]:[];c.renderDraft();
  card.onclick({target:{closest:()=>null}});assert.equal(c.draft.items[0].selected,false);assert.equal(checkbox.checked,false);assert.ok(card.classList.contains('is-unselected'));
  card.onclick({target:{closest:()=>({tagName:'INPUT'})}});assert.equal(c.draft.items[0].selected,false);
  let prevented=false;card.onkeydown({target:card,key:' ',preventDefault(){prevented=true;}});assert.ok(prevented);assert.equal(checkbox.checked,true);
  card.onkeydown({target:checkbox,key:'Enter',preventDefault(){throw Error('Nested input must handle its own key');}});assert.equal(c.draft.items[0].selected,true);
  checkbox.checked=false;checkbox.onchange();assert.equal(c.draft.items[0].selected,false);assert.match(card.getAttribute('aria-label'),/not selected/);
});
test('card macro row follows grams and retains unknown markers instead of presenting missing nutrients as zero',()=>{
  const f=fixture(),c=f.context;c.renderAISuggestions([rice]);const item=c.draft.items[0];
  assert.match(c.cardMacros(item),/P 4.5 g/);c.setItemGrams(item,300);assert.match(c.cardMacros(item),/P 9 g/);assert.match(c.cardMacros(item),/C 84 g/);
  const missing=c.aiFoodItem({name:'Curry',grams:150,nutritionResolved:false,requiresConfirmation:true});assert.match(c.cardMacros(missing),/P —/);assert.doesNotMatch(c.cardMacros(missing),/P 0/);
  assert.ok(c.draftCardMarkup(item,0).indexOf('meal-food-macros')>c.draftCardMarkup(item,0).indexOf('</details>'));
});
