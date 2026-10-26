(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const nutrition = () => window.LiftNutrition;
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const errorText = error => error.name === 'AbortError' ? 'Request stopped. Try again when ready.' : error.message || 'AI is unavailable. Try again.';
  const workoutCopy=(value,dayName)=>String(value||'').replace(/\bdayId\s*[:=]?\s*['\"]?d\d+['\"]?/gi,dayName||'the next workout').replace(/\bd\d+\b/gi,dayName||'the next workout');
  let voiceVersion = 0, recording = null, voiceRequest = null;
  let coachCache={};try{const saved=JSON.parse(localStorage.getItem('lift-log-coach-cache-v1')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))coachCache=saved;}catch{}
  async function cachedCoach(mode,data,force=false){
    const key=(mode==='nutrition'?'advice-v3:':mode==='next-workout'?'optimization-only-v2:':'')+JSON.stringify(data),saved=coachCache?.[mode];
    if(!force&&saved?.key===key&&Date.now()-saved.at<6*3600000&&(mode!=='nutrition'||saved.result?.foods?.length))return saved.result;
    const result=await nutrition().requestAI('coach',{mode,data});
    if(mode!=='nutrition'||result?.foods?.length){coachCache[mode]={key,at:Date.now(),result};try{localStorage.setItem('lift-log-coach-cache-v1',JSON.stringify(coachCache));}catch{}}
    return result;
  }
  const voiceStatus = text => { $('#voice-meal-status').textContent = text; };

  function voiceBusy(busy) {
    $('#voice-record').disabled = busy;
    $('#voice-analyze').disabled = busy;
    $('#voice-description').disabled = busy;
    $('#meal-photo-open').disabled=busy;
    nutrition().setInputBusy?.(busy);
    $('#voice-meal-card').setAttribute('aria-busy',String(busy));
    $('#voice-meal-status').classList.add('ai-status');$('#voice-meal-status').setAttribute('aria-busy',String(busy));
  }
  function cancelVoice(reset = false) {
    voiceVersion++;
    voiceRequest?.abort(); voiceRequest = null;
    if (recording) stopRecording(true);
    voiceBusy(false);
    if (reset) { $('#voice-description').value = ''; voiceStatus(''); }
  }
  function stopRecording(cancelled = false) {
    if (!recording) return;
    const session = recording;
    session.cancelled ||= cancelled;
    clearTimeout(session.limit); clearInterval(session.clock);
    if (session.recorder.state !== 'inactive') session.recorder.stop();
    session.stream.getTracks().forEach(track => track.stop());
    recording = null;
    $('#voice-stop').hidden = true; $('#voice-cancel').hidden = true;
    if (cancelled) { voiceBusy(false); voiceStatus('Recording cancelled.'); }
  }
  async function startRecording() {
    if (recording) return;
    if(nutrition().isPhotoBusy()){voiceStatus('Wait for the photo analysis to finish, then record your meal.');return;}
    cancelVoice();
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      voiceStatus('Voice recording is unavailable here. Open the HTTPS app or type your meal below.'); return;
    }
    if (!nutrition()?.hasAISetup()) { voiceStatus('Connect your Cloudflare Worker in Settings first.'); return; }
    if (!navigator.onLine) { voiceStatus('Connect to the internet, or type your meal and analyze it later.'); return; }
    const version = voiceVersion, draft = nutrition().draftIdentity();
    voiceBusy(true); voiceStatus('Allow microphone access to describe your meal in English.');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio:true});
      if (version !== voiceVersion || $('#meal-editor').classList.contains('hidden')) { stream.getTracks().forEach(t=>t.stop()); return; }
      const mime = ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mime ? {mimeType:mime} : undefined);
      const session = {recorder,stream,chunks:[],size:0,cancelled:false,started:Date.now(),version,draft};
      recorder.ondataavailable = event => {
        if (!event.data.size) return;
        session.size += event.data.size;
        if (session.size > 4_000_000) { session.chunks=[]; session.cancelled=true; stopRecording(true); voiceBusy(false); voiceStatus('Recording too large. Try a shorter description.'); return; }
        session.chunks.push(event.data);
      };
      recorder.onerror = () => { session.cancelled=true; stopRecording(true); voiceStatus('Recording failed. Try again or type your meal.'); };
      recorder.onstop = async () => {
        if(recording===session)stopRecording(session.cancelled);
        if (session.cancelled || session.version !== voiceVersion) return;
        const audio = new Blob(session.chunks,{type:recorder.mimeType || mime || 'audio/webm'});
        session.chunks=[];
        if (audio.size < 100) { voiceBusy(false); voiceStatus('No audio captured. Try again.'); return; }
        voiceStatus('Transcribing your meal…');
        const controller = new AbortController(); voiceRequest=controller;
        try {
          const result = await nutrition().requestAI('transcribe',audio,{signal:controller.signal});
          if (session.version !== voiceVersion || session.draft !== nutrition().draftIdentity() || $('#meal-editor').classList.contains('hidden')) return;
          if (typeof result.transcript !== 'string' || !result.transcript.trim()) throw new Error('No speech detected. Try again.');
          $('#voice-description').value=result.transcript.slice(0,2000);
          voiceRequest=null;voiceBusy(false);
          await analyzeDescription(true);
        } catch(error) { if (session.version===voiceVersion) voiceStatus(errorText(error)); }
        finally { if (session.version===voiceVersion) { voiceRequest=null; voiceBusy(false); } }
      };
      recording=session;
      recorder.start(1000);
      $('#voice-stop').hidden=false; $('#voice-cancel').hidden=false;
      voiceStatus('Recording · 0 / 30 seconds');
      session.clock=setInterval(()=>voiceStatus(`Recording · ${Math.min(30,Math.floor((Date.now()-session.started)/1000))} / 30 seconds`),1000);
      session.limit=setTimeout(()=>stopRecording(),30000);
    } catch(error) {
      stream?.getTracks().forEach(t=>t.stop());
      if(recording?.version===version)stopRecording(true);
      if(version===voiceVersion) { voiceBusy(false); voiceStatus(error.name==='NotAllowedError'?'Microphone access denied. Allow it in browser settings, or type your meal below.':errorText(error)); }
    }
  }
  async function analyzeDescription(fromVoice=false) {
    if(nutrition().isPhotoBusy()){voiceStatus('Wait for the photo analysis to finish, then analyze your description.');return;}
    const description=$('#voice-description').value.trim();
    if(!fromVoice&&(nutrition().isMatchingFood?.()||nutrition().isFoodQuery?.(description))){await nutrition().searchFoods();return;}
    if(description.length<3) { voiceStatus('Describe the foods and quantities first.'); return; }
    cancelVoice();const version=voiceVersion,draft=nutrition().draftIdentity(),controller=new AbortController();voiceRequest=controller;
    voiceBusy(true);voiceStatus('Finding foods and portions…');

    try {
      const result=await nutrition().requestAI('describe-meal',{description},{signal:controller.signal});
      if(version!==voiceVersion||draft!==nutrition().draftIdentity()||$('#meal-editor').classList.contains('hidden'))return;
      nutrition().showCoachFoods(result.foods,'spoken-meal');nutrition().clearInput?.();voiceStatus('');
    } catch(error) { if(version===voiceVersion){voiceStatus(errorText(error));} }
    finally { if(version===voiceVersion){voiceRequest=null;voiceBusy(false);} }
  }

  let foodBusy=false,foodRendered='',foodFailed={};
  async function suggestFoods(force=false) {
    if(foodBusy)return;
    const status=$('#nutrition-coach-status'),button=$('#nutrition-coach-generate'),root=$('#nutrition-coach-result');let context;
    try {context=nutrition().nutritionContext();}catch(error){status.textContent=errorText(error);return;}
    const key=JSON.stringify(context);
    if(!force&&(foodRendered===key||(foodFailed.key===key&&Date.now()-foodFailed.at<60000)))return;
    root.replaceChildren();
    if(context.remaining.kcal<=0){foodRendered=key;status.textContent='Your calorie target for this day is already met.';return;}
    foodBusy=true;button.disabled=true;button.hidden=true;$('#nutrition-coach-card').setAttribute('aria-busy','true');status.classList.add('ai-status');status.setAttribute('aria-busy','true');status.textContent='Finding foods for your remaining daily targets…';
    try {
      const result=await cachedCoach('nutrition',context,force);
      if(JSON.stringify(nutrition().nutritionContext())!==JSON.stringify(context))throw new Error('Your diary or targets changed. Generate fresh food suggestions.');
      foodRendered=key;
      if(!Array.isArray(result.foods)||!result.foods.length){status.textContent=String(result.summary||'No food ideas were returned. Try again.');button.hidden=false;return;}
      status.textContent=String(result.summary||'Food suggestions ready.');
      const remaining=context.remaining;
      root.innerHTML='<p class="nutrition-ideas-remaining">Remaining: '+Math.round(remaining.kcal)+' kcal · '+Math.round(remaining.protein||0)+' g protein · '+Math.round(remaining.carbs||0)+' g carbs · '+Math.round(remaining.fat||0)+' g fat</p><ul class="nutrition-ideas-text">'+result.foods.map(food=>{
        const calories=Math.round(Number(food.grams)/100*Number(food.nutritionPer100g?.kcal));
        return '<li>'+escape(food.name)+' — '+escape(food.grams)+' g'+(Number.isFinite(calories)?' (about '+calories+' kcal)':'')+'</li>';
      }).join('')+'</ul>';

    } catch(error){foodFailed={key,at:Date.now()};status.textContent=errorText(error);button.hidden=false;}
    finally{foodBusy=false;button.disabled=false;$('#nutrition-coach-card').setAttribute('aria-busy','false');status.setAttribute('aria-busy','false');scheduleAuto();}
  }

  let autoTimer;
  function scheduleAuto(){
    clearTimeout(autoTimer);
    autoTimer=setTimeout(()=>{
      if(!navigator.onLine||document.hidden)return;
      if($('#nutrition-screen')?.classList.contains('active')&&$('#nutrition-coach-card').open&&nutrition()?.hasAISetup())suggestFoods();
    },600);autoTimer?.unref?.();
  }

  $('#voice-record').onclick=startRecording;
  $('#voice-stop').onclick=()=>stopRecording();
  $('#voice-cancel').onclick=()=>cancelVoice();
  $('#voice-analyze').onclick=()=>analyzeDescription();
  $('#voice-description').addEventListener('input',()=>{cancelVoice();voiceStatus('');});
  $('#voice-description').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void analyzeDescription();}});
  document.addEventListener('lift:meal-close',()=>cancelVoice(true));
  document.addEventListener('lift:meal-input-cleared',()=>cancelVoice(true));
  $('#meal-cancel').addEventListener('click',()=>cancelVoice(true));
  $('#meal-save').addEventListener('click',()=>cancelVoice());
  document.addEventListener('lift:meal-open',()=>cancelVoice(true));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')cancelVoice(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&recording)cancelVoice();});
  window.addEventListener('pagehide',()=>cancelVoice());
  $('#nutrition-coach-generate').onclick=()=>suggestFoods(true);
  $('#nutrition-coach-card').addEventListener('toggle',scheduleAuto);
  document.addEventListener('lift:training-updated',scheduleAuto);
  document.addEventListener('lift:nutrition-updated',scheduleAuto);
  document.addEventListener('visibilitychange',scheduleAuto);
  document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',scheduleAuto));
  $('#food-ai-save').addEventListener('click',scheduleAuto);
  window.addEventListener('online',scheduleAuto);
  scheduleAuto();
})();
