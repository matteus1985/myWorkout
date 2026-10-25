(() => {
  'use strict';
  let api, draft = null, photoUrl = null, editingMealFavoriteId = null, photoInputMode = 'meal', onlineFoods = [], searchVersion = 0, searchTimer, searchRequest = null, photoRequest = null, mealInputBusy = false;
  const AI_SETTINGS_KEY = 'lift-log-ai-private-v1';
  const AI_USAGE_KEY = 'lift-log-ai-usage-v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => api?.escapeHtml ? api.escapeHtml(String(s ?? '')) : String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const round = n => Math.round(Number(n)||0);
  const nutrition = () => { const s=api.getState(); s.nutrition ||= {profile:{},calorieTarget:null,weightChecks:[],foodLogs:{},customFoods:[],favorites:[]};s.nutrition.favorites||=[];return s.nutrition; };
  const allFoods = () => [...(window.LIFT_FOODS||[]),...(nutrition().customFoods||[])];
  const mealKey = items => JSON.stringify((items||[]).map(x=>[x.foodId,x.name,x.grams,x.kcal,x.protein,x.carbs,x.fat]));
  const getDay = date => nutrition().foodLogs[date] || {meals:[]};
  const totals = meals => (meals||[]).reduce((a,m)=>(m.items||[]).reduce((b,i)=>{for(const k of ['kcal','protein','carbs','fat'])b[k]+=(Number(i[k])||0);return b;},a),{kcal:0,protein:0,carbs:0,fat:0});
  const calcItem = (food, grams) => {const factor=Math.max(0,Number(grams)||0)/100;return {foodId:food.id,name:food.name,grams:Number(grams)||0,kcal:Math.round(food.kcal*factor),protein:+(food.protein*factor).toFixed(1),carbs:+(food.carbs*factor).toFixed(1),fat:+(food.fat*factor).toFixed(1),per100:{kcal:Number(food.kcal)||0,protein:Number(food.protein)||0,carbs:Number(food.carbs)||0,fat:Number(food.fat)||0}};};
  function readAISettings(){try{const value=JSON.parse(localStorage.getItem(AI_SETTINGS_KEY)||'{}');return {url:String(value.url||''),token:String(value.token||'')};}catch{return {url:'',token:''};}}
  function readAIUsage(){try{const value=JSON.parse(localStorage.getItem(AI_USAGE_KEY)||'{}');return {requests:Math.max(0,Number(value.requests)||0),successes:Math.max(0,Number(value.successes)||0),coaching:Math.max(0,Number(value.coaching)||0),transcriptions:Math.max(0,Number(value.transcriptions)||0),reviews:Math.max(0,Number(value.reviews)||0),reviewSuccesses:Math.max(0,Number(value.reviewSuccesses)||0),bytes:Math.max(0,Number(value.bytes)||0)};}catch{return {requests:0,successes:0,reviews:0,reviewSuccesses:0,coaching:0,transcriptions:0,bytes:0};}}
  function recordAIUsage(kind,bytes=0){const usage=readAIUsage();if(kind==='coaching')usage.coaching++;if(kind==='transcription')usage.transcriptions++;if(kind==='request'){usage.requests++;usage.bytes+=Math.max(0,Number(bytes)||0);}if(kind==='success')usage.successes++;if(kind==='review')usage.reviews++;if(kind==='reviewSuccess')usage.reviewSuccesses++;try{localStorage.setItem(AI_USAGE_KEY,JSON.stringify(usage));}catch{}renderAIUsage();}
  function renderAIUsage(){const el=$('#food-ai-usage');if(!el)return;const usage=readAIUsage(),mb=(usage.bytes/1_000_000).toFixed(2);el.textContent=`This device: ${usage.requests} photo requests (${usage.successes} successful) · ${usage.transcriptions} voice requests · ${usage.coaching} coaching requests · ${usage.reviews} workout reviews (${usage.reviewSuccesses} successful) · ${mb} MB of compressed photo data. Local counts only; check Cloudflare for actual AI usage.`;}
  function writeAIStatus(message,kind=''){const el=$('#food-ai-status');if(el){el.textContent=message;el.className='settings-note'+(kind?' '+kind:'');}}
  function aiEndpoint(path){const config=readAISettings();if(!config.url||!config.token)throw new Error('Set the Worker address and private code in Settings first.');let url;try{url=new URL(config.url);}catch{throw new Error('Enter a valid Cloudflare Worker address.');}if(url.protocol!=='https:')throw new Error('The Worker address must start with https://.');url.pathname=url.pathname.replace(/\/+$/,'')+'/'+path;url.search='';url.hash='';return {url:url.href,token:config.token};}
  function hasAISetup(){const config=readAISettings();return !!(config.url&&config.token);}
  async function requestWorkoutReview(mode,data){const endpoint=aiEndpoint('review');recordAIUsage('review');const response=await fetch(endpoint.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+endpoint.token},body:JSON.stringify({mode,data})});let payload={};try{payload=await response.json();}catch{}if(!response.ok){if(response.status===404||/not found/i.test(String(payload.error||'')))throw new Error('Your Cloudflare Worker is an older version and does not support workout reviews yet. Replace its code with worker/src/index.mjs and deploy again.');throw new Error(payload.error||'AI review is unavailable.');}if(!payload.review||typeof payload.review.summary!=='string')throw new Error('The Worker returned an invalid AI review.');recordAIUsage('reviewSuccess');return payload.review;}
  function renderAISettings(){const config=readAISettings(),url=$('#food-ai-url'),token=$('#food-ai-token');if(url&&document.activeElement!==url)url.value=config.url;if(token&&document.activeElement!==token)token.value=config.token;renderAIUsage();}
  function saveAISettings(){const url=$('#food-ai-url').value.trim(),token=$('#food-ai-token').value.trim();if((url||token)&&(!url||!token)){writeAIStatus('Enter both the Worker address and private code.','error');return;}if(url){try{if(new URL(url).protocol!=='https:')throw new Error();}catch{writeAIStatus('Enter a valid Worker address starting with https://.','error');return;}if(token.length<24){writeAIStatus('The private code looks too short. Generate a new one and use the same code in Cloudflare.','error');return;}}try{if(url)localStorage.setItem(AI_SETTINGS_KEY,JSON.stringify({url,token}));else localStorage.removeItem(AI_SETTINGS_KEY);}catch{writeAIStatus('This browser could not save the private setup on this iPhone.','error');return;}writeAIStatus(url?'AI setup saved on this iPhone.':'AI setup cleared. Manual food search still works offline.','success');}
  function generateAIToken(){if(!window.crypto?.getRandomValues){writeAIStatus('Open Lift Log from its HTTPS link to create a secure private code.','error');return;}const bytes=crypto.getRandomValues(new Uint8Array(32));const raw=String.fromCharCode(...bytes);const token=btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');$('#food-ai-token').value=token;$('#food-ai-token').type='text';$('#food-ai-token').select();writeAIStatus('Private code created. Copy it into the APP_TOKEN secret for your Cloudflare Worker, then save this setup.','');}
  async function copyAIToken(){const input=$('#food-ai-token');if(!input.value){writeAIStatus('Generate a private code first.','error');return;}input.type='text';input.select();try{await navigator.clipboard.writeText(input.value);writeAIStatus('Private code copied. Paste it into the Worker APP_TOKEN secret.','success');}catch{writeAIStatus('Private code selected. Copy it, then paste it into the Worker APP_TOKEN secret.','');}}
  async function testAIConnection(){try{const endpoint=aiEndpoint('health'),response=await fetch(endpoint.url,{headers:{Authorization:'Bearer '+endpoint.token}});if(!response.ok)throw new Error();const result=await response.json();if(!result.ok)throw new Error();writeAIStatus(result.capabilities?.includes('meal-voice')?'Connected. Photos, voice meals and AI coaching are ready.':'Connected. Update your Worker code to enable voice meals and AI coaching.','success');}catch{writeAIStatus('Connection failed. Check the Worker address, private code and internet connection.','error');}}
  function profileEstimate(p){
    const w=Number(p.currentWeightKg),h=Number(p.heightCm),a=Number(p.age),factor={low:1.2,light:1.375,moderate:1.55,high:1.725}[p.activity||'moderate'];
    if(!(w>0&&h>0&&a>=15&&a<=100))return null;
    const resting=p.manualRestingKcal>0?Number(p.manualRestingKcal):10*w+6.25*h-5*a+({male:5,female:-161,neutral:-78}[p.coefficient||'neutral']);
    const maintenance=Math.round(resting*(factor||1.55)/50)*50;
    return {resting:Math.round(resting),maintenance,target:Math.round(maintenance*1.1/50)*50,manual:p.manualRestingKcal>0};
  }
  function renderSettings(){
    const n=nutrition(),p=n.profile||{},estimate=profileEstimate(p);
    const values={age:p.age,height:p.heightCm,current:p.currentWeightKg,goal:p.goalWeightKg,activity:p.activity||'moderate',coefficient:p.coefficient||'neutral',resting:p.manualRestingKcal||''};
    for(const [id,value] of Object.entries(values)){const el=$('#nutrition-'+id);if(el&&document.activeElement!==el)el.value=value;}
    const target=n.calorieTarget||estimate?.target;
    $('#nutrition-estimate').textContent=estimate?`Estimated resting energy: ${estimate.resting} kcal/day · maintenance: ${estimate.maintenance} · initial mass-gain target: ${target} kcal/day${estimate.manual?' · using your manual resting estimate':''}.`:'Add age, height and current weight to estimate daily energy needs.';
    const protein=Number(p.currentWeightKg)>0?Math.round(Number(p.currentWeightKg)*1.8):0,fat=Number(p.currentWeightKg)>0?Math.round(Number(p.currentWeightKg)*.6):0,carbs=target?Math.max(0,Math.round((target-protein*4-fat*9)/4)):0;
    $('#nutrition-macro-estimate').textContent=target?`Starting macro guide: ${protein} g protein · ${fat} g minimum fat · about ${carbs} g carbs. Adjust with your clinician if needed.`:'Macro targets will appear after you save your profile.';
    const targetInput=$('#nutrition-target-edit');if(targetInput&&document.activeElement!==targetInput)targetInput.value=n.calorieTarget||'';
  }
  function saveProfile(){
    const p={age:Number($('#nutrition-age').value)||null,heightCm:Number($('#nutrition-height').value)||null,currentWeightKg:Number($('#nutrition-current').value)||null,goalWeightKg:Number($('#nutrition-goal').value)||null,activity:$('#nutrition-activity').value,coefficient:$('#nutrition-coefficient').value,manualRestingKcal:Number($('#nutrition-resting').value)||null};
    if(p.age&& (p.age<15||p.age>100)){api.showToast('Enter an age between 15 and 100.');return;}
    if((p.heightCm&& (p.heightCm<100||p.heightCm>250))||(p.currentWeightKg&& (p.currentWeightKg<30||p.currentWeightKg>350))||(p.goalWeightKg&& (p.goalWeightKg<30||p.goalWeightKg>350))){api.showToast('Check the height and weight values.');return;}
    const n=nutrition();n.profile=p;const estimate=profileEstimate(p);if(!n.calorieTarget&&estimate)n.calorieTarget=estimate.target;api.saveState();renderSettings();render();api.showToast('Nutrition profile saved on this iPhone.');
  }
  function aiFoodItem(food,mode=draft?.photoMode||'meal'){
    const estimatedFields=Array.isArray(food.estimatedFields)?[...new Set(food.estimatedFields.filter(field=>['grams','kcal','protein','carbs','fat'].includes(field)))]:['grams','kcal','protein','carbs','fat'];
    const grams=Math.max(1,Math.min(10000,Math.round(Number(food.grams)||150))),per=food.nutritionPer100g||{},per100={kcal:Number(per.kcal)||0,protein:Number(per.protein)||0,carbs:Number(per.carbs)||0,fat:Number(per.fat)||0},factor=grams/100;
    return {foodId:'ai-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),name:String(food.name||'Food').slice(0,80),grams,kcal:Math.round(per100.kcal*factor),protein:+(per100.protein*factor).toFixed(1),carbs:+(per100.carbs*factor).toFixed(1),fat:+(per100.fat*factor).toFixed(1),per100,estimatedFields,nutritionSource:mode==='product-label'?'product-label':mode==='spoken-meal'?'spoken-meal':mode==='nutrition'?'nutrition-coach':'meal-photo',estimatedByAI:mode!=='product-label'||estimatedFields.length>0,requiresConfirmation:food.requiresConfirmation===true||(typeof food.confidence==='number'&&food.confidence<.65),selected:!(food.requiresConfirmation===true||(typeof food.confidence==='number'&&food.confidence<.65))};
  }
  function aiFoodQuality(item){if(item.nutritionSource!=='product-label')return 'AI estimate';if(!item.estimatedFields?.length)return 'Label values';return ['kcal','protein','carbs','fat'].every(field=>item.estimatedFields.includes(field))?'AI estimate':'Partly estimated';}
  function appendDraftItems(items,{selectExisting=false}={}){
    for(const item of items){
      if(!item.per100&&Number(item.grams)>0)item.per100=Object.fromEntries(['kcal','protein','carbs','fat'].map(key=>[key,Number(item[key]||0)*100/Number(item.grams)]));
      const existing=draft.items.find(other=>normalizeFoodName(other.name).sort().join(' ')===normalizeFoodName(item.name).sort().join(' ')&&sameFood({...other.per100,name:other.name},{...item.per100,name:item.name}));
      if(existing){if(selectExisting)existing.selected=true;continue;}
      item.selected=item.selected!==false;draft.items.push(item);
    }
    renderDraft();
  }
  function renderAISuggestions(foods,mode=draft?.photoMode||'meal'){
    appendDraftItems(foods.map(food=>aiFoodItem(food,mode)));
  }
  function writeMealStatus(message,kind=''){const el=$('#ai-recognition-status');if(el){el.textContent=message;el.className='small-print ai-status'+(kind?' '+kind:'');el.setAttribute('aria-busy',String(identifyingPhoto));const retry=$('#meal-photo-retry');if(retry)retry.hidden=kind!=='error'||!draft?.photo;}}
  async function compressMealPhoto(file){let image,bitmap=false;if(window.createImageBitmap){try{image=await createImageBitmap(file);bitmap=true;}catch{}}if(!image){image=await new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read this photo.'));};img.src=url;});}const scale=Math.min(1,1536/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const context=canvas.getContext('2d',{alpha:false});if(!context)throw new Error('Photo processing is unavailable in this browser.');context.drawImage(image,0,0,canvas.width,canvas.height);if(bitmap)image.close();let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));if(!blob)throw new Error('Could not prepare the photo.');if(blob.size>4_000_000)blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.65));if(!blob||blob.size>4_000_000)throw new Error('This photo is too large to analyze. Try a smaller image.');return blob;}
  function blobToBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('Could not prepare the photo.'));reader.readAsDataURL(blob);});}
  let identifyingPhoto=false;
  function cancelPhoto(){photoRequest?.controller.abort();photoRequest=null;identifyingPhoto=false;}
  async function identifyFood(){
    if(!draft?.photo)return;
    cancelPhoto();
    let endpoint;try{endpoint=aiEndpoint('identify');}catch(error){writeMealStatus(error.message,'error');updateMealFooter();return;}
    const request={draft,photo:draft.photo,mode:draft.photoMode,controller:new AbortController()};photoRequest=request;identifyingPhoto=true;updateMealFooter();
    const current=()=>photoRequest===request&&draft===request.draft&&draft.photo===request.photo&&!$('#meal-editor').classList.contains('hidden');
    writeMealStatus(request.mode==='product-label'?'Reading product label…':'Looking at every part of your meal…');
    const timeout=setTimeout(()=>request.controller.abort(),90000);
    try{
      const image=await compressMealPhoto(request.photo),imageBase64=await blobToBase64(image);if(!current())return;
      recordAIUsage('request',image.size);
      const response=await fetch(endpoint.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+endpoint.token},body:JSON.stringify({mode:request.mode||'meal',mimeType:'image/jpeg',imageBase64}),signal:request.controller.signal});
      let payload={};try{payload=await response.json();}catch{}if(!current())return;
      if(!response.ok)throw new Error(payload.error||'Photo analysis is unavailable.');
      if(request.mode==='product-label'&&payload.mode!=='product-label')throw new Error('Update your Cloudflare Worker to enable product-label scanning.');
      if(!Array.isArray(payload.foods)||!payload.foods.length)throw new Error(request.mode==='product-label'?'Could not read the product. Try a clearer label photo.':'No foods found. Try another photo or describe what is on the plate.');
      const foods=validAIFoods(payload.foods);if(!foods.length)throw new Error('Could not read usable food portions. Try again or describe your meal.');
      recordAIUsage('success');renderAISuggestions(foods,request.mode);writeMealStatus('');
    }catch(error){if(current())writeMealStatus(error.name==='AbortError'?'Analysis took too long. Try again.':(/Cloudflare AI|returned no text|empty response|response fields/i.test(error.message||'')?'Photo analysis is temporarily unavailable. Try again or describe your meal.':error.message||'Photo analysis failed. Try again.'),'error');}
    finally{clearTimeout(timeout);if(photoRequest===request){photoRequest=null;identifyingPhoto=false;$('#ai-recognition-status').setAttribute('aria-busy','false');updateMealFooter();}}
  }

  function etaText(){const p=nutrition().profile,w=Number(p.currentWeightKg),goal=Number(p.goalWeightKg);if(!(w>0&&goal>0))return 'Add your current and goal weights in Settings to see an estimate.';if(goal<=w)return 'Your goal weight is at or below your current weight.';const diff=goal-w,slow=w*.0025,fast=w*.005,low=Math.ceil(diff/fast),high=Math.ceil(diff/slow);const date=n=>new Date(Date.now()+n*7*86400000).toLocaleDateString('en-US',{month:'short',year:'numeric'});return `At 0.25–0.5% of body weight per week, reaching ${goal} kg may take about ${low}–${high} weeks (${date(low)}–${date(high)}). This estimates scale weight, not muscle gain.`;}
  function shiftDiaryDate(offset){
    const input=$('#nutrition-date'),date=new Date((input.value||today())+'T12:00:00');if(!Number.isFinite(date.getTime()))return;
    date.setDate(date.getDate()+offset);if(date.getFullYear()<1||date.getFullYear()>9999)return;
    input.value=String(date.getFullYear()).padStart(4,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function dateLabel(date){return new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});}
  function render(){
    if(!api)return;const n=nutrition(),date=$('#nutrition-date')?.value||today(),day=getDay(date),sum=totals(day.meals),target=Number(n.calorieTarget)||profileEstimate(n.profile||{})?.target||0;
    $('#nutrition-calories').textContent=round(sum.kcal).toLocaleString('en-US');$('#nutrition-target').textContent=target?`of ${target.toLocaleString('en-US')} kcal`:'Set a profile in Settings';$('#nutrition-calorie-bar').style.width=target?Math.min(100,sum.kcal/target*100)+'%':'0%';
    const weight=Number(n.profile?.currentWeightKg)||0,macroTargets={protein:weight?Math.round(weight*1.8):0,fat:weight?Math.round(weight*.6):0,carbs:0};macroTargets.carbs=target&&weight?Math.max(0,Math.round((target-macroTargets.protein*4-macroTargets.fat*9)/4)):0;const goalsReady=!!(weight&&target);$('#nutrition-macros').innerHTML=[['Protein',sum.protein,macroTargets.protein],['Carbs',sum.carbs,macroTargets.carbs],['Fat',sum.fat,macroTargets.fat]].map(([label,value,goal])=>`<div class="nutrition-macro"><div class="nutrition-macro-value"><strong>${Math.round(value)} g</strong><small>${goalsReady?`/ ${goal} g`:'goal —'}</small></div><span>${label}</span><div class="nutrition-macro-track" ${goalsReady?`role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(goal,Math.round(value))}"`:''}><i style="width:${goalsReady&&goal?Math.min(100,value/goal*100):0}%"></i></div></div>`).join('')+(!goalsReady?'<p class="nutrition-macro-hint">Set your weight and calorie target in Settings to see macro goals.</p>':'');
    $('#nutrition-meals').innerHTML=(day.meals||[]).map((m,i)=>{const t=totals([m]),mealItems=m.items||[],key=items=>JSON.stringify(items.map(x=>[x.foodId,x.name,x.grams,x.kcal,x.protein,x.carbs,x.fat]));const savedFavorite=(nutrition().favorites||[]).find(f=>key(f.items||[])===key(mealItems)),isSaved=!!savedFavorite,editing=editingMealFavoriteId===savedFavorite?.id;return `<article class="nutrition-meal"><div class="row"><div><div class="meal-title-line">${editing?`<input class="field meal-favorite-name-edit" type="text" maxlength="80" value="${esc(savedFavorite.name)}" aria-label="Favorite meal name"><button type="button" class="btn btn-small btn-soft meal-favorite-edit-action" data-save-meal-favorite-name="${esc(savedFavorite.id)}">Save</button><button type="button" class="btn btn-small btn-outline meal-favorite-edit-action" data-cancel-meal-favorite-name>Cancel</button>`:`<strong>${esc(m.name||'Meal')}</strong><button type="button" class="btn btn-small ${isSaved?'btn-favorite-saved':'btn-outline'}" data-save-favorite="${i}" aria-pressed="${isSaved}" aria-label="${isSaved?'Remove from favorites':'Save favorite'}" title="${isSaved?'Remove from favorites':'Save favorite'}"><span aria-hidden="true">${isSaved?'★':'☆'}</span></button>`}</div><small>${Math.round(t.kcal)} kcal · P ${Math.round(t.protein)} · C ${Math.round(t.carbs)} · F ${Math.round(t.fat)} g</small></div><div class="nutrition-meal-top-actions"><button class="icon-button nutrition-delete" data-meal-index="${i}" aria-label="Delete ${esc(m.name||'meal')}">×</button></div></div><div class="nutrition-food-list">${(m.items||[]).map(x=>`<span>${esc(x.name)} · ${x.grams} g${x.nutritionSource==='product-label'?' · '+aiFoodQuality(x):x.estimatedByAI?' · AI estimate':''}</span>`).join('')}</div></article>`;}).join('')||'<div class="empty">No meals logged for this day yet.</div>';
    $('#nutrition-goal-estimate').textContent=etaText();renderWeight();renderSuggestion();renderSettings();document.dispatchEvent(new Event('lift:nutrition-updated'));
    $$('.nutrition-delete').forEach(b=>b.onclick=()=>{if(!confirm('Delete this meal?'))return;const d=getDay(date);d.meals.splice(Number(b.dataset.mealIndex),1);n.foodLogs[date]=d;api.saveState();render();});
    $$('[data-save-favorite]').forEach(b=>b.onclick=()=>saveFavoriteFromMeal(date,Number(b.dataset.saveFavorite)));
    $$('[data-save-meal-favorite-name]').forEach(b=>b.onclick=()=>renameFavorite(b.dataset.saveMealFavoriteName,$('.meal-favorite-name-edit')?.value));$$('[data-cancel-meal-favorite-name]').forEach(b=>b.onclick=()=>{editingMealFavoriteId=null;render();});
  }
  function renderWeight(){const n=nutrition(),checks=[...(n.weightChecks||[])].sort((a,b)=>a.date.localeCompare(b.date)),recent=checks.slice(-12),chart=$('#weight-chart'),reminder=$('#weight-reminder');if(document.activeElement!==$('#weekly-weight'))$('#weekly-weight').value=checks.at(-1)?.kg||'';$('#weight-history').innerHTML=checks.slice(-5).reverse().map(x=>`<div class="weight-check-row"><span>Week of ${new Date(x.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><strong>${x.kg} kg average</strong></div>`).join('')||'<p class="settings-note">No weekly check-ins yet.</p>';const now=new Date(),week=monday(today()),hasThisWeek=checks.some(x=>x.date===week);reminder.hidden=!(now.getDay()===0&&now.getHours()>=18&&!hasThisWeek);reminder.textContent='Sunday check-in: add this week’s average before bed.';if(!recent.length){chart.innerHTML='<p class="small-print">Your saved weekly averages will appear here.</p>';return;}const values=recent.map(x=>Number(x.kg)),min=Math.min(...values),max=Math.max(...values),pad=Math.max(1,(max-min)*.25),low=min-pad,high=max+pad,W=600,H=190,L=43,R=16,T=16,B=36,innerW=W-L-R,innerH=H-T-B,point=(value,index)=>({x:L+(recent.length===1?innerW/2:index*innerW/(recent.length-1)),y:T+(high-value)/(high-low)*innerH}),points=recent.map((x,i)=>point(Number(x.kg),i)),coords=points.map(p=>`${p.x},${p.y}`).join(' ');chart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly average body weight, from ${esc(recent[0].kg)} kilograms to ${esc(recent.at(-1).kg)} kilograms"><line x1="${L}" y1="${T+innerH}" x2="${W-R}" y2="${T+innerH}" class="weight-axis"/><polyline points="${coords}" class="weight-line"/>${recent.map((x,i)=>{const p=points[i],label=new Date(x.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});return `<circle cx="${p.x}" cy="${p.y}" r="4" class="weight-point"><title>${esc(label)}: ${esc(x.kg)} kg</title></circle><text x="${p.x}" y="${H-10}" text-anchor="middle" class="weight-label">${esc(label)}</text>`;}).join('')}<text x="${L}" y="${T+4}" class="weight-value-label">${high.toFixed(1)} kg</text><text x="${L}" y="${T+innerH-3}" class="weight-value-label">${low.toFixed(1)} kg</text></svg>`;}
  function monday(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return d.toISOString().slice(0,10);}
  function renderSuggestion(){const n=nutrition(),el=$('#nutrition-adjustment'),checks=[...(n.weightChecks||[])].sort((a,b)=>a.date.localeCompare(b.date));if(checks.length<2){el.innerHTML='<p class="small-print">After two weekly check-ins and consistent food logging, the app can suggest a small calorie adjustment. You always approve it.</p>';return;}const prev=checks.at(-2),last=checks.at(-1),weeks=(new Date(last.date)-new Date(prev.date))/604800000,rate=weeks>0?(last.kg-prev.kg)/prev.kg/weeks:0;const days=Object.keys(n.foodLogs||{}).filter(d=>n.foodLogs[d]?.meals?.length),weekOne=days.filter(d=>d>=prev.date&&d<last.date).length,weekTwo=days.filter(d=>d>=last.date&&d<=today()).length;if(weeks<.8||weekOne<5||weekTwo<5){el.innerHTML='<p class="small-print">Log at least five food days in each week around your check-ins for a useful adjustment suggestion.</p>';return;}const direction=rate<.0025?100:rate>.005?-100:0;if(!direction){el.innerHTML='<p class="hint">Your recent weight trend is within the starting target range. Keep your calorie target as it is.</p>';return;}el.innerHTML=`<p class="hint">Your recent average trend is ${(rate*100).toFixed(2)}% per week. Consider ${direction>0?'adding':'reducing'} ${Math.abs(direction)} kcal/day.</p><button id="approve-calorie-change" class="btn btn-soft btn-small">Apply ${direction>0?'+':''}${direction} kcal/day</button>`;$('#approve-calorie-change').onclick=()=>{n.calorieTarget=Math.max(1000,(Number(n.calorieTarget)||profileEstimate(n.profile)?.target||2000)+direction);api.saveState();render();api.showToast('Calorie target updated.');};}
  function openMeal(){
    cancelPhoto();cancelFoodSearch();draft={date:$('#nutrition-date').value||today(),name:'Meal',favoriteId:null,items:[],photo:null,photoMode:'meal'};photoInputMode='meal';mealInputBusy=false;onlineFoods=[];
    if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}
    $('#voice-description').value='';$('#food-search-status').textContent='';$('#meal-photo').value='';$('#meal-photo-camera').value='';$('#food-results').innerHTML='';$('#meal-photo-preview').removeAttribute('src');$('#meal-photo-preview').hidden=true;
    writeMealStatus('');setPhotoMenu(false);$('#meal-editor').classList.remove('hidden');document.body.classList.add('meal-editor-open');renderFavorites();renderDraft();document.dispatchEvent(new Event('lift:meal-open'));
    $('#meal-cancel').focus({preventScroll:true});
  }
  function closeMeal(){
    if($('#meal-editor').classList.contains('hidden'))return;
    cancelPhoto();cancelFoodSearch();$('#meal-editor').classList.add('hidden');document.body.classList.remove('meal-editor-open');setPhotoMenu(false);if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}
    document.dispatchEvent(new Event('lift:meal-close'));$('#nutrition-add-meal').focus({preventScroll:true});
  }
  function setPhotoMenu(open){$('#meal-photo-menu').hidden=!open;$('#meal-photo-menu-toggle').setAttribute('aria-expanded',String(open));}

  function saveFavoriteFromMeal(date,index){const meal=getDay(date).meals?.[index];if(!meal?.items?.length)return;const n=nutrition(),items=meal.items.map(item=>JSON.parse(JSON.stringify(item))),signature=mealKey(items),existing=n.favorites.find(favorite=>mealKey(favorite.items)===signature);if(existing){n.favorites=n.favorites.filter(favorite=>favorite.id!==existing.id);Object.values(n.foodLogs||{}).forEach(day=>(day.meals||[]).forEach(entry=>{if(entry.favoriteId===existing.id)delete entry.favoriteId;}));editingMealFavoriteId=null;api.saveState();render();api.showToast('Removed from favorites.');return;}const name=items.slice(0,3).map(item=>item.name).join(' + ')+(items.length>3?' + more':''),id='favorite-'+Date.now().toString(36);n.favorites.push({id,name,items});meal.favoriteId=id;meal.name=name;editingMealFavoriteId=id;api.saveState();render();$('.meal-favorite-name-edit')?.focus();$('.meal-favorite-name-edit')?.select();}
  function renameFavorite(id,value){const favorite=nutrition().favorites.find(item=>item.id===id),name=String(value||'').trim();if(!favorite||!name){api.showToast('Enter a name for this favorite.');return;}favorite.name=name.slice(0,80);if(draft?.favoriteId===id)draft.name=favorite.name;const signature=mealKey(favorite.items);Object.values(nutrition().foodLogs||{}).forEach(day=>(day.meals||[]).forEach(meal=>{if(meal.favoriteId===id||mealKey(meal.items)===signature){meal.favoriteId=id;meal.name=favorite.name;}}));editingMealFavoriteId=null;api.saveState();renderFavorites();render();}
  function renderFavorites(){
    const root=$('#nutrition-favorites'),favorites=(nutrition().favorites||[]).filter(item=>item&&typeof item.name==='string'&&item.id&&Array.isArray(item.items));root.hidden=!favorites.length;
    root.innerHTML=favorites.length?'<span class="meal-favorites-label">Favorites</span><div class="meal-favorite-strip">'+favorites.map(favorite=>'<button type="button" class="meal-favorite-chip" data-use-favorite="'+esc(favorite.id)+'"><span aria-hidden="true">★</span><span>'+esc(favorite.name)+'</span></button>').join('')+'</div>':'';
    $$('[data-use-favorite]').forEach(button=>button.onclick=()=>{const favorite=nutrition().favorites.find(item=>item.id===button.dataset.useFavorite);if(!favorite)return;draft.name=favorite.name;draft.favoriteId=favorite.id;appendDraftItems(favorite.items.map(item=>({...JSON.parse(JSON.stringify(item)),selected:true})),{selectExisting:true});clearMealInput();});
  }

  function normalizeFoodName(name){return String(name||'').split(' · ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);}
  function sameFood(a,b){const left=normalizeFoodName(a.name),right=normalizeFoodName(b.name);if(!left.length||!right.length)return false;const shared=left.filter(token=>right.includes(token)).length;if(shared/Math.min(left.length,right.length)<.8)return false;return [['kcal',12,.1],['protein',1.2,.18],['carbs',1.5,.18],['fat',.8,.2]].every(([field,floor,ratio])=>Math.abs((Number(a[field])||0)-(Number(b[field])||0))<=Math.max(floor,Math.max(Number(a[field])||0,Number(b[field])||0)*ratio));}
  function foodSourceRank(food){return food.source==='USDA FoodData Central'?3:food.source==='Open Food Facts'?2:1;}
  function isFoodQuery(text){return text.trim().split(/\s+/).length<=3&&!/\d|[,;]|\b(and|with|plus|one|two|three|four|five|six|seven|eight|nine|ten|a plate|a bowl)\b/i.test(text);}
  function cancelFoodSearch(){clearTimeout(searchTimer);searchVersion++;searchRequest?.abort();searchRequest=null;$('#food-search-status').setAttribute('aria-busy','false');}
  function clearMealInput(){cancelFoodSearch();$('#voice-description').value='';onlineFoods=[];$('#food-results').innerHTML='';$('#food-search-status').textContent='';document.dispatchEvent(new Event('lift:meal-input-cleared'));}
  function renderFoodSearch(){
    const q=$('#voice-description').value.toLowerCase().trim(),root=$('#food-results');if(!q||!isFoodQuery(q)){root.innerHTML='';return;}
    const terms=q.split(/\s+/).filter(Boolean),local=allFoods().filter(f=>terms.every(term=>f.name.toLowerCase().includes(term))).slice(0,35),foods=[];
    for(const candidate of [...local,...onlineFoods]){const duplicate=foods.findIndex(existing=>sameFood(existing,candidate));if(duplicate<0)foods.push(candidate);else if(foodSourceRank(candidate)>foodSourceRank(foods[duplicate]))foods[duplicate]=candidate;}
    const shown=foods.slice(0,6);root.innerHTML=shown.map(f=>'<button type="button" class="food-result" data-food-id="'+esc(f.id)+'"><span>'+esc(f.name)+'</span><small>'+f.kcal+' kcal / 100 g</small><span class="food-result-plus" aria-hidden="true">+</span></button>').join('');
    $$('[data-food-id]').forEach(button=>button.onclick=()=>{const food=shown.find(f=>f.id===button.dataset.foodId);if(!food)return;appendDraftItems([{...calcItem(food,100),selected:true}],{selectExisting:true});clearMealInput();});
  }
  async function searchOnlineFoods(){
    const query=$('#voice-description').value.trim();if(query.length<2||!draft||$('#meal-editor').classList.contains('hidden'))return;
    cancelFoodSearch();const version=searchVersion,requestedDraft=draft,controller=new AbortController();searchRequest=controller;
    const status=$('#food-search-status'),current=()=>version===searchVersion&&draft===requestedDraft&&$('#voice-description').value.trim()===query&&!$('#meal-editor').classList.contains('hidden');
    status.textContent='Searching foods…';status.setAttribute('aria-busy','true');const timeout=setTimeout(()=>controller.abort(),15000);
    try{
      const endpoint=aiEndpoint('foods-search'),response=await fetch(endpoint.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+endpoint.token},body:JSON.stringify({query}),signal:controller.signal});
      let payload={};try{payload=await response.json();}catch{}if(!current())return;if(!response.ok)throw new Error(payload.error||'Online search is unavailable.');
      onlineFoods=[...(payload.usda||[]),...(payload.openFoodFacts||[])].filter(food=>food&&typeof food.id==='string'&&typeof food.name==='string'&&['kcal','protein','carbs','fat'].every(value=>Number.isFinite(Number(value))));renderFoodSearch();status.textContent=$('#food-results').innerHTML?'':'No matches. Describe the food and quantity to use AI.';
    }catch(error){if(current()){status.textContent=hasAISetup()?'Online search unavailable. You can still choose a local food.':'Choose a local food, or connect AI in Settings for more options.';renderFoodSearch();}}
    finally{clearTimeout(timeout);if(version===searchVersion){searchRequest=null;status.setAttribute('aria-busy','false');}}
  }
  function selectMealPhoto(event){
    const file=event.target.files?.[0];if(!file||!draft)return;event.target.value='';const mode=photoInputMode;photoInputMode='meal';setPhotoMenu(false);
    if(file.size>20000000){api.showToast('Please choose a photo smaller than 20 MB.');return;}
    draft.photo=file;draft.photoMode=mode;writeMealStatus('');if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(file);$('#meal-photo-preview').src=photoUrl;$('#meal-photo-preview').hidden=false;identifyFood();
  }
  function selectedDraftItems(){return (draft?.items||[]).filter(item=>item.selected!==false);}
  function updateMealFooter(){
    const items=selectedDraftItems(),value=totals([{items}]);
    $('#meal-draft-total').innerHTML='<strong>'+Math.round(value.kcal)+' <span>kcal</span></strong><small>'+Math.round(value.protein)+' g protein · '+Math.round(value.carbs)+' g carbs · '+Math.round(value.fat)+' g fat</small>';
    $('#meal-save').textContent='Save meal';$('#meal-save').disabled=!items.length||identifyingPhoto||mealInputBusy;
    $('#meal-selection-count').textContent=draft?.items.length?items.length+' selected':'';
  }
  function setItemGrams(item,grams){
    if(!item.per100&&Number(item.grams)>0)item.per100=Object.fromEntries(['kcal','protein','carbs','fat'].map(key=>[key,Number(item[key])*100/Number(item.grams)]));
    item.grams=Math.max(1,Math.min(10000,Math.round(grams)));const factor=item.grams/100;
    for(const key of ['kcal','protein','carbs','fat'])item[key]=key==='kcal'?Math.round(item.per100[key]*factor):+(item.per100[key]*factor).toFixed(1);
  }
  function renderDraft(){
    const root=$('#meal-draft-list');
    root.innerHTML=draft.items.map((item,index)=>'<article class="meal-food-card'+(item.selected===false?' is-unselected':'')+'" data-meal-card="'+index+'"><label class="meal-food-selection"><input type="checkbox" data-select-draft="'+index+'" '+(item.selected!==false?'checked':'')+'><span class="meal-food-name">'+esc(item.name)+'</span></label>'+(item.requiresConfirmation?'<span class="meal-food-confirm">To confirm</span>':'')+'<span class="meal-food-calories">'+Math.round(item.kcal)+' kcal</span><div class="meal-card-portion"><button type="button" data-draft-adjust="'+index+'" data-step="-10" aria-label="Reduce '+esc(item.name)+' by 10 grams">−</button><label><input type="number" min="1" max="10000" step="1" inputmode="numeric" value="'+item.grams+'" data-draft-grams="'+index+'" aria-label="Grams of '+esc(item.name)+'"><span>g</span></label><button type="button" data-draft-adjust="'+index+'" data-step="10" aria-label="Increase '+esc(item.name)+' by 10 grams">+</button></div><details class="meal-food-details"><summary>Edit details</summary><div class="meal-food-edit"><label>Name<input class="field" type="text" maxlength="80" value="'+esc(item.name)+'" data-draft-name="'+index+'"></label>'+['kcal','protein','carbs','fat'].map(key=>'<label>'+({kcal:'Calories',protein:'Protein g',carbs:'Carbs g',fat:'Fat g'}[key])+'<input class="field" type="number" min="0" step="0.1" value="'+item[key]+'" data-edit-draft="'+index+'" data-nutrient="'+key+'"></label>').join('')+(item.nutritionSource?'<small>'+esc(aiFoodQuality(item))+'</small>':'')+'<button type="button" class="meal-card-remove" data-remove-draft="'+index+'">Remove food</button></div></details></article>').join('')||'<div class="meal-composer-empty"><span aria-hidden="true">＋</span><p>Your meal starts here</p><small>Search, describe it, or add a photo.</small></div>';
    $$('[data-select-draft]').forEach(input=>input.onchange=()=>{const item=draft.items[Number(input.dataset.selectDraft)];item.selected=input.checked;input.closest('.meal-food-card').classList.toggle('is-unselected',!input.checked);updateMealFooter();});
    $$('[data-draft-adjust]').forEach(button=>button.onclick=()=>{const item=draft.items[Number(button.dataset.draftAdjust)];setItemGrams(item,Number(item.grams)+Number(button.dataset.step));syncDraftCard(button.closest('.meal-food-card'),item);updateMealFooter();});
    $$('[data-draft-grams]').forEach(input=>{input.oninput=()=>{const grams=Number(input.value);if(!Number.isFinite(grams)||grams<1||grams>10000)return;const item=draft.items[Number(input.dataset.draftGrams)];setItemGrams(item,grams);syncDraftCard(input.closest('.meal-food-card'),item,input);updateMealFooter();};input.onchange=()=>{input.value=draft.items[Number(input.dataset.draftGrams)].grams;};});
    $$('[data-draft-name]').forEach(input=>input.oninput=()=>{const item=draft.items[Number(input.dataset.draftName)];if(!input.value.trim())return;item.name=input.value.trim().slice(0,80);input.closest('.meal-food-card').querySelector('.meal-food-name').textContent=item.name;});
    $$('[data-edit-draft]').forEach(input=>input.oninput=()=>{const value=Number(input.value);if(!Number.isFinite(value)||value<0)return;const item=draft.items[Number(input.dataset.editDraft)],key=input.dataset.nutrient;item[key]=value;item.per100||={};item.per100[key]=value*100/item.grams;syncDraftCard(input.closest('.meal-food-card'),item,input);updateMealFooter();});
    $$('[data-remove-draft]').forEach(button=>button.onclick=()=>{draft.items.splice(Number(button.dataset.removeDraft),1);renderDraft();});updateMealFooter();
  }
  function syncDraftCard(card,item,activeInput){
    card.querySelector('.meal-food-calories').textContent=Math.round(item.kcal)+' kcal';const grams=card.querySelector('[data-draft-grams]');if(grams!==activeInput)grams.value=item.grams;
    card.querySelectorAll('[data-edit-draft]').forEach(input=>{if(input!==activeInput)input.value=item[input.dataset.nutrient];});
  }

  const openDb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open('lift-log-local-photos',1);req.onupgradeneeded=()=>req.result.createObjectStore('photos');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  async function clearStoredPhotos(){try{const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}catch{}const n=nutrition();let changed=false;Object.values(n.foodLogs||{}).forEach(day=>(day.meals||[]).forEach(meal=>{if(Object.prototype.hasOwnProperty.call(meal,'photoId')){delete meal.photoId;changed=true;}}));if(changed)api.saveState();}
  async function commitMeal(){
    if(identifyingPhoto||mealInputBusy)return;const items=selectedDraftItems();if(!items.length){api.showToast('Select at least one food before saving.');return;}
    const n=nutrition(),day=getDay(draft.date),savedItems=items.map(({selected,requiresConfirmation,...item})=>item);
    day.meals.push({id:'meal-'+Date.now().toString(36),name:draft.name,items:savedItems,favoriteId:draft.favoriteId||null,createdAt:new Date().toISOString()});n.foodLogs[draft.date]=day;api.saveState();draft.photo=null;closeMeal();render();api.showToast('Meal saved.');
  }

  async function saveWeight(){const kg=Number($('#weekly-weight').value),date=monday(today());if(!(kg>=30&&kg<=350)){api.showToast('Enter a weekly average weight between 30 and 350 kg.');return;}const n=nutrition(),existing=n.weightChecks.find(x=>x.date===date);if(existing)existing.kg=kg;else n.weightChecks.push({date,kg});n.profile.currentWeightKg=kg;api.saveState();render();api.showToast('Weekly average saved.');}
  function init(options){
    api=options;void clearStoredPhotos();$('#nutrition-date').value=today();$('#nutrition-date').addEventListener('change',render);$('#nutrition-prev-day').onclick=()=>shiftDiaryDate(-1);$('#nutrition-next-day').onclick=()=>shiftDiaryDate(1);$('#nutrition-add-meal').onclick=openMeal;$('#nutrition-weight-link').onclick=()=>{const card=$('#weekly-weight-card');card.scrollIntoView({behavior:'smooth',block:'center'});$('#weekly-weight').focus({preventScroll:true});};
    $('#food-ai-save').onclick=saveAISettings;$('#food-ai-generate').onclick=generateAIToken;$('#food-ai-copy').onclick=copyAIToken;$('#food-ai-test').onclick=testAIConnection;renderAISettings();
    $('#meal-cancel').onclick=closeMeal;
    $('#meal-save').onclick=commitMeal;
    $('#voice-description').addEventListener('input',()=>{cancelFoodSearch();onlineFoods=[];$('#food-search-status').textContent='';$('#food-search-status').setAttribute('aria-busy','false');renderFoodSearch();const query=$('#voice-description').value.trim();if(query.length>=2&&isFoodQuery(query))searchTimer=setTimeout(searchOnlineFoods,650);});
    $('#meal-photo-menu-toggle').onclick=()=>setPhotoMenu($('#meal-photo-menu').hidden);
    $('#meal-photo-retry').onclick=identifyFood;
    $('#meal-photo-camera').addEventListener('change',selectMealPhoto);$('#meal-photo').addEventListener('change',selectMealPhoto);
    $('#meal-camera-open').onclick=()=>{photoInputMode='meal';setPhotoMenu(false);$('#meal-photo-camera').click();};
    $('#meal-label-open').onclick=()=>{photoInputMode='product-label';setPhotoMenu(false);$('#meal-photo-camera').click();};
    $('#meal-upload-open').onclick=()=>{photoInputMode='meal';setPhotoMenu(false);$('#meal-photo').click();};
    document.addEventListener('keydown',event=>{
      if($('#meal-editor').classList.contains('hidden'))return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!$('#meal-photo-menu').hidden)setPhotoMenu(false);else closeMeal();return;}
      if(event.key==='Tab'){
        const focusable=$$('#meal-editor button, #meal-editor input, #meal-editor textarea, #meal-editor summary').filter(element=>!element.disabled&&element.getClientRects().length);
        const first=focusable[0],last=focusable.at(-1);if(!first)return;
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
    document.addEventListener('pointerdown',event=>{if(!$('#voice-meal-card').contains(event.target))setPhotoMenu(false);});
    if(window.visualViewport){const fit=()=>{const view=window.visualViewport;$('#meal-editor').style.setProperty('--meal-view-height',view.height+'px');$('#meal-editor').style.setProperty('--meal-view-top',view.offsetTop+'px');};window.visualViewport.addEventListener('resize',fit);window.visualViewport.addEventListener('scroll',fit);fit();}

    $('#nutrition-profile-save').onclick=saveProfile;$('#nutrition-target-save').onclick=()=>{const value=Number($('#nutrition-target-edit').value);if(!(value>=1000&&value<=7000)){api.showToast('Enter a daily target between 1,000 and 7,000 kcal.');return;}nutrition().calorieTarget=value;api.saveState();render();api.showToast('Calorie target saved.');};$('#weekly-weight-save').onclick=saveWeight;renderSettings();render();
  }
  async function requestAI(path,payload,options={}){
    if(!navigator.onLine)throw new Error('Connect to the internet to use AI.');
    const endpoint=aiEndpoint(path),controller=new AbortController(),cancel=()=>controller.abort();
    options.signal?.addEventListener('abort',cancel,{once:true});if(options.signal?.aborted)cancel();
    const timer=setTimeout(cancel,90000),audio=payload instanceof Blob;
    try{
      recordAIUsage(path==='transcribe'?'transcription':'coaching');
      const response=await fetch(endpoint.url,{method:'POST',headers:{'Content-Type':audio?(payload.type||'audio/webm'):'application/json',Authorization:'Bearer '+endpoint.token},body:audio?payload:JSON.stringify(payload),signal:controller.signal});
      let result={};try{result=await response.json();}catch{}
      if(response.status===404)throw new Error('Update and deploy your Cloudflare Worker to enable these AI features.');
      if(!response.ok)throw new Error(result.error||'AI is temporarily unavailable. Try again.');
      return result;
    }finally{clearTimeout(timer);options.signal?.removeEventListener('abort',cancel);}
  }
  function nutritionContext(){
    const n=nutrition(),date=$('#nutrition-date').value||today(),day=getDay(date),weight=Number(n.profile?.currentWeightKg)||0,kcal=Number(n.calorieTarget)||profileEstimate(n.profile||{})?.target||0;
    if(!(weight>0&&kcal>0))throw new Error('Save your current weight and calorie target in Settings first.');
    const targets={kcal,protein:Math.round(weight*1.8),fat:Math.round(weight*.6)};targets.carbs=Math.max(0,Math.round((kcal-targets.protein*4-targets.fat*9)/4));
    const consumed=totals(day.meals),remaining=Object.fromEntries(Object.keys(targets).map(k=>[k,Math.max(0,Math.round((targets[k]-consumed[k])*10)/10)]));
    return {date,targets,consumed,remaining,loggedFoods:(day.meals||[]).flatMap(m=>(m.items||[]).map(i=>i.name)).slice(-30),favoriteFoods:(n.favorites||[]).slice(0,10).map(f=>f.name)};
  }
  function validAIFoods(foods){return (Array.isArray(foods)?foods:[]).filter(food=>typeof food.name==='string'&&food.name.trim()&&Number.isFinite(food.grams)&&food.grams>0&&food.grams<=10000&&['kcal','protein','carbs','fat'].every(key=>Number.isFinite(food.nutritionPer100g?.[key])&&food.nutritionPer100g[key]>=0&&food.nutritionPer100g[key]<=(key==='kcal'?1000:100))).slice(0,8);}
  function showCoachFoods(foods,source='spoken-meal'){
    const valid=validAIFoods(foods);if(!valid.length)throw new Error('No clear foods were identified. Add more detail and try again.');
    if(!draft||$('#meal-editor').classList.contains('hidden'))openMeal();renderAISuggestions(valid,source);writeMealStatus('');
  }

  window.LiftNutrition={init,render,renderSettings,hasAISetup,requestWorkoutReview,requestAI,nutritionContext,showCoachFoods,openMeal,clearInput:clearMealInput,isFoodQuery,searchFoods:searchOnlineFoods,setInputBusy:busy=>{mealInputBusy=busy;if(draft)updateMealFooter();},isPhotoBusy:()=>identifyingPhoto,draftIdentity:()=>draft};
})();
