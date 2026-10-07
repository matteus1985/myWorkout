(() => {
  'use strict';
  const KEY = 'lift-log-v1';
  const sourceDays = [
    {id:'d1',name:'Upper Strength',short:'Upper · Strength',minutes:60,exercises:[
      ex('incline-barbell','Incline Barbell Bench Press','Chest',[[70,6,7],[65,8,8],[62.5,8,9]],'barbell',150,'Keep the top set at 70 kg for now.'),
      ex('tbar-row','Chest-Supported T-Bar Row','Back',[[null,8,10],[null,8,10],[null,8,10]],'machine',120,'Choose a comfortable starting weight; leave 1–2 good reps in reserve.'),
      ex('machine-press','Machine Chest Press','Chest',[[80,10,12],[80,10,12],[77.5,10,12]],'machine',120),
      ex('low-high-fly','Low-to-High Cable Fly','Chest',[[null,12,15],[null,12,15],[null,12,15]],'cable',75,'Keep this exercise in your plan.'),
      ex('cable-lateral','Cable Lateral Raise','Side delts',[[5,15,18],[5,15,18],[5,15,18]],'cable',60)
    ]},
    {id:'d2',name:'Lower Body + Abs',short:'Lower body · Abs',minutes:60,exercises:[
      ex('hip-thrust','Hip Thrust','Glutes',[[85,8,8],[80,10,10],[80,10,10]],'barbell',150,'Maximum planned load: 85 kg. A resistance band is optional.'),
      ex('rdl','Romanian Deadlift','Hamstrings · Glutes',[[70,10,10],[70,9,10],[70,8,9]],'barbell',150),
      ex('leg-extension','Leg Extension','Quadriceps',[[null,10,12],[null,10,12],[null,10,12]],'machine',75,'Keep this exercise in your plan.'),
      ex('seated-curl','Seated Leg Curl','Hamstrings',[[null,10,12],[null,10,12],[null,10,12]],'machine',75),
      ex('calf-raise','Standing Calf Raise','Calves',[[112,12,15],[110,12,15],[110,12,15]],'machine',60),
      ex('cable-crunch','Cable Crunch','Abs',[[35,12,15],[35,12,15],[32.5,12,15]],'cable',60)
    ]},
    {id:'d3',name:'Delts + Arms',short:'Shoulders · Arms',minutes:55,exercises:[
      ex('reverse-pec','Reverse Pec Deck','Rear delts',[[null,15,20],[null,15,20],[null,15,20]],'machine',60),
      ex('preacher','Preacher Curl','Biceps',[[32.5,8,10],[30,10,12],[30,10,12]],'machine',75),
      ex('single-triceps','Single-Arm Cable Triceps Extension','Triceps',[[null,12,15],[null,12,15],[null,12,15]],'cable',60,'Enter the weight used for one arm; reps are per arm.'),
      ex('db-lateral','Dumbbell Lateral Raise','Side delts',[[12,12,12],[10,15,20],[10,15,20]],'dumbbell',60),
      ex('bayesian-curl','Bayesian Cable Curl','Biceps',[[null,10,15],[null,10,15],[null,10,15]],'cable',60)
    ]},
    {id:'d4',name:'Chest + Back Volume',short:'Chest · Back',minutes:60,exercises:[
      ex('incline-db','Incline Dumbbell Press','Chest',[[28,8,10],[26,10,12],[26,10,12]],'dumbbell',150,'Maximum planned load: 28 kg per hand. Do not go above this.'),
      ex('neutral-pulldown','Neutral-Grip Lat Pulldown','Back · Lats',[[72.5,9,10],[70,10,12],[67.5,10,12]],'machine',120),
      ex('chest-row','Chest-Supported Row','Back',[[72,10,12],[72,9,12],[68,10,12]],'machine',120,'Starting weights reflect your recent logged performance. Keep this exercise in your plan.'),
      ex('pec-deck','Pec Deck Fly','Chest',[[null,12,15],[null,12,15],[null,12,15]],'machine',60),
      ex('rear-delt','Rear Delt Fly Machine','Rear delts',[[40,12,15],[40,12,15],[37.5,12,15]],'machine',60),
      ex('hanging-raise','Weighted Hanging Leg Raise','Abs',[[7,12,15],[7,12,15],[7,10,12]],'bodyweight',60,'Add 7 kg if comfortable; reps are per set.')
    ]},
    {id:'d5',name:'Aesthetic Accessories',short:'Back · Arms · Abs',minutes:50,exercises:[
      ex('straight-pulldown','Straight-Arm Pulldown','Back · Lats',[[null,12,15],[null,12,15],[null,12,15]],'cable',60),
      ex('cable-curl','Cable Curl','Biceps',[[25,12,12],[22.5,12,15],[20,12,15]],'cable',60),
      ex('rope-pushdown','Rope Pushdown','Triceps',[[25,12,12],[22.5,12,15],[20,12,15]],'cable',60),
      ex('machine-lateral','Machine Lateral Raise','Side delts',[[null,12,20],[null,12,20],[null,12,20]],'machine',60),
      ex('ab-crunch','Ab Crunch Machine','Abs',[[30,12,15],[30,12,15],[30,12,15]],'machine',60)
    ]},
    {id:'d6',name:'Optional Weak Points',short:'Optional · Weak points',minutes:40,optional:true,exercises:[
      ex('dips','Weighted Dips','Chest · Triceps',[[10,8,10],[10,8,10],[10,8,10]],'bodyweight',120,'Enter added weight in kg; if 10 kg is not comfortable, use bodyweight.'),
      ex('pullover','Dumbbell Pullover','Chest · Back',[[22,12,12],[22,12,12],[20,12,15]],'dumbbell',75),
      ex('behind-lateral','Behind-the-Body Cable Lateral Raise','Side delts',[[null,15,20],[null,15,20],[null,15,20]],'cable',60),
      ex('hammer-curl','Hammer Curl','Biceps · Forearms',[[14,10,12],[14,10,12],[12,12,15]],'dumbbell',60)
    ]}
  ];
  function ex(id,name,muscle,sets,equipment,rest,note=''){return {id,name,muscle,sets:sets.map(([weight,min,max])=>({weight,min,max})),equipment,rest,note};}
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const LIFT_REPDB_ART = window.LIFT_REPDB_ART || {};
  const ART_ASSET_COUNT = new Set(Object.values(LIFT_REPDB_ART)).size;
  function setExerciseArt(img,id){if(!LIFT_REPDB_ART[id])return;img.onerror=()=>{img.onerror=null;img.hidden=true;};img.hidden=false;img.src=LIFT_REPDB_ART[id];}
  const fresh = () => ({schemaVersion:3,adaptivePlanVersion:2,illustratedAdaptiveVersion:1,week:20,logs:{},exerciseNames:{},lastBackupAt:null,daysPerWeek:5,experience:null,priorityMuscles:[],weightSteps:{barbell:2.5,dumbbell:2,machine:2.5,smith:2.5,cable:1,bodyweight:1,band:.5},equipment:['barbell','dumbbell','machine','smith','cable','bodyweight','band'],planRevision:0,weekPlans:{},persistentEdits:{},endedWeeks:{},exerciseArtCache:{ready:0,total:ART_ASSET_COUNT}});
  let state = loadState();
  let activeDay = null;
  let toastTimer = null;
  let restTimer = null;
  let restTargetEi = 0;
  let restComplete = false;
  let audioContext = null;
  migrateIllustratedPlans();
  let days = buildDays();
  function hydrate(parsed){const next={...fresh(),...parsed};next.needsAdaptiveRefresh=Number(parsed.adaptivePlanVersion||0)<2;next.adaptivePlanVersion=2;next.weekPlans||={};next.persistentEdits||={};next.endedWeeks||={};next.priorityMuscles=[...new Set((next.priorityMuscles||[]).filter(m=>LIFT_CATALOGUE.exercises.some(e=>e.primary.includes(m))))].slice(0,2);if(!next.exerciseArtCache||Number(next.exerciseArtCache.total)!==ART_ASSET_COUNT)next.exerciseArtCache={ready:0,total:ART_ASSET_COUNT};next.experience=next.experience||null;if(next.daysPerWeek==='valentin')next.daysPerWeek=5;delete next.valentinWeek;next.needsMigration=parsed.schemaVersion!==3;next.schemaVersion=3;delete next.workoutDuration;if(next.needsMigration&&next.equipment.includes('machine')&&!next.equipment.includes('smith'))next.equipment.push('smith');return next;}
  function loadState(){try{const raw=localStorage.getItem(KEY);if(!raw)return fresh();const parsed=JSON.parse(raw);if(!parsed||typeof parsed.logs!=='object'||!Number.isInteger(parsed.week))throw Error('Invalid state');return hydrate(parsed);}catch(err){return {...fresh(),storageRecovery:true};}}
  function saveState(){if(state.storageRecovery){showToast('Saved data could not be read. Import a backup in Settings.');return;}try{localStorage.setItem(KEY,JSON.stringify(state));updateBackupStatus();}catch(e){showToast('Could not save. Export a backup and free up space.');}}
  function showToast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
  function keyFor(dayId,week=state.week){return String(week)+(state.planRevision?'-v'+state.planRevision:'')+'-'+dayId;}
  function logFor(week,dayId){return state.logs[keyFor(dayId,week)]||null;}
  function itemFor(e){return LIFT_CATALOGUE.find(e.catalogId)||LIFT_CATALOGUE.find(e.name);}
  function hasRepDbArt(e){const item=e?.primary?e:itemFor(e||{});return !!(item&&LIFT_REPDB_ART[item.id]);}
  function makeIllustratedReplacement(exercise,usedIds=[]){const item=itemFor(exercise),source=item||{primary:String(exercise.muscle||'').split(' · ').map(x=>x.trim()).filter(Boolean),pattern:exercise.pattern,equipment:exercise.equipment,unit:exercise.unit||'reps'},alternative=LIFT_ENGINE.illustratedReplacement(source,state,{usedIds});if(!alternative)return null;const replacement=LIFT_ENGINE.descriptor(alternative,exercise.id+'-repdb-'+alternative.id,state,{sets:exercise.sets?.length||3,baseline:true});replacement.note=exercise.note||'';replacement.replacedExercise=exercise.catalogId||exercise.name;return replacement;}
  function sanitizeAdaptivePlan(plan){if(!plan||!Array.isArray(plan.days))return false;let changed=false;for(const day of plan.days){const original=day.exercises||[],used=original.filter(hasRepDbArt).map(e=>itemFor(e)?.id).filter(Boolean),next=[];for(const exercise of original){if(hasRepDbArt(exercise)){next.push(exercise);continue;}const replacement=makeIllustratedReplacement(exercise,used);if(replacement){next.push(replacement);used.push(replacement.catalogId);}changed=true;}day.exercises=next;day.minutes=estimateMinutes(day.exercises);day.optionalDropSet=day.minutes<65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!['inclinePress','chestPress','row','verticalPull','squat','lunge','hinge','deadlift','hipThrust','overheadPress','dip'].includes(e.pattern)&&e.unit!=='seconds'):-1;}return changed;}
  function migrateIllustratedPlans(){if(Number(state.illustratedAdaptiveVersion||0)>=2)return;let changed=false;for(const [key,plan] of Object.entries(state.weekPlans||{})){if(plan?.programId==='valentin'||plan?.days?.some(d=>/^v[1-5]$/.test(d.id))){delete state.weekPlans[key];changed=true;continue;}changed=sanitizeAdaptivePlan(plan)||changed;}delete state.persistentEdits.valentin;for(const edits of Object.values(state.persistentEdits||{}))for(const edit of Object.values(edits||{})){const beforeAdd=edit.add?.length||0,beforeReplace=edit.replace?.length||0;edit.add=(edit.add||[]).flatMap(x=>{if(hasRepDbArt(LIFT_CATALOGUE.find(x.catalogId)))return [x];const alternative=LIFT_ENGINE.illustratedReplacement(LIFT_CATALOGUE.find(x.catalogId),state);return alternative?[{...x,id:x.id+'-repdb-'+alternative.id,catalogId:alternative.id}]:[];});edit.replace=(edit.replace||[]).flatMap(x=>{if(hasRepDbArt(LIFT_CATALOGUE.find(x.catalogId)))return [x];const alternative=LIFT_ENGINE.illustratedReplacement(LIFT_CATALOGUE.find(x.catalogId),state);return alternative?[{...x,catalogId:alternative.id}]:[];});if(edit.add.length!==beforeAdd||edit.replace.length!==beforeReplace)changed=true;}delete state.valentinWeek;state.daysPerWeek=Number(state.daysPerWeek)||5;state.illustratedAdaptiveVersion=2;saveState();if(changed)showToast('Workout list updated. Your training history is unchanged.');}
  function guideFor(e){const item=itemFor(e);if(!item)return {setup:'Set up securely.',move:'Use a controlled movement.',avoid:'Avoid momentum.',options:[]};return {setup:item.guide.setup,move:item.guide.movement,avoid:item.guide.avoid,options:[[item.name,item.equipment],...availableAlternatives(e).map(x=>[x.name,x.equipment])]};}
  function equipmentFor(name){return LIFT_CATALOGUE.find(name)?.equipment||null;}
  function availableAlternatives(e){return LIFT_CATALOGUE.alternatives(e,state.experience).filter(x=>LIFT_REPDB_ART[x.id]);}
  function estimateMinutes(exercises){return LIFT_ENGINE.minutes(exercises);}
  function updateDropSuggestion(day){day.minutes=estimateMinutes(day.exercises);day.optionalDropSet=day.minutes<65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!['inclinePress','chestPress','row','verticalPull','squat','lunge','hinge','deadlift','hipThrust','overheadPress','dip'].includes(e.pattern)&&e.unit!=='seconds'):-1;}
  function snapshotKey(){return state.week+':'+(state.planRevision||0);}
  function savePlan(){const snapshot=state.weekPlans[snapshotKey()];if(snapshot)snapshot.days=LIFT_ENGINE.clone(days);saveState();}
  function buildDays(){
    state.weekPlans||={};const key=snapshotKey();if(state.needsAdaptiveRefresh){const saved=state.weekPlans[key],prefix=String(state.week)+(state.planRevision?'-v'+state.planRevision:'')+'-',hasLog=Object.entries(state.logs).some(([k,v])=>k.startsWith(prefix)&&v.updatedAt),hasManualEdits=saved?.days?.some(d=>d.customized);if(saved&&!hasLog&&!hasManualEdits)delete state.weekPlans[key];state.needsAdaptiveRefresh=false;}if(state.weekPlans[key]){const saved=LIFT_ENGINE.clone(state.weekPlans[key].days);saved.forEach(updateDropSuggestion);return saved;}
    let plan=LIFT_ENGINE.generate(state,sourceDays);
    if(state.needsMigration){
      const logs=Object.entries(state.logs).filter(([k,v])=>Number(k.split('-')[0])===state.week&&k.startsWith(String(state.week)+(state.planRevision?'-v'+state.planRevision:'')+'-')&&v.updatedAt);
      if(logs.length){
        const source=sourceDays.slice(0,Number(state.daysPerWeek)||5),all=sourceDays.flatMap(d=>d.exercises);
        plan.days=source.map((d,i)=>{const id='d'+(i+1),log=logs.find(([k])=>k.endsWith('-'+id))?.[1];let exercises=LIFT_ENGINE.clone(d.exercises);
          if(log){for(const [slot,entry] of Object.entries(log.exercises||{})){let e=exercises.find(x=>x.id===slot);if(!e){const original=all.find(x=>x.id===slot);if(original){e=LIFT_ENGINE.clone(original);exercises.push(e);}}if(e){e.name=entry.name||e.name;const item=LIFT_CATALOGUE.find(e.name);e.catalogId=item?.id;e.equipment=item?.equipment||e.equipment;while(e.sets.length<(entry.sets||[]).length)e.sets.push({...e.sets.at(-1)});}}}
          exercises.forEach(e=>{const name=state.exerciseNames?.[id]?.[e.id];if(name)e.name=name;const item=itemFor(e);e.catalogId=item?.id;e.pattern=item?.pattern;e.level=item?.level;e.unit=item?.unit||'reps';e.sets.forEach(s=>s.target=s.min);});
          return {id,name:log?.dayName||d.name.replace(/^Day \d+ · /,''),warmup:d.warmup||'Warm-up: comfortable movement and progressively heavier preparation sets.',exercises,minutes:estimateMinutes(exercises)};});plan.legacy=true;
      }state.needsMigration=false;
    }
    sanitizeAdaptivePlan(plan);state.weekPlans[key]=plan;return LIFT_ENGINE.clone(plan.days);
  }
  function latestExerciseLog(e){const item=itemFor(e);const prior=item?LIFT_ENGINE.histories(state,item)[0]:null;return prior?{name:item.name,sets:prior.sets,effort:prior.effort}:null;}
  function comparableLoad(e){const item=itemFor(e);if(!item)return null;const target=LIFT_ENGINE.targets(state,item,[{weight:null,min:6,max:12}],true);return target.estimated?target.sets[0].weight:null;}
  function plannedSets(day,e){return e.sets.map(s=>({weight:s.weight??0,target:s.target??s.min}));}
  function currentLog(day){
    const k=keyFor(day.id);
    if(!state.logs[k]) state.logs[k]={completed:false,updatedAt:null,exercises:{},dayName:day.name};
    if(!state.logs[k].exercises) state.logs[k].exercises={};
    state.logs[k].dayName=day.name;
    return state.logs[k];
  }
  function renderDays(){
    $('#day-list').innerHTML=days.map((d,i)=>{
      const log=logFor(state.week,d.id),done=!!log?.completed;
      const logged=(log?.exercises?Object.values(log.exercises).flatMap(x=>x.sets||[]).filter(s=>s?.done).length:0);
      return `<button class="day-card ${d.optional?'optional':''} ${done?'finished':''}" data-day="${d.id}" ${state.experience?'':'disabled'}><span class="day-num">${done?'✓':String(i+1).padStart(2,'0')}</span><span class="day-info"><span class="day-title">${d.optional?'Optional · ':''}${escapeHtml(d.name)}</span><span class="day-meta">${d.exercises.length} exercises · ${d.minutes} min${logged?' · '+logged+' '+(logged===1?'set':'sets')+' logged':''}</span></span><span class="day-arrow">›</span></button>`;
    }).join('');
    $$('#day-list [data-day]').forEach(b=>b.addEventListener('click',()=>openWorkout(b.dataset.day)));
  }
  function hasDone(log){return Object.values(log?.exercises||{}).some(e=>e.sets?.some(s=>s?.done))||(log?.variantHistory||[]).some(e=>e.sets?.some(s=>s?.done));}
  function updateHome(){
    $('#plan-count').textContent=days.length+' days · '+(state.experience||'Choose level');
    const next=days.find(d=>!(logFor(state.week,d.id)?.completed&&hasDone(logFor(state.week,d.id))))||days[0];
    if(next){$('#next-title').textContent='Day '+(days.indexOf(next)+1)+' · '+next.name;$('#next-subtitle').textContent=next.exercises.length+' exercises · about '+next.minutes+' minutes';$('#start-next').onclick=()=>openWorkout(next.id);}
    $('#start-next').disabled=!state.experience||!next?.exercises.length;$('#setup-level').classList.toggle('hidden',!!state.experience);$('#choose-level').onclick=()=>setScreen('settings-screen');
    const logs=Object.entries(state.logs).filter(([k])=>Number(k.split('-')[0])===state.week).map(([,v])=>v);$('#week-sessions').textContent=logs.filter(l=>l.completed&&hasDone(l)).length;$('#week-exercises').textContent=logs.reduce((n,l)=>n+[...Object.values(l.exercises||{}),...(l.variantHistory||[])].reduce((m,e)=>m+(e.sets||[]).filter(s=>s?.done).length,0),0);
    renderDays();renderVolume();updateBackupStatus();updateOnline();
  }
  function renderVolume(){const totals=LIFT_ENGINE.volume(days),missing=state.weekPlans[snapshotKey()]?.missingPatterns||[],changes=days.some(d=>d.customized);let text='';if(missing.length)text='Your equipment cannot cover every movement. Browse alternatives or update your equipment in Settings.';else if(changes){const low=['Chest','Back','Quadriceps','Hamstrings'].filter(m=>(totals[m]?.sets||0)<9||(totals[m]?.frequency||0)<2);const high=Object.entries(totals).filter(([,v])=>v.sets>18).map(([m])=>m);if(low.length)text='Less weekly coverage: '+low.join(', ')+'.';if(high.length)text+=' Higher weekly volume: '+high.join(', ')+'.';}$('#volume-warning').textContent=text;$('#volume-warning').classList.toggle('hidden',!text);$('#week-volume').innerHTML=Object.entries(totals).map(([m,v])=>'<div>'+escapeHtml(m)+' · '+v.sets+' sets / '+v.frequency+' days</div>').join('');}
  function endWeek(){
    const ending=state.week,nextState={...state,week:ending+1},next=LIFT_ENGINE.generate(nextState,sourceDays),missing=days.filter(d=>!(logFor(ending,d.id)?.completed&&hasDone(logFor(ending,d.id))));
    let untrained=0;
    for(const d of days){
      const log=state.logs[keyFor(d.id,ending)];
      for(const exercise of d.exercises){
        const done=log?.exercises?.[exercise.id]?.sets||[];
        const nextExercise=next.days.find(x=>x.id===d.id)?.exercises.find(x=>x.id===exercise.id);
        if(!nextExercise)continue;
        const completedIndexes=new Set(done.map((set,index)=>set?.done?index:-1).filter(index=>index>=0));
        if(!completedIndexes.size)untrained++;
        nextExercise.sets=nextExercise.sets.map((set,index)=>completedIndexes.has(index)?set:{...exercise.sets[index]});
      }
    }
    let changes=0;for(const d of next.days)for(const e of d.exercises){const old=days.find(x=>x.id===d.id)?.exercises.find(x=>x.id===e.id);if(old&&e.sets.some((s,i)=>s.weight!==old.sets[i]?.weight||s.target!==(old.sets[i]?.target??old.sets[i]?.min)))changes++;}
    openConfirm('End Week '+ending+'?',(days.length-missing.length)+' of '+days.length+' sessions completed. '+(missing.length?'Unfinished: '+missing.map(d=>d.name).join(', ')+'. ':'')+untrained+' exercises were not performed and keep their targets. '+changes+' exercises have new weight or rep targets. Your history stays saved.',()=>{
      if(state.week!==ending||state.endedWeeks[ending])return;state.endedWeeks[ending]={at:new Date().toISOString(),planKey:snapshotKey(),missing:missing.map(d=>d.id)};state.week=ending+1;state.weekPlans[snapshotKey()]=next;days=LIFT_ENGINE.clone(next.days);activeDay=null;stopRestTimer();saveState();updateHome();updateProgressScreen();renderSettings();setScreen('home-screen');showToast('Week '+state.week+' is ready.');
    },'End week');
  }
  function setScreen(id){
    $$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
    $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.screen===id));
    $('#tabbar').classList.toggle('hidden',id==='workout-screen');
    $('#rest-dock')?.classList.toggle('hidden',id!=='workout-screen');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function openWorkout(dayId){
    if(!state.experience){showToast('Choose your experience level in Settings first.');return;}
    activeDay=days.find(d=>d.id===dayId);if(!activeDay)return;
    const names=state.exerciseNames?.[dayId]||{};
    activeDay.exercises.forEach(e=>{const name=names[e.id],namedItem=LIFT_CATALOGUE.find(name),equipment=namedItem?.equipment;if(name&&namedItem&&LIFT_REPDB_ART[namedItem.id]&&equipment&&state.equipment.includes(equipment)&&name!==e.name){e.name=name;e.catalogId=namedItem.id;e.pattern=namedItem.pattern;e.level=namedItem.level;e.unit=namedItem.unit;e.equipment=equipment;e.note='';e.alternativeSelected=true;e.estimatedWeight=comparableLoad(e);e.sets.forEach(s=>s.weight=null);}});
    currentLog(activeDay);
    $('#workout-day-label').textContent='DAY '+(days.indexOf(activeDay)+1)+' · WEEK '+state.week;
    $('#workout-title').textContent=activeDay.name;
    renderWorkout();setScreen('workout-screen');
  }
  function renderWorkout(){
    stopRestTimer();
    const log=currentLog(activeDay);
    $('#exercise-list').innerHTML=activeDay.exercises.map((e,ei)=>{
      const data=log.exercises[e.id]||{sets:[]};
      const planned=plannedSets(activeDay,e);
      const setRows=e.sets.map((s,si)=>{
        const saved=data.sets?.[si]||{};const weight=saved.weight??planned[si].weight;const reps=saved.reps??planned[si].target;const done=!!saved.done;
        const weightStep=Number(state.weightSteps?.[e.equipment]||0.5);
        return `<div class="set-row" data-set-row="${ei}-${si}"><span class="set-index">${String(si+1).padStart(2,'0')}</span><div class="stepper"><button class="step-button" data-step="-" aria-label="Decrease weight">−</button><input class="field weight-input" type="number" inputmode="decimal" min="0" step="${weightStep}" aria-label="Set ${si+1} weight in kilograms" value="${escapeAttr(weight)}" data-e="${ei}" data-s="${si}" data-field="weight"><button class="step-button" data-step="+" aria-label="Increase weight">+</button></div><div class="stepper"><button class="step-button" data-step="-" aria-label="Decrease reps">−</button><input class="field reps-input" type="number" inputmode="numeric" min="0" step="1" aria-label="Set ${si+1} ${e.unit==='seconds'?'seconds':'reps'}" value="${escapeAttr(reps)}" data-e="${ei}" data-s="${si}" data-field="reps"><button class="step-button" data-step="+" aria-label="Increase reps">+</button></div><button class="check ${done?'done':''}" data-check="${ei}-${si}" aria-label="${done?'Mark set incomplete':'Mark set complete'}">✓</button></div>`;
      }).join('');
      const illustration=itemFor(e);
      const dropEnabled=activeDay.optionalDropSet===ei,drop=data.dropSet||{},step=Number(state.weightSteps?.[e.equipment]||1),dropWeight=Math.max(0,Math.floor(Number(planned.at(-1)?.weight||0)*.8/step)*step),dropRow=drop.enabled?`<div class="set-row drop-set-row"><span class="set-index">D</span><div class="stepper"><input class="field weight-input" type="number" inputmode="decimal" min="0" step="${step}" aria-label="Drop set weight in kilograms" value="${escapeAttr(drop.weight??dropWeight)}" data-e="${ei}" data-field="weight" data-drop="true"></div><div class="stepper"><input class="field reps-input" type="number" inputmode="numeric" min="1" step="1" aria-label="Drop set reps" value="${escapeAttr(drop.reps??e.sets.at(-1).target??e.sets.at(-1).max)}" data-e="${ei}" data-field="reps" data-drop="true"></div><button class="check ${drop.done?'done':''}" data-drop-check="${ei}" aria-label="${drop.done?'Mark drop set incomplete':'Complete drop set'}">✓</button></div>`:'';
      const isComplete=e.sets.length>0&&e.sets.every((_,si)=>!!data.sets?.[si]?.done);
      return `<article class="exercise ${isComplete?'completed collapsed':''}" data-exercise="${ei}"><div class="exercise-top"><img class="exercise-thumb workout-thumb" src="media/exercises/${escapeAttr(illustration?.id||'')}.svg" alt="" loading="lazy" decoding="async"><div class="exercise-title"><h3>${escapeHtml(e.name)}</h3><div class="muscle">${escapeHtml(e.muscle)} · ${escapeHtml(itemFor(e)?.level||'')}</div></div><button class="info-button" data-guide="${ei}" aria-label="How to do ${escapeAttr(e.name)}">i</button><span class="target">${e.sets.length} × ${e.sets[0].min===e.sets[0].max?e.sets[0].min:e.sets[0].min+'–'+e.sets[0].max}</span>${isComplete?'<span class="exercise-done-label">Done</span>':''}<button type="button" class="exercise-collapse" data-collapse="${ei}" aria-label="${isComplete?'Expand':'Collapse'} ${escapeAttr(e.name)}" aria-expanded="${!isComplete}">${isComplete?'⌄':'⌃'}</button></div><div class="exercise-body">${e.note?`<p class="exercise-note">${escapeHtml(e.note)}</p>`:''}<div class="set-head"><span>Set</span><span>Weight · kg</span><span>${e.unit==='seconds'?'Seconds':'Reps'}</span><span></span></div>${setRows}${dropRow}${dropEnabled?`<button class="text-button drop-toggle" data-drop-toggle="${ei}">${drop.enabled?'− Remove optional drop set':'＋ Optional drop set · about 20% lighter'}</button>${drop.enabled?'<div class="settings-note drop-hint">After your final set, use controlled reps and stop with about 0–1 reps left.</div>':''}`:''}<div class="exercise-actions"><div class="timer-cluster"><button type="button" class="icon-action remove-icon-button" data-remove="${ei}" aria-label="Remove ${escapeAttr(e.name)}" title="Remove exercise"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"/></svg></button><button type="button" class="icon-action alternatives-button" data-alt-open="${ei}" aria-label="Choose an alternative for ${escapeAttr(e.name)}" title="Choose alternative"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3l4 4-4 4M20 7H4m4 14-4-4 4-4m-4 4h16"/></svg></button></div></div><div class="effort-row"><label>Reps left <span class="muted">(optional)</span></label><div class="effort-choices" role="group" aria-label="Reps left"><button type="button" class="effort-choice ${data.effort===0?'selected':''}" data-effort="${ei}" data-value="0" aria-pressed="${data.effort===0}">0–1</button><button type="button" class="effort-choice ${data.effort===2?'selected':''}" data-effort="${ei}" data-value="2" aria-pressed="${data.effort===2}">2–3</button><button type="button" class="effort-choice ${data.effort===4?'selected':''}" data-effort="${ei}" data-value="4" aria-pressed="${data.effort===4}">4+</button></div></div></div></article>`;

    }).join('');
    $$('#exercise-list .workout-thumb').forEach((img,i)=>setExerciseArt(img,itemFor(activeDay.exercises[i])?.id||''));
    $$('#exercise-list .exercise').forEach(card=>{const rows=card.querySelectorAll('.set-row:not(.drop-set-row)'),effort=card.querySelector('.effort-row');if(rows.length&&effort)rows[rows.length-1].after(effort);});
    const firstIncomplete=activeDay.exercises.findIndex((e,ei)=>!exerciseComplete(e,log,ei));restTargetEi=firstIncomplete>=0?firstIncomplete:0;restComplete=false;$('#rest-dock').classList.remove('hidden');updateRestDock();
    $$('#exercise-list .weight-input,#exercise-list .reps-input').forEach(input=>input.addEventListener('input',onSetInput));
    $$('#exercise-list .check[data-check]').forEach(b=>b.addEventListener('click',()=>toggleSet(b)));
    $$('#exercise-list [data-drop-check]').forEach(b=>b.addEventListener('click',()=>toggleDropSet(b)));
    $$('#exercise-list [data-drop-toggle]').forEach(b=>b.addEventListener('click',()=>toggleDropRow(+b.dataset.dropToggle)));
    $$('#exercise-list .step-button').forEach(b=>b.addEventListener('click',()=>stepInput(b)));
    $$('#exercise-list [data-alt-open]').forEach(b=>b.addEventListener('click',()=>openAlternativePicker(+b.dataset.altOpen)));
    $$('#exercise-list [data-collapse]').forEach(b=>b.addEventListener('click',()=>toggleExerciseCollapse(+b.dataset.collapse)));
    $$('#exercise-list .effort-choice').forEach(b=>b.addEventListener('click',()=>recordEffort(b)));
    $$('#exercise-list .info-button').forEach(b=>b.addEventListener('click',()=>openGuide(+b.dataset.guide)));
    $$('#exercise-list [data-remove]').forEach(b=>b.addEventListener('click',()=>removeExercise(+b.dataset.remove)));
    updateSessionProgress();
  }
  function onSetInput(ev){
    const input=ev.currentTarget,e=activeDay.exercises[+input.dataset.e],si=+input.dataset.s,field=input.dataset.field;
    const log=currentLog(activeDay);if(!log.exercises[e.id])log.exercises[e.id]={sets:[],name:e.name};
    if(input.dataset.drop==='true'){const drop=log.exercises[e.id].dropSet||(log.exercises[e.id].dropSet={enabled:true,done:false});drop[field]=input.value===''?'':Number(input.value);const row=input.closest('.set-row'),other=row.querySelector(field==='weight'?'.reps-input':'.weight-input');if(other.value!=='')drop[field==='weight'?'reps':'weight']=Number(other.value);log.updatedAt=new Date().toISOString();saveState();return;}
    if(!log.exercises[e.id].sets[si])log.exercises[e.id].sets[si]={};
    log.exercises[e.id].name=e.name;log.exercises[e.id].catalogId=e.catalogId;
    const set=log.exercises[e.id].sets[si],val=input.value===''?'':Number(input.value);set[field]=val;
    const row=input.closest('.set-row');const other=row.querySelector(field==='weight'?'.reps-input':'.weight-input');const otherField=field==='weight'?'reps':'weight';
    if(other.value!=='')set[otherField]=Number(other.value);
    log.updatedAt=new Date().toISOString();saveState();updateSessionProgress();
  }
  function stepInput(button){
    const input=button.parentElement.querySelector('input'),field=input.dataset.field,delta=button.dataset.step==='+'?1:-1,step=field==='reps'?1:(Number(input.step)||Number(state.weightStep)||0.5);
    input.value=String(Math.max(0,Math.round((Number(input.value||0)+delta*step)*100)/100));input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function toggleSet(btn){
    const [ei,si]=btn.dataset.check.split('-').map(Number),e=activeDay.exercises[ei],log=currentLog(activeDay);
    if(!log.exercises[e.id])log.exercises[e.id]={sets:[],name:e.name};if(!log.exercises[e.id].sets[si])log.exercises[e.id].sets[si]={};
    log.exercises[e.id].name=e.name;log.exercises[e.id].catalogId=e.catalogId;
    const row=$(`[data-set-row="${ei}-${si}"]`),w=row.querySelector('.weight-input'),r=row.querySelector('.reps-input');
    if(!btn.classList.contains('done')&&(!Number.isFinite(Number(r.value))||Number(r.value)<=0||!Number.isFinite(Number(w.value))||Number(w.value)<0)){showToast('Enter a valid weight and the reps you completed first.');r.focus();return;}
    if(w.value!=='')log.exercises[e.id].sets[si].weight=Number(w.value);
    if(r.value!=='')log.exercises[e.id].sets[si].reps=Number(r.value);
    const s=log.exercises[e.id].sets[si];s.done=!s.done;btn.classList.toggle('done',s.done);btn.setAttribute('aria-label',s.done?'Mark set incomplete':'Mark set complete');log.updatedAt=new Date().toISOString();saveState();updateSessionProgress();
    const card=btn.closest('.exercise');
    if(s.done){startRest(ei,true);if(exerciseComplete(e,log,ei)){card.classList.add('completed','collapsed');const collapse=card.querySelector('[data-collapse]');collapse.setAttribute('aria-expanded','false');collapse.setAttribute('aria-label','Expand '+e.name);collapse.textContent='⌄';const next=nextIncompleteExercise(ei,log);if(next>=0){expandExercise(next);requestAnimationFrame(()=>document.querySelector('[data-exercise="'+next+'"]').scrollIntoView({behavior:'smooth',block:'center'}));}}}
    else{if(restTimer?.ei===ei)stopRestTimer();card.classList.remove('completed','collapsed');const collapse=card.querySelector('[data-collapse]');collapse.setAttribute('aria-expanded','true');collapse.setAttribute('aria-label','Collapse '+e.name);collapse.textContent='⌃';}
    updateRestDock();
  }
  function toggleDropRow(ei){const e=activeDay.exercises[ei],log=currentLog(activeDay);log.exercises[e.id]||={name:e.name,catalogId:e.catalogId,sets:[]};const drop=log.exercises[e.id].dropSet||(log.exercises[e.id].dropSet={enabled:false,done:false});drop.enabled=!drop.enabled;log.updatedAt=new Date().toISOString();saveState();renderWorkout();}
  function toggleDropSet(btn){const ei=Number(btn.dataset.dropCheck),e=activeDay.exercises[ei],log=currentLog(activeDay),row=btn.closest('.set-row'),weight=row.querySelector('.weight-input'),reps=row.querySelector('.reps-input');if(!log.exercises[e.id])log.exercises[e.id]={name:e.name,catalogId:e.catalogId,sets:[]};const drop=log.exercises[e.id].dropSet||(log.exercises[e.id].dropSet={enabled:true,done:false});if(!drop.done&&(weight.value===''||!Number.isFinite(Number(weight.value))||Number(weight.value)<0||!Number.isFinite(Number(reps.value))||Number(reps.value)<=0)){showToast('Enter the drop set load and reps first.');reps.focus();return;}drop.weight=Number(weight.value);drop.reps=Number(reps.value);drop.done=!drop.done;log.updatedAt=new Date().toISOString();saveState();btn.classList.toggle('done',drop.done);btn.setAttribute('aria-label',drop.done?'Mark drop set incomplete':'Complete drop set');}
  function suggestionText(item){const planned=LIFT_ENGINE.descriptor(item,'preview',state,{baseline:true}),prior=LIFT_ENGINE.histories(state,item)[0],sets=planned.sets,load=sets.map(s=>s.weight).every(v=>v===sets[0].weight)?sets[0].weight+' kg':sets.map(s=>s.weight+' kg').join(' / '),reps=sets[0].min===sets[0].max?sets[0].min:sets[0].min+'–'+sets[0].max;const source=prior?'Based on your logged exercise history.':planned.estimated?'Estimated from '+planned.estimateSource+'. Calibrate conservatively.':'No comparable history; 0 kg starting value to calibrate.';return `Suggested load: ${load} · ${reps} reps per set. ${source}`;}
  function openAlternativePicker(ei){const exercise=activeDay?.exercises[ei];if(!exercise)return;const current=itemFor(exercise),options=availableAlternatives(exercise).filter(item=>item.id!==current?.id);$('#alternative-title').textContent='Alternatives for '+exercise.name;$('#alternative-list').innerHTML=options.map(item=>{const usable=state.equipment.includes(item.equipment),target=LIFT_ENGINE.descriptor(item,'preview',state,{baseline:true}),load=target.sets.map(s=>s.weight+' kg').filter((v,i,a)=>i===0||v!==a[i-1]).join(' / '),reps=target.sets[0].min+'–'+target.sets[0].max,source=target.estimated?'Estimated':LIFT_ENGINE.histories(state,item).length?'From your history':'Calibrate';return `<label class="alternative-option ${usable?'':'unavailable'}"><img src="${escapeAttr(LIFT_REPDB_ART[item.id])}" alt="" loading="lazy" decoding="async"><span class="alternative-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(LIFT_CATALOGUE.equipmentLabels[item.equipment])} · ${escapeHtml(item.level)}${usable?'':' · not selected in Settings'}</small><span class="alternative-target">${escapeHtml(load)} · ${escapeHtml(reps)} reps <em>${source}</em></span></span><input type="radio" name="alternative-choice" data-alt-choice="${escapeAttr(item.id)}" data-alt-for="${ei}" aria-label="Select ${escapeAttr(item.name)}" ${usable?'':'disabled'}></label>`;}).join('')||'<div class="empty">No illustrated alternatives are available for this exercise yet.</div>';$('#alternative-modal').classList.remove('hidden');$('#alternative-close').focus();$$('[data-alt-choice]').forEach(radio=>radio.addEventListener('change',()=>{const target=LIFT_CATALOGUE.find(radio.dataset.altChoice),index=Number(radio.dataset.altFor);$('#alternative-modal').classList.add('hidden');openScope('Replace exercise?',target.name+'. '+suggestionText(target),'replace',scope=>replaceExercise(index,target,scope));}));}
  function openGuide(index){showGuide(itemFor(activeDay.exercises[index]));}
  function showGuide(item){if(!item)return;$('#guide-title').textContent=item.name;$('#guide-content').innerHTML='<ol><li>'+escapeHtml(item.guide.setup)+'</li><li>'+escapeHtml(item.guide.movement)+'</li></ol><div class="avoid"><strong>Avoid:</strong> '+escapeHtml(item.guide.avoid)+'</div><p class="guide-note">'+escapeHtml(item.primary.join(', '))+' · '+escapeHtml(item.equipment)+' · '+escapeHtml(item.level)+'</p>';$('#guide-modal').classList.remove('hidden');$('#guide-close').focus();}
  function recordEffort(button){const e=activeDay.exercises[+button.dataset.effort],log=currentLog(activeDay);log.exercises[e.id]||={name:e.name,catalogId:e.catalogId,sets:[]};const value=Number(button.dataset.value),selected=log.exercises[e.id].effort===value;log.exercises[e.id].effort=selected?null:value;log.updatedAt=new Date().toISOString();saveState();button.closest('.effort-row').querySelectorAll('.effort-choice').forEach(choice=>{const active=!selected&&Number(choice.dataset.value)===value;choice.classList.toggle('selected',active);choice.setAttribute('aria-pressed',String(active));});}
  function updateSessionProgress(){
    if(!activeDay)return;const log=currentLog(activeDay),sets=activeDay.exercises.flatMap(e=>e.sets.map((_,i)=>log.exercises[e.id]?.sets?.[i]));const done=sets.filter(s=>s?.done).length,total=sets.length,pc=total?Math.round(done/total*100):0;
    $('#session-progress').style.width=pc+'%';$('.session-banner .progress-bar').setAttribute('aria-valuenow',String(pc));
  }
  function finishWorkout(){
    stopRestTimer();const log=currentLog(activeDay);if(!hasDone(log)){showToast('Complete at least one set before finishing.');return;}log.completed=true;log.updatedAt=new Date().toISOString();saveState();updateHome();setScreen('home-screen');activeDay=null;showToast('Workout saved. Nice work!');
  }
  function closeWorkout(){
    if(!activeDay)return;const hasLog=!!logFor(state.week,activeDay.id)?.updatedAt;
    if(hasLog)openConfirm('Close workout?','Your entries have been saved. You can come back and continue later.',()=>{stopRestTimer();setScreen('home-screen');activeDay=null;});else{stopRestTimer();setScreen('home-screen');activeDay=null;}
  }
  function openConfirm(title,copy,action,label='Confirm'){$('#modal-confirm').textContent=label;$('#modal-cancel').textContent='Cancel';$('#modal-title').textContent=title;$('#modal-copy').textContent=copy;$('#confirm-modal').classList.remove('hidden');$('#modal-cancel').onclick=()=>$('#confirm-modal').classList.add('hidden');$('#modal-confirm').onclick=()=>{const fn=action;$('#confirm-modal').classList.add('hidden');fn();};}
  function exerciseComplete(e,log,ei){return e.sets.length>0&&e.sets.every((_,si)=>!!log.exercises?.[e.id]?.sets?.[si]?.done);}
  function nextIncompleteExercise(fromEi,log){for(let i=fromEi+1;i<activeDay.exercises.length;i++)if(!exerciseComplete(activeDay.exercises[i],log,i))return i;return -1;}
  function expandExercise(ei){const card=document.querySelector('[data-exercise="'+ei+'"]');if(!card)return;card.classList.remove('collapsed');const button=card.querySelector('[data-collapse]');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Collapse '+activeDay.exercises[ei].name);button.textContent='⌃';}
  function toggleExerciseCollapse(ei){const card=document.querySelector('[data-exercise="'+ei+'"]');if(!card)return;const collapsed=card.classList.toggle('collapsed'),button=card.querySelector('[data-collapse]');button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',(collapsed?'Expand ':'Collapse ')+activeDay.exercises[ei].name);button.textContent=collapsed?'⌄':'⌃';}
  function restSecondsFor(ei){const e=activeDay?.exercises[ei];if(!e)return 150;return Number(currentLog(activeDay).exercises[e.id]?.restDuration)||e.rest;}
  function updateRestDock(){const dock=$('#rest-dock');if(!dock||!activeDay)return;const label=$('#rest-label'),nextLabel=$('#rest-next-exercise'),display=$('#rest-display'),button=$('#rest-toggle'),log=currentLog(activeDay);if(restTimer){dock.classList.remove('rest-complete');label.textContent='Rest';const next=nextIncompleteExercise(-1,log);nextLabel.textContent=next>=0?'Next · '+activeDay.exercises[next].name:'Workout complete';display.textContent=formatTime(Math.max(0,Math.ceil((restTimer.endAt-Date.now())/1000)));button.classList.add('running');button.setAttribute('aria-label','Cancel rest timer');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';}
    else if(restComplete){dock.classList.add('rest-complete');label.textContent='Rest complete';const next=nextIncompleteExercise(-1,log);nextLabel.textContent=next>=0?'Ready · '+activeDay.exercises[next].name:'Workout complete';display.textContent='00:00';button.classList.remove('running');button.setAttribute('aria-label','Start rest timer');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';}
    else{dock.classList.remove('rest-complete');const ei=restTargetEi??0;label.textContent='Rest timer';nextLabel.textContent=activeDay.exercises[ei]?.name||'';display.textContent=formatTime(restSecondsFor(ei));button.classList.remove('running');button.setAttribute('aria-label','Start rest timer');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';}}
  function startRest(ei,automatic=false){const e=activeDay?.exercises[ei];if(!e)return;if(restTimer?.ei===ei&&!automatic){stopRestTimer();return;}stopRestTimer();armRestAudio();restTargetEi=ei;restComplete=false;const seconds=Math.max(1,Math.min(5999,restSecondsFor(ei)));restTimer={endAt:Date.now()+seconds*1000,ei,interval:null};updateRestDock();const tick=()=>{if(!restTimer)return;const remaining=Math.max(0,Math.ceil((restTimer.endAt-Date.now())/1000));$('#rest-display').textContent=formatTime(remaining);if(!remaining){clearInterval(restTimer.interval);restTimer=null;restComplete=true;playRestChime();updateRestDock();showToast('Rest complete.');}};tick();if(restTimer)restTimer.interval=setInterval(tick,250);}
  function adjustRestDuration(button){const ei=restTimer?.ei??restTargetEi??0,e=activeDay?.exercises[ei];if(!e)return;restTargetEi=ei;const next=Math.max(10,Math.min(5999,restSecondsFor(ei)+Number(button.dataset.restStep)*10)),log=currentLog(activeDay);if(!log.exercises[e.id])log.exercises[e.id]={name:e.name,catalogId:e.catalogId,sets:[]};log.exercises[e.id].restDuration=next;saveState();if(!restTimer)updateRestDock();}
  function toggleGlobalRest(){if(restTimer){stopRestTimer();return;}restComplete=false;startRest(restTargetEi??0);}
  function stopRestTimer(){if(restTimer){clearInterval(restTimer.interval);restTimer=null;}restComplete=false;if(activeDay)updateRestDock();}
  function armRestAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();if(audioContext.state==='suspended')audioContext.resume();}catch(e){}}
  function playRestChime(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();if(audioContext.state==='suspended')audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=880;gain.gain.setValueAtTime(0.0001,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(0.18,audioContext.currentTime+0.02);gain.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime+0.32);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.34);}catch(e){}}
  function formatTime(sec){return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
  function updateProgressScreen(){
    const vals=Object.entries(state.logs).map(([k,v])=>({k,v}));const completed=vals.filter(x=>x.v.completed&&hasDone(x.v)).length;const countSets=entry=>(entry?.sets||[]).filter(s=>s?.done).length;const allSets=vals.reduce((n,x)=>n+Object.values(x.v.exercises||{}).reduce((m,e)=>m+countSets(e),0)+(x.v.variantHistory||[]).reduce((m,e)=>m+countSets(e),0),0);
    $('#all-sessions').textContent=completed;$('#all-sets').textContent=allSets;
    renderCharts(vals);

  }
  function renderCharts(vals){
    const sessions=[];for(const {k,v} of vals){for(const entry of [...Object.values(v.exercises||{}),...(v.variantHistory||[])]){const item=itemFor(entry),sets=(entry.sets||[]).filter(s=>s?.done&&Number(s.reps)>0&&s.weight!==''&&s.weight!=null&&Number.isFinite(Number(s.weight))&&Number(s.weight)>=0);if(!sets.length)continue;sessions.push({id:item?.id||entry.name,name:item?.name||entry.name,date:entry.updatedAt||v.updatedAt,weight:Math.max(...sets.map(s=>Number(s.weight))),reps:sets.reduce((n,s)=>n+Number(s.reps),0)/sets.length,sets,primary:item?.primary||['Other'],week:Number(k.split('-')[0]),unit:item?.unit||'reps'});}}
    const unique=[...new Map(sessions.map(x=>[x.id,x])).values()].sort((a,b)=>a.name.localeCompare(b.name));
    const id=unique.some(x=>x.id===state.progressExercise)?state.progressExercise:unique[0]?.id,chosen=unique.find(x=>x.id===id),rows=sessions.filter(x=>x.id===id).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-12);if(id)state.progressExercise=id;
    function chart(field,unit){if(rows.length<2)return '<div class="empty">Log this exercise in two sessions to see a trend.</div>';const values=rows.map(r=>r[field]),lo=Math.min(...values),hi=Math.max(...values),span=hi-lo||1,point=(v,i)=>[25+i*270/(values.length-1),90-(v-lo)/span*65];return '<svg viewBox="0 0 320 118" role="img" aria-label="'+escapeAttr(chosen.name+' '+unit+' over sessions')+'"><path d="M25 95H295" stroke="#50494f"/><polyline class="chart-line" points="'+values.map((v,i)=>point(v,i).join(',')).join(' ')+'"/>'+values.map((v,i)=>'<circle class="chart-dot" cx="'+point(v,i)[0]+'" cy="'+point(v,i)[1]+'" r="4"/>').join('')+'<text class="chart-label" x="25" y="112">'+new Date(rows[0].date).toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</text><text class="chart-label" x="295" y="112" text-anchor="end">'+new Date(rows.at(-1).date).toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</text><text class="chart-label" x="2" y="24">'+hi.toFixed(1)+'</text><text class="chart-label" x="2" y="91">'+lo.toFixed(1)+'</text></svg>';}
    const today=new Date(),dayKey=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'),daily=new Map();for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);daily.set(dayKey(d),{date:d,kg:0});}
    const muscleKg={};for(const {k,v} of vals){const date=new Date(v.updatedAt||0),key=dayKey(date),week=Number(k.split('-')[0]),entries=[...Object.values(v.exercises||{}),...(v.variantHistory||[])];for(const entry of entries){const item=itemFor(entry),muscles=item?.primary||['Other'];for(const set of entry.sets||[]){if(!set?.done||Number(set.reps)<=0||set.weight===''||set.weight==null||!Number.isFinite(Number(set.weight))||Number(set.weight)<0)continue;const kg=Number(set.weight)*Number(set.reps);if(daily.has(key))daily.get(key).kg+=kg;if(week===state.week)for(const muscle of muscles)muscleKg[muscle]=(muscleKg[muscle]||0)+kg;}}}
    const days=[...daily.values()],maxDaily=Math.max(1,...days.map(x=>x.kg)),dailyChart=days.some(x=>x.kg>0)?'<svg viewBox="0 0 350 150" role="img" aria-label="Total kilograms lifted each day over the last seven days">'+days.map((x,i)=>{const h=x.kg?Math.max(2,x.kg/maxDaily*94):2,left=24+i*46;return '<rect x="'+left+'" y="'+(116-h)+'" width="27" height="'+h+'" rx="5" fill="#ee2d4d"/><text class="chart-label" x="'+(left+13.5)+'" y="132" text-anchor="middle">'+x.date.toLocaleDateString('en-US',{weekday:'short'})+'</text><text class="chart-label" x="'+(left+13.5)+'" y="'+Math.max(14,110-h)+'" text-anchor="middle">'+Math.round(x.kg)+'</text>';}).join('')+'</svg>':'<div class="empty">Complete weighted sets to see daily lifting volume.</div>';
    const maxKg=Math.max(1,...Object.values(muscleKg)),bars=Object.entries(muscleKg).sort((a,b)=>b[1]-a[1]).map(([m,n])=>'<div class="muscle-bar"><span>'+escapeHtml(m)+'</span><i><b style="width:'+n/maxKg*100+'%"></b></i><strong>'+Math.round(n).toLocaleString('en-US')+' kg</strong></div>').join('');
    const weekly=Array.from({length:6},(_,i)=>{const week=state.week-5+i;return {week,count:vals.filter(x=>Number(x.k.split('-')[0])===week&&x.v.completed&&hasDone(x.v)).length};}),maxSessions=Math.max(1,...weekly.map(x=>x.count));
    const trend=chosen?'<div class="chart-card"><h3>Exercise trend</h3><select class="select" id="chart-exercise">'+unique.map(x=>'<option value="'+escapeAttr(x.id)+'" '+(x.id===id?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join('')+'</select><div class="settings-note">Highest completed load · kg</div>'+chart('weight','kg')+'<div class="settings-note">Average completed '+(chosen.unit==='seconds'?'seconds':'reps')+'</div>'+chart('reps',chosen.unit)+'</div>':'<div class="chart-card"><h3>Exercise trend</h3><div class="empty">Complete sets to see exercise trends.</div></div>';
    $('#progress-charts').innerHTML=trend+'<div class="chart-card"><h3>Daily kg lifted · Last 7 days</h3>'+dailyChart+'</div><div class="chart-card"><h3>Total kg lifted by muscle · This week</h3>'+(bars||'<div class="empty">Complete weighted sets this week to see muscle-group volume.</div>')+'</div><div class="chart-card"><h3>Completed workouts per week</h3><svg viewBox="0 0 320 118" role="img" aria-label="Completed sessions over six weeks">'+weekly.map((x,i)=>'<rect x="'+(24+i*48)+'" y="'+(90-x.count/maxSessions*65)+'" width="26" height="'+Math.max(2,x.count/maxSessions*65)+'" rx="5" fill="#ee2d4d"/><text class="chart-label" x="'+(37+i*48)+'" y="110" text-anchor="middle">W'+x.week+'</text><text class="chart-label" x="'+(37+i*48)+'" y="'+(82-x.count/maxSessions*65)+'" text-anchor="middle">'+x.count+'</text>').join('')+'</svg></div>';
    if($('#chart-exercise'))$('#chart-exercise').onchange=e=>{state.progressExercise=e.target.value;saveState();renderCharts(vals);};
  }
  function updateArtCacheStatus(){const art=state.exerciseArtCache||{},total=art.total||ART_ASSET_COUNT;const el=$('#art-cache-status');if(!el)return;el.textContent=art.ready>=total?'All exercise images are ready offline.':art.ready?`Preparing offline images · ${art.ready} of ${total}`:'Exercise images prepare for offline use after the first online visit.';}
  function renderSettings(){
    $('#weekly-days').value=String(state.daysPerWeek);$('#experience-level').value=state.experience||'';
    const muscles=[...new Set(LIFT_CATALOGUE.exercises.flatMap(e=>e.primary))].sort();$('#priority-muscles').innerHTML=muscles.map(m=>`<label class="equipment-option"><input type="checkbox" value="${escapeAttr(m)}" ${state.priorityMuscles.includes(m)?'checked':''}><span>${escapeHtml(m)}</span></label>`).join('');
    $('#equipment-grid').innerHTML=Object.entries(LIFT_CATALOGUE.equipmentLabels).map(([key,label])=>`<label class="equipment-option"><input type="checkbox" value="${key}" ${state.equipment.includes(key)?'checked':''}><span>${label}</span></label>`).join('');
    $('#weight-steps').innerHTML=Object.entries(LIFT_CATALOGUE.equipmentLabels).map(([key,label])=>`<label class="equipment-option"><span>${label}</span><select class="select weight-step-select" data-equipment="${key}" aria-label="${label} weight increment">${[.5,1,2,2.5,5].map(v=>`<option value="${v}" ${Number(state.weightSteps?.[key]??1)===v?'selected':''}>${v}</option>`).join('')}</select> kg</label>`).join('');
    $('#plan-summary').textContent=days.length+' workouts · '+Math.min(...days.map(d=>d.minutes))+'–'+Math.max(...days.map(d=>d.minutes))+' min estimated';$('#catalogue-size').textContent=Object.keys(LIFT_REPDB_ART).length+' illustrated exercises · Offline guides';
    updateArtCacheStatus();
  }
  function updatePlanSettings(){
    const selected=$$('#equipment-grid input:checked').map(x=>x.value),priorities=$$('#priority-muscles input:checked').map(x=>x.value),count=$('#weekly-days').value,experience=$('#experience-level').value,weightSteps=Object.fromEntries($$('.weight-step-select').map(s=>[s.dataset.equipment,Number(s.value)]));
    if(!experience){showToast('Choose your experience level.');$('#experience-level').focus();return;}if(!selected.length){showToast('Choose at least one equipment type.');return;}if(priorities.length>2){showToast('Choose up to two priority muscle groups.');return;}
    const apply=()=>{state.daysPerWeek=count;state.experience=experience;state.priorityMuscles=priorities;state.equipment=selected;state.weightSteps=weightSteps;state.planRevision=(state.planRevision||0)+1;days=buildDays();saveState();renderSettings();updateHome();updateProgressScreen();showToast('Plan updated. Earlier entries stay in your history.');};
    const current=Object.entries(state.logs).some(([key,log])=>Number(key.split('-')[0])===state.week&&log.updatedAt);if(current)openConfirm('Update your plan?','Your current schedule will change. All earlier entries remain in Progress and backups.',apply,'Update plan');else apply();
  }
  function updateBackupStatus(){
    const text=state.lastBackupAt?'Last backup export: '+new Date(state.lastBackupAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'Last backup export: Never';
    const old=!state.lastBackupAt||(Date.now()-new Date(state.lastBackupAt).getTime()>7*86400000);
    ['#backup-status','#backup-status-settings'].forEach(s=>{const el=$(s);if(el){el.textContent=text+(old?' · Please back up this week':'');el.classList.toggle('backup-alert',old);}});
  }
  async function exportBackup(){
    const backup={app:'Lift Log',version:3,exportedAt:new Date().toISOString(),data:state};
    const name='lift-log-backup-'+new Date().toISOString().slice(0,10)+'.json';
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
    try{
      if(navigator.share&&window.File){const file=new File([blob],name,{type:'application/json'});if(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Lift Log backup'});state.lastBackupAt=new Date().toISOString();saveState();showToast('Backup shared. Save it to your Google Drive folder.');return;}}
    }catch(err){if(err?.name==='AbortError'){showToast('Backup export cancelled.');return;}}
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    state.lastBackupAt=new Date().toISOString();saveState();showToast('Backup file downloaded. Save it in Google Drive.');
  }
  function importBackup(file){
    if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const next=parsed.data||parsed;if(!next.logs||typeof next.logs!=='object'||Array.isArray(next.logs)||!Number.isInteger(next.week)||next.week<1)throw new Error('Invalid backup');openConfirm('Restore this backup?','Your current workout log will be replaced by the selected backup.',()=>{state=hydrate(next);delete state.storageRecovery;migrateIllustratedPlans();days=buildDays();saveState();renderSettings();updateHome();updateProgressScreen();showToast('Backup restored.');});}catch(e){showToast('That backup file could not be opened.');}};reader.readAsText(file);
  }
  function updateOnline(){const online=navigator.onLine;$('#online-dot').classList.toggle('offline',!online);$('#online-label').textContent=online?'Ready to save on this iPhone':'Offline · Your workout still saves on this iPhone';}
  function prepareExerciseArt(){if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http'))return;navigator.serviceWorker.addEventListener('message',event=>{const data=event.data;if(!data||!['EXERCISE_ART_PROGRESS','EXERCISE_ART_READY'].includes(data.type))return;const previous=state.exerciseArtCache?.ready||0;state.exerciseArtCache={ready:data.ready,total:data.total,failed:data.failed||0};saveState();updateArtCacheStatus();if(data.type==='EXERCISE_ART_READY'&&data.ready===data.total&&previous<data.total)showToast('All exercise images are ready offline.');});navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(reg=>{const worker=navigator.serviceWorker.controller||reg.active;if(!worker)return;worker.postMessage({type:'PREPARE_EXERCISE_ART',urls:[...new Set(Object.values(LIFT_REPDB_ART))].map(path=>'./'+path)});}).catch(()=>{});}
  function escapeHtml(str){return String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(str){return escapeHtml(str);}

  let catalogueMode='browse',catalogueLimit=60,scopeAction=null;
  function openScope(title,copy,kind,action){scopeAction=action;$('#scope-title').textContent=title;$('#scope-copy').textContent=kind==='remove'?copy+' Choose where to remove it.':copy+' Choose how long this change should apply.';$('#scope-modal').classList.remove('hidden');$('#scope-week').focus();}
  function persistentDay(){const id=state.weekPlans[snapshotKey()].programId;state.persistentEdits[id]||={};state.persistentEdits[id][activeDay.id]||={remove:[],add:[],replace:[],setCounts:[]};return state.persistentEdits[id][activeDay.id];}
  function markEdited(){activeDay.customized=true;updateDropSuggestion(activeDay);savePlan();renderWorkout();updateHome();}
  function replaceExercise(ei,item,scope){if(!LIFT_REPDB_ART[item?.id])return;const previous=activeDay.exercises[ei],log=currentLog(activeDay),old=log.exercises[previous.id];if(old){log.variantHistory||=[];log.variantHistory.push({...old,id:previous.id,updatedAt:log.updatedAt||new Date().toISOString()});delete log.exercises[previous.id];}const e=LIFT_ENGINE.descriptor(item,previous.id,state,{sets:previous.sets.length,baseline:true});e.alternativeSelected=true;e.estimatedWeight=e.estimated?e.sets[0].weight:null;activeDay.exercises[ei]=e;if(scope==='future'){const edit=persistentDay();edit.replace=edit.replace.filter(x=>x.id!==e.id);edit.replace.push({id:e.id,catalogId:e.catalogId,sets:e.sets.length});}if(state.exerciseNames?.[activeDay.id])delete state.exerciseNames[activeDay.id][previous.id];log.updatedAt=new Date().toISOString();markEdited();}
  function removeExercise(ei){const e=activeDay.exercises[ei];if(!e)return;openScope('Remove '+e.name+'?','Completed sets will stay in your history.','remove',scope=>{activeDay.exercises.splice(ei,1);if(scope==='future'){const edit=persistentDay();edit.remove=[...new Set([...edit.remove,e.id])];edit.add=edit.add.filter(x=>x.id!==e.id);}markEdited();});}
  function openCatalogue(mode='browse'){catalogueMode=mode;catalogueLimit=60;$('#catalogue-search').value='';$('#catalogue-muscle').value='';$('#catalogue-level').value='';$('#catalogue-equipment').value='';$('#catalogue-title').textContent=mode==='add'?'Add exercise':'Exercise catalogue';$('#catalogue-modal').classList.remove('hidden');renderCatalogue();$('#catalogue-search').focus();}
  function renderCatalogue(){const words=$('#catalogue-search').value.toLowerCase().trim().split(/\s+/).filter(Boolean),muscle=$('#catalogue-muscle').value,level=$('#catalogue-level').value,equipment=$('#catalogue-equipment').value;const entries=LIFT_CATALOGUE.exercises.filter(e=>LIFT_REPDB_ART[e.id]&&words.every(w=>(e.name+' '+e.primary.join(' ')+' '+e.secondary.join(' ')).toLowerCase().includes(w))&&(!muscle||e.primary.includes(muscle))&&(!level||e.level===level)&&(!equipment||e.equipment===equipment));entries.sort((a,b)=>{const rank=e=>Math.max(0,LIFT_CATALOGUE.levels.indexOf(e.level)-LIFT_CATALOGUE.levels.indexOf(state.experience||'beginner'));return rank(a)-rank(b)||a.name.localeCompare(b.name);});$('#catalogue-count').textContent=entries.length+' exercises found';$('#catalogue-list').innerHTML=entries.slice(0,catalogueLimit).map(e=>`<div class="catalogue-entry"><img class="exercise-thumb catalogue-thumb" src="${escapeAttr(LIFT_REPDB_ART[e.id])}" alt="" loading="lazy" decoding="async"><div><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(e.primary.join(', '))} · ${escapeHtml(LIFT_CATALOGUE.equipmentLabels[e.equipment])} · ${escapeHtml(e.level)}</small></div><button class="info-button" data-catalogue-guide="${e.id}" aria-label="Guide for ${escapeAttr(e.name)}">i</button>${catalogueMode==='add'?`<button class="btn btn-soft btn-small" data-add="${e.id}">Add</button>`:''}</div>`).join('')+(entries.length>catalogueLimit?'<button class="btn btn-outline" id="catalogue-more">Show more</button>':'')+(entries.length?'':'<div class="empty">No exercises match these filters.</div>');$$('#catalogue-list .catalogue-thumb').forEach((img,i)=>setExerciseArt(img,entries[i]?.id||''));$$('[data-catalogue-guide]').forEach(b=>b.onclick=()=>showGuide(LIFT_CATALOGUE.find(b.dataset.catalogueGuide)));$$('[data-add]').forEach(b=>b.onclick=()=>{const item=LIFT_CATALOGUE.find(b.dataset.add);if(!state.equipment.includes(item.equipment)){showToast('This exercise needs equipment not selected in Settings.');return;}if(activeDay.exercises.some(e=>e.catalogId===item.id)){showToast('This exercise is already in this day.');return;}const expWarning=LIFT_CATALOGUE.levels.indexOf(item.level)>LIFT_CATALOGUE.levels.indexOf(state.experience)?'This exercise requires more technical experience than your selected level. ':'';openScope('Add '+item.name+'?',item.level+' · 3 work sets. '+expWarning+suggestionText(item),'add',scope=>{const id='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),e=LIFT_ENGINE.descriptor(item,id,state,{baseline:true});e.addedByUser=true;activeDay.exercises.push(e);if(scope==='future')persistentDay().add.push({id,catalogId:item.id,sets:3});$('#catalogue-modal').classList.add('hidden');markEdited();});});if($('#catalogue-more'))$('#catalogue-more').onclick=()=>{catalogueLimit+=60;renderCatalogue();};}
  function initializeEditors(){
    const illustrated=LIFT_CATALOGUE.exercises.filter(e=>LIFT_REPDB_ART[e.id]);$('#catalogue-muscle').innerHTML='<option value="">All muscles</option>'+[...new Set(illustrated.flatMap(e=>e.primary))].sort().map(m=>'<option>'+escapeHtml(m)+'</option>').join('');$('#catalogue-equipment').innerHTML='<option value="">All equipment</option>'+[...new Set(illustrated.map(e=>e.equipment))].sort().map(k=>'<option value="'+escapeAttr(k)+'">'+LIFT_CATALOGUE.equipmentLabels[k]+'</option>').join('');
    $('#priority-muscles').addEventListener('change',e=>{if(e.target.matches('input[type="checkbox"]')&&e.target.checked&&$$('#priority-muscles input:checked').length>2){e.target.checked=false;showToast('Choose up to two priority muscle groups.');}});
    ['catalogue-search','catalogue-muscle','catalogue-level','catalogue-equipment'].forEach(id=>$('#'+id).addEventListener(id==='catalogue-search'?'input':'change',()=>{catalogueLimit=60;renderCatalogue();}));$('#catalogue-close').onclick=()=>$('#catalogue-modal').classList.add('hidden');$('#browse-catalogue').onclick=()=>openCatalogue();$('#add-exercise').onclick=()=>openCatalogue('add');$('#scope-cancel').onclick=()=>{$('#scope-modal').classList.add('hidden');scopeAction=null;};for(const [id,scope] of [['scope-week','week'],['scope-future','future']])$('#'+id).onclick=()=>{const action=scopeAction;scopeAction=null;$('#scope-modal').classList.add('hidden');action?.(scope);};$('#end-week').onclick=endWeek;
  }

  $$('.tab').forEach(tab=>tab.addEventListener('click',()=>{setScreen(tab.dataset.screen);if(tab.dataset.screen==='progress-screen')updateProgressScreen();}));
  $('#back-home').addEventListener('click',closeWorkout);
  $('#finish-button').addEventListener('click',()=>openConfirm('Finish this workout?','Your entries have been saved on this iPhone.',finishWorkout));
  $('#export-settings').addEventListener('click',exportBackup);
  $('#import-button').addEventListener('click',()=>$('#import-file').click());$('#import-file').addEventListener('change',e=>{importBackup(e.target.files[0]);e.target.value='';});
  $('#apply-plan').addEventListener('click',updatePlanSettings);
  $('#guide-close').addEventListener('click',()=>$('#guide-modal').classList.add('hidden'));
  $('#guide-modal').addEventListener('click',e=>{if(e.target.id==='guide-modal')$('#guide-modal').classList.add('hidden');});
  $('#alternative-close').addEventListener('click',()=>$('#alternative-modal').classList.add('hidden'));
  $('#alternative-modal').addEventListener('click',e=>{if(e.target.id==='alternative-modal')$('#alternative-modal').classList.add('hidden');});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')$('#guide-modal').classList.add('hidden');});
  window.addEventListener('online',updateOnline);window.addEventListener('offline',updateOnline);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&restTimer){if(Date.now()>=restTimer.endAt){clearInterval(restTimer.interval);restTimer=null;restComplete=true;playRestChime();updateRestDock();showToast('Rest complete.');}else updateRestDock();}});
  $('#rest-toggle').addEventListener('click',toggleGlobalRest);$('#rest-dock').querySelectorAll('.rest-step').forEach(b=>b.addEventListener('click',()=>adjustRestDuration(b)));
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',prepareExerciseArt);
  initializeEditors();renderSettings();updateHome();updateProgressScreen();saveState();
})();
