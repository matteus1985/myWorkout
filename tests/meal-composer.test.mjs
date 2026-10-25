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
      elements.set(selector,{value:'',hidden:false,innerHTML:'',textContent:'',classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value),toggle:(value,on)=>on?classes.add(value):classes.delete(value)},setAttribute:(key,value)=>attrs.set(key,value),getAttribute:key=>attrs.get(key),querySelectorAll:()=>[],focus(){}});
    }
    return elements.get(selector);
  };
  const nutrition={foodLogs:{},favorites:[],customFoods:[]};let saves=0,closed=0;
  const context={draft:{date:'2026-10-25',name:'Meal',items:[],photoMode:'meal'},photoRequest:null,photoUrl:null,mealInputBusy:false,searchRequest:null,searchVersion:0,onlineFoods:[],searchTimer:null,$:element,$$:()=>[],esc:String,api:{getState:()=>({nutrition}),saveState:()=>saves++,showToast(){}},nutrition:()=>nutrition,getDay:date=>nutrition.foodLogs[date]||{meals:[]},allFoods:()=>[],today:()=>'',totals:meals=>meals.flatMap(meal=>meal.items).reduce((sum,item)=>{for(const key of ['kcal','protein','carbs','fat'])sum[key]+=Number(item[key])||0;return sum;},{kcal:0,protein:0,carbs:0,fat:0}),aiEndpoint:()=>({url:'https://worker.test/identify',token}),hasAISetup:()=>true,recordAIUsage(){},closeMeal:()=>closed++,render(){},document:{dispatchEvent(){}},Event,AbortController,setTimeout,clearTimeout,Date,Math};
  vm.createContext(context);
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
    assert.equal(result.foods.length,foods.filter(food=>food.grams>0).length);
    for(const item of result.foods)assert.equal(item.requiresConfirmation,item.name==='Cooked vegetables');
  }
  let calls=0;const response=await worker.fetch(new Request('https://worker.test/identify',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({mode:'meal',mimeType:'image/jpeg',imageBase64:'AQID'})}),{APP_TOKEN:token,AI:{async run(){calls++;return {};}}});assert.equal(response.status,503);assert.equal(calls,1);
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
  assert.equal(typeof nodes.get('nutrition-add-meal').onclick,'function');nodes.get('nutrition-add-meal').onclick();assert.equal(nodes.get('meal-editor').classList.contains('hidden'),false);assert.match(nodes.get('meal-draft-list').innerHTML,/Your meal starts here/);assert.equal(nodes.get('meal-save').disabled,true);
  nodes.get('meal-cancel').onclick();assert.equal(nodes.get('meal-editor').classList.contains('hidden'),true);
  nodes.get('nutrition-date').value='2026-12-31';nodes.get('nutrition-next-day').onclick();assert.equal(nodes.get('nutrition-date').value,'2027-01-01');assert.match(nodes.get('nutrition-meals').innerHTML,/No meals logged/);
});
