(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const nutrition = () => window.LiftNutrition;
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const errorText = error => error.name === 'AbortError' ? 'Request stopped. Try again when ready.' : error.message || 'AI is unavailable. Try again.';
  let voiceVersion = 0, recording = null, voiceRequest = null, descriptionTimer;
  let coachCache={};try{const saved=JSON.parse(localStorage.getItem('lift-log-coach-cache-v1')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))coachCache=saved;}catch{}
  async function cachedCoach(mode,data,force=false){
    const key=JSON.stringify(data),saved=coachCache?.[mode];
    if(!force&&saved?.key===key&&Date.now()-saved.at<6*3600000)return saved.result;
    const result=await nutrition().requestAI('coach',{mode,data});
    coachCache[mode]={key,at:Date.now(),result};try{localStorage.setItem('lift-log-coach-cache-v1',JSON.stringify(coachCache));}catch{}
    return result;
  }
  const voiceStatus = text => { $('#voice-meal-status').textContent = text; };

  function voiceBusy(busy) {
    $('#voice-record').disabled = busy;
    $('#voice-analyze').disabled = busy;
    $('#voice-description').disabled = busy;
    for(const id of ['meal-camera-open','meal-upload-open','meal-label-open']) $('#'+id).disabled=busy;
    $('#voice-meal-card').setAttribute('aria-busy',String(busy));
  }
  function cancelVoice(reset = false) {
    clearTimeout(descriptionTimer);
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
          await analyzeDescription();
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
  async function analyzeDescription() {
    if(nutrition().isPhotoBusy()){voiceStatus('Wait for the photo analysis to finish, then analyze your description.');return;}
    const description=$('#voice-description').value.trim();
    if(description.length<3) { voiceStatus('Describe the foods and quantities first.'); return; }
    cancelVoice();const version=voiceVersion,draft=nutrition().draftIdentity(),controller=new AbortController();voiceRequest=controller;
    voiceBusy(true);voiceStatus('Finding foods and portions…');
    $('#voice-analyze').hidden=true;
    try {
      const result=await nutrition().requestAI('describe-meal',{description},{signal:controller.signal});
      if(version!==voiceVersion||draft!==nutrition().draftIdentity()||$('#meal-editor').classList.contains('hidden'))return;
      nutrition().showCoachFoods(result.foods,'spoken-meal');voiceStatus('Foods ready. Review portions below and choose Add or Add all.');
    } catch(error) { if(version===voiceVersion){voiceStatus(errorText(error));$('#voice-analyze').hidden=false;} }
    finally { if(version===voiceVersion){voiceRequest=null;voiceBusy(false);} }
  }

  let nextBusy=false,nextRendered='',nextFailed={};
  async function suggestWorkout(force=false) {
    if(nextBusy)return;
    const status=$('#next-coach-status'),root=$('#next-coach-result'),button=$('#next-coach-generate');
    const context=window.LiftTrainingAI?.nextWorkoutContext();
    if(!force&&context&&(nextRendered===context.key||(nextFailed.key===context.key&&Date.now()-nextFailed.at<60000)))return;
    root.replaceChildren();
    if(!context) { status.textContent='All workouts this week are completed.';return; }
    if(!context.data.exercises.some(e=>e.history.length)) { status.textContent='Log completed sets for this workout first. Your current starting loads remain available.';return; }
    nextBusy=true;button.disabled=true;button.hidden=true;$('#next-coach-card').setAttribute('aria-busy','true');status.textContent='Reviewing recent performance for '+context.data.dayName+'…';
    try {
      const result=await cachedCoach('next-workout',context.data,force);
      if(window.LiftTrainingAI.nextWorkoutContext()?.key!==context.key)throw new Error('Your workout changed. Generate fresh suggestions.');
      const seen=new Set(),suggestions=(Array.isArray(result.suggestions)?result.suggestions:[]).filter(s=>{
        const e=context.data.exercises.find(e=>e.id===s.exerciseId);
        if(!e||seen.has(e.id)||!e.history.length||!Number.isFinite(s.weight)||!Number.isInteger(s.reps)||s.weight<e.minWeight||s.weight>e.maxWeight||s.reps<e.minReps||s.reps>e.maxReps||Math.abs((s.weight-e.referenceWeight)/e.step-Math.round((s.weight-e.referenceWeight)/e.step))>.001)return false;
        seen.add(e.id);return true;
      });
      status.textContent=String(result.summary||'Review the suggested working sets.');
      nextRendered=context.key;
      if(!suggestions.length) { root.textContent='No load changes suggested from the available history.';return; }
      root.innerHTML=suggestions.map((s,index)=>{const e=context.data.exercises.find(e=>e.id===s.exerciseId);return `<label class="coach-choice"><input type="checkbox" data-coach-choice="${index}" checked><span><strong>${escape(e.name)}</strong><span>${escape(e.sets)} sets · ${escape(s.weight)} kg × ${escape(s.reps)} reps</span><small>${escape(s.reason)}</small></span></label>`;}).join('')+'<button type="button" class="btn btn-soft btn-small ai-action" id="next-coach-apply"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><span>Apply selected</span></button>';
      $('#next-coach-apply').onclick=()=>{
        const selected=[...root.querySelectorAll('[data-coach-choice]:checked')].map(input=>suggestions[Number(input.dataset.coachChoice)]);
        if(!selected.length) { status.textContent='Select at least one exercise.';return; }
        if(window.LiftTrainingAI.applyNextWorkoutSuggestions(context,selected)){root.replaceChildren();status.textContent='Suggested working sets applied to '+context.data.dayName+'.';}
        else { root.replaceChildren();status.textContent='The workout changed. Generate new suggestions before applying.'; }
      };
    } catch(error){nextFailed={key:context.key,at:Date.now()};status.textContent=errorText(error);button.hidden=false;}
    finally {nextBusy=false;button.disabled=false;$('#next-coach-card').setAttribute('aria-busy','false');scheduleAuto();}
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
    foodBusy=true;button.disabled=true;button.hidden=true;$('#nutrition-coach-card').setAttribute('aria-busy','true');status.textContent='Finding foods for your remaining daily targets…';
    try {
      const result=await cachedCoach('nutrition',context,force);
      if(JSON.stringify(nutrition().nutritionContext())!==JSON.stringify(context))throw new Error('Your diary or targets changed. Generate fresh food suggestions.');
      foodRendered=key;
      if(!Array.isArray(result.foods)||!result.foods.length){status.textContent=String(result.summary||'No additional foods suggested.');return;}
      status.textContent=String(result.summary||'Food suggestions ready.');
      root.innerHTML='<button type="button" class="ai-action" id="nutrition-coach-review"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg><span>Review foods</span></button>';
      $('#nutrition-coach-review').onclick=()=>{
        try{
          if(JSON.stringify(nutrition().nutritionContext())!==key)throw new Error('Your diary changed. Food ideas are updating.');
          if(!$('#meal-editor').classList.contains('hidden'))throw new Error('Close your current meal before reviewing these foods.');
          nutrition().showCoachFoods(result.foods,'nutrition');
        }catch(error){status.textContent=errorText(error);scheduleAuto();}
      };
    } catch(error){foodFailed={key,at:Date.now()};status.textContent=errorText(error);button.hidden=false;}
    finally{foodBusy=false;button.disabled=false;$('#nutrition-coach-card').setAttribute('aria-busy','false');scheduleAuto();}
  }

  let autoTimer;
  function scheduleAuto(){
    clearTimeout(autoTimer);
    autoTimer=setTimeout(()=>{
      if(!navigator.onLine||document.hidden||!nutrition()?.hasAISetup())return;
      if($('#home-screen')?.classList.contains('active'))suggestWorkout();
      if($('#nutrition-screen')?.classList.contains('active'))suggestFoods();
    },600);autoTimer?.unref?.();
  }

  $('#voice-record').onclick=startRecording;
  $('#voice-stop').onclick=()=>stopRecording();
  $('#voice-cancel').onclick=()=>cancelVoice();
  $('#voice-analyze').onclick=analyzeDescription;
  $('#voice-description').addEventListener('input',()=>{cancelVoice();$('#voice-analyze').hidden=true;if($('#voice-description').value.trim().length>=3)descriptionTimer=setTimeout(analyzeDescription,1500);});
  $('#voice-meal-card').addEventListener('toggle',()=>{if(!$('#voice-meal-card').open)cancelVoice();});
  $('#meal-cancel').addEventListener('click',()=>cancelVoice(true));
  $('#meal-save').addEventListener('click',()=>cancelVoice());
  document.addEventListener('lift:meal-open',()=>cancelVoice(true));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')cancelVoice(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&recording)cancelVoice();});
  window.addEventListener('pagehide',()=>cancelVoice());
  $('#next-coach-generate').onclick=()=>suggestWorkout(true);
  $('#nutrition-coach-generate').onclick=()=>suggestFoods(true);
  document.addEventListener('lift:training-updated',scheduleAuto);
  document.addEventListener('lift:nutrition-updated',scheduleAuto);
  document.addEventListener('visibilitychange',scheduleAuto);
  document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',scheduleAuto));
  $('#food-ai-save').addEventListener('click',scheduleAuto);
  window.addEventListener('online',scheduleAuto);
  scheduleAuto();
})();
