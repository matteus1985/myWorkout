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
  const valentinDays = [
    {id:'v1',name:'Day 1 · Chest + Legs',warmup:'Warm-up: Incline DB Press 2 sets; Back Squat 2 sets; Leg Extension 1 set; Standing Calf Raise 1 set. Cardio: incline walk 15 min at 3.2 mph / 6%.',exercises:[
      ex('v-incline-db','Incline Dumbbell Press','Chest',[[30,8,10],[30,8,10],[30,8,10]],'dumbbell',150,'Excel note: P = 34, V = 30; using the listed 30 kg target.'),ex('v-squat','Back Squat','Quadriceps · Glutes',[[75,5,5],[75,5,5],[75,5,5]],'barbell',180),ex('v-low-high','Low-to-High Cable Flye','Chest',[[13.75,15,15],[13.75,15,15],[13.75,15,15]],'cable',90),ex('v-leg-extension','Leg Extension','Quadriceps',[[51.8,15,15],[51.8,15,15],[51.8,15,15]],'machine',90),ex('v-calf','Standing Calf Raise','Calves',[[85.5,10,10],[85.5,10,10],[85.5,10,10]],'machine',90,'Excel note: (+2.3); using listed 85.5 kg.') ]},
    {id:'v2',name:'Day 2 · Back + Delts',warmup:'Warm-up: Weighted Pull-Up 2 sets; Wide Pronated Pulldown 1 set. Cardio: steps target 10,000.',exercises:[
      ex('v-pullup','Weighted Pull-Up','Back · Biceps',[[21.25,6,8],[21.25,6,8],[21.25,6,8]],'bodyweight',150,'Added weight; note says 6 reps at 21.25 kg.'),ex('v-db-lateral','Dumbbell Lateral Raise','Side delts',[[16,15,20],[16,15,20],[16,15,20],[16,15,20]],'dumbbell',60),ex('v-pulldown','Wide-Grip Pronated Lat Pulldown','Back · Lats',[[68,10,12],[68,10,12],[68,10,12]],'machine',120,'Excel note “+1 (10x)” retained as note; target stays 68 kg.'),ex('v-pullover','Straight-Arm Pullover','Back · Lats',[[28.7,12,15],[28.7,12,15],[28.7,12,15]],'cable',90),ex('v-facepull','Rope Face Pull','Rear delts',[[27,20,20],[27,20,20],[27,20,20]],'cable',60,'Excel note (+0.6) retained as note.') ]},
    {id:'v3',name:'Day 3 · Posterior Chain + Abs',warmup:'Warm-up: Reset Deadlift 2 sets; Barbell RDL 1 set; Lying Leg Curl 1 set; Cable Crunch 1 set. Cardio: incline walk 15 min at 3.2 mph / 6%.',exercises:[
      ex('v-deadlift','Reset Deadlift','Back · Hamstrings',[[105,5,5],[105,5,5],[105,5,5]],'barbell',240),ex('v-rdl','Barbell Romanian Deadlift','Hamstrings · Glutes',[[60,10,12],[60,10,12],[60,10,12]],'barbell',150),ex('v-legcurl','Lying Leg Curl','Hamstrings',[[59,10,10],[59,10,10],[59,10,10]],'machine',90),ex('v-crunch','Weighted Cable Crunch','Abs',[[0,12,15],[0,12,15],[0,12,15]],'cable',90,'No load listed in Excel; adjust from your logged performance.'),ex('v-raise','Hanging Leg Raise','Abs',[[0,12,12],[0,12,12],[0,12,12]],'bodyweight',90) ]},
    {id:'v4',name:'Day 4 · Chest + Delts',warmup:'Warm-up: Incline Barbell Bench 2 sets; Arnold Press 1 set. Cardio: incline walk 15 min at 3.2 mph / 6%.',exercises:[
      ex('v-incline-bb','Incline Barbell Bench Press','Chest',[[70,6,8],[70,6,8],[70,6,8]],'barbell',150),ex('v-db-lateral-d4','Dumbbell Lateral Raise','Side delts',[[14,15,20],[14,15,20],[14,15,20],[14,15,20]],'dumbbell',60),ex('v-upright','Cable Rope Upright Row','Shoulders',[[28.75,10,12],[28.75,10,12],[28.75,10,12]],'cable',90,'Excel note (+0.6) retained as note.'),ex('v-facepull-d4','Rope Face Pull','Rear delts',[[28.75,20,20],[28.75,20,20],[28.75,20,20]],'cable',60,'Excel note (+0.6) retained as note.'),ex('v-arnold','Dumbbell Arnold Press','Shoulders',[[18,10,10],[18,10,10],[18,10,10]],'dumbbell',120) ]},
    {id:'v5',name:'Day 5 · Back + Arms',warmup:'Warm-up: Chest-Supported Row 1 set; Lying Leg Curl 1 set; EZ Bar Skull Crusher 1 set. Cardio: steps target 10,000.',exercises:[
      ex('v-row','Chest-Supported Row','Back',[[103.5,12,15],[103.5,12,15],[103.5,12,15]],'machine',120,'Excel note: 103.5 x 8.'),ex('v-humble','Humble Row','Back',[[24,10,12],[24,10,12],[24,10,12]],'dumbbell',120,'Load follows the listed 24; note says 24 x 12.'),ex('v-skull','EZ Bar Skull Crusher','Triceps',[[32.5,15,15],[32.5,15,15],[32.5,15,15]],'barbell',90,'Excel note “10 kg + 25 kg” conflicts with Kg column; using 32.5 kg listed.'),ex('v-hammer','Hammer Curl','Biceps',[[20,8,10],[20,8,10],[20,8,10]],'dumbbell',90,'Excel note: 20 x 12.'),ex('v-pushdown','Tricep Pressdown','Triceps',[[28.75,15,15],[28.75,15,15],[28.75,15,15]],'cable',90,'Excel note: 16 reps at 28.75 kg.'),ex('v-ez-curl','Supinated EZ Bar Curl','Biceps',[[32,15,15],[32,15,15],[32,15,15]],'barbell',90,'Excel note says 40 kg; using 32 kg listed in Kg column.') ]}
  ];
  const valentinRpe={'v-incline-db':9,'v-squat':8,'v-low-high':9,'v-leg-extension':8,'v-calf':9,'v-pullup':9,'v-db-lateral':9,'v-pulldown':8,'v-pullover':8,'v-facepull':8,'v-deadlift':8,'v-rdl':8,'v-legcurl':8,'v-crunch':9,'v-raise':9,'v-incline-bb':8.5,'v-db-lateral-d4':10,'v-upright':8,'v-facepull-d4':8,'v-arnold':8,'v-row':8,'v-humble':9,'v-skull':8,'v-hammer':9,'v-pushdown':9,'v-ez-curl':10};
  valentinDays.forEach(d=>d.exercises.forEach(e=>{e.rpe=valentinRpe[e.id];e.sets.forEach(s=>s.rpe=e.rpe);e.note='RPE '+e.rpe+(e.note?' · '+e.note:'');}));
  function ex(id,name,muscle,sets,equipment,rest,note=''){return {id,name,muscle,sets:sets.map(([weight,min,max])=>({weight,min,max})),equipment,rest,note};}
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const fresh = () => ({schemaVersion:3,week:20,valentinWeek:1,logs:{},exerciseNames:{},lastBackupAt:null,daysPerWeek:5,experience:null,priorityMuscles:[],weightSteps:{barbell:2.5,dumbbell:2,machine:2.5,smith:2.5,cable:1,bodyweight:1,band:.5},equipment:['barbell','dumbbell','machine','smith','cable','bodyweight','band'],planRevision:0,weekPlans:{},persistentEdits:{},endedWeeks:{},exerciseArtCache:{ready:0,total:0}});
  let state = loadState();
  let days = buildDays();
  let activeDay = null;
  let toastTimer = null;
  let restTimer = null;
  let audioContext = null;
  function hydrate(parsed){const next={...fresh(),...parsed};next.weekPlans||={};next.persistentEdits||={};next.endedWeeks||={};next.priorityMuscles=[...new Set((next.priorityMuscles||[]).filter(m=>LIFT_CATALOGUE.exercises.some(e=>e.primary.includes(m))))].slice(0,2);next.exerciseArtCache||={ready:0,total:LIFT_CATALOGUE.exercises.length};next.experience=next.experience||null;next.needsMigration=parsed.schemaVersion!==3;next.schemaVersion=3;delete next.workoutDuration;if(next.needsMigration&&next.equipment.includes('machine')&&!next.equipment.includes('smith'))next.equipment.push('smith');return next;}
  function loadState(){try{const raw=localStorage.getItem(KEY);if(!raw)return fresh();const parsed=JSON.parse(raw);if(!parsed||typeof parsed.logs!=='object'||!Number.isInteger(parsed.week))throw Error('Invalid state');return hydrate(parsed);}catch(err){return {...fresh(),storageRecovery:true};}}
  function saveState(){if(state.storageRecovery){showToast('Saved data could not be read. Import a backup in Settings.');return;}try{localStorage.setItem(KEY,JSON.stringify(state));updateBackupStatus();}catch(e){showToast('Could not save. Export a backup and free up space.');}}
  function showToast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
  function keyFor(dayId,week=state.week){return String(week)+(state.planRevision?'-v'+state.planRevision:'')+'-'+dayId;}
  function logFor(week,dayId){return state.logs[keyFor(dayId,week)]||null;}
  function itemFor(e){return LIFT_CATALOGUE.find(e.catalogId)||LIFT_CATALOGUE.find(e.name);}
  function guideFor(e){const item=itemFor(e);if(!item)return {setup:'Set up securely.',move:'Use a controlled movement.',avoid:'Avoid momentum.',options:[]};return {setup:item.guide.setup,move:item.guide.movement,avoid:item.guide.avoid,options:[[item.name,item.equipment],...LIFT_CATALOGUE.alternatives(e,state.experience).map(x=>[x.name,x.equipment])]};}
  function equipmentFor(name){return LIFT_CATALOGUE.find(name)?.equipment||null;}
  function availableAlternatives(e){return LIFT_CATALOGUE.alternatives(e,state.experience).filter(x=>state.equipment.includes(x.equipment));}
  function estimateMinutes(exercises){return LIFT_ENGINE.minutes(exercises);}
  function updateDropSuggestion(day){day.minutes=estimateMinutes(day.exercises);day.optionalDropSet=state.daysPerWeek!=='valentin'&&day.minutes<65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!['inclinePress','chestPress','row','verticalPull','squat','lunge','hinge','deadlift','hipThrust','overheadPress','dip'].includes(e.pattern)&&e.unit!=='seconds'):-1;}
  function snapshotKey(){return state.week+':'+(state.planRevision||0);}
  function savePlan(){const snapshot=state.weekPlans[snapshotKey()];if(snapshot)snapshot.days=LIFT_ENGINE.clone(days);saveState();}
  function buildDays(){
    state.weekPlans||={};const key=snapshotKey();if(state.weekPlans[key]){const saved=LIFT_ENGINE.clone(state.weekPlans[key].days);saved.forEach(updateDropSuggestion);return saved;}
    let plan=LIFT_ENGINE.generate(state,sourceDays,valentinDays);
    if(state.needsMigration){
      const logs=Object.entries(state.logs).filter(([k,v])=>Number(k.split('-')[0])===state.week&&k.startsWith(String(state.week)+(state.planRevision?'-v'+state.planRevision:'')+'-')&&v.updatedAt);
      if(logs.length){
        const source=state.daysPerWeek==='valentin'?valentinDays:sourceDays.slice(0,Number(state.daysPerWeek)||5),all=[...sourceDays,...valentinDays].flatMap(d=>d.exercises);
        plan.days=source.map((d,i)=>{const id=state.daysPerWeek==='valentin'?d.id:'d'+(i+1),log=logs.find(([k])=>k.endsWith('-'+id))?.[1];let exercises=LIFT_ENGINE.clone(d.exercises);
          if(log){for(const [slot,entry] of Object.entries(log.exercises||{})){let e=exercises.find(x=>x.id===slot);if(!e){const original=all.find(x=>x.id===slot);if(original){e=LIFT_ENGINE.clone(original);exercises.push(e);}}if(e){e.name=entry.name||e.name;const item=LIFT_CATALOGUE.find(e.name);e.catalogId=item?.id;e.equipment=item?.equipment||e.equipment;while(e.sets.length<(entry.sets||[]).length)e.sets.push({...e.sets.at(-1)});}}}
          exercises.forEach(e=>{const name=state.exerciseNames?.[id]?.[e.id];if(name)e.name=name;const item=itemFor(e);e.catalogId=item?.id;e.pattern=item?.pattern;e.level=item?.level;e.unit=item?.unit||'reps';e.sets.forEach(s=>s.target=s.min);});
          return {id,name:log?.dayName||d.name.replace(/^Day \d+ · /,''),warmup:d.warmup||'Warm-up: comfortable movement and progressively heavier preparation sets.',exercises,minutes:estimateMinutes(exercises)};});plan.legacy=true;
      }state.needsMigration=false;
    }
    state.weekPlans[key]=plan;return LIFT_ENGINE.clone(plan.days);
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
    $('#week-pill').textContent='WEEK '+state.week;$('#valentin-cardio').classList.toggle('hidden',state.daysPerWeek!=='valentin');$('#plan-count').textContent=state.daysPerWeek==='valentin'?'Valentin · Cycle '+state.valentinWeek:days.length+' days · '+(state.experience||'Choose level');
    const next=days.find(d=>!(logFor(state.week,d.id)?.completed&&hasDone(logFor(state.week,d.id))))||days[0];
    if(next){$('#next-title').textContent='Day '+(days.indexOf(next)+1)+' · '+next.name;$('#next-subtitle').textContent=next.exercises.length+' exercises · about '+next.minutes+' minutes';$('#start-next').onclick=()=>openWorkout(next.id);}
    $('#start-next').disabled=!state.experience||!next?.exercises.length;$('#setup-level').classList.toggle('hidden',!!state.experience);$('#choose-level').onclick=()=>setScreen('settings-screen');
    const logs=Object.entries(state.logs).filter(([k])=>Number(k.split('-')[0])===state.week).map(([,v])=>v);$('#week-sessions').textContent=logs.filter(l=>l.completed&&hasDone(l)).length;$('#week-exercises').textContent=logs.reduce((n,l)=>n+[...Object.values(l.exercises||{}),...(l.variantHistory||[])].reduce((m,e)=>m+(e.sets||[]).filter(s=>s?.done).length,0),0);
    $('#progress-week-label').textContent='Week '+state.week;renderDays();renderVolume();updateBackupStatus();updateOnline();
  }
  function renderVolume(){const totals=LIFT_ENGINE.volume(days),missing=state.weekPlans[snapshotKey()]?.missingPatterns||[],changes=days.some(d=>d.customized);let text='';if(missing.length)text='Your equipment cannot cover every movement. Browse alternatives or update your equipment in Settings.';else if(changes){const low=['Chest','Back','Quadriceps','Hamstrings'].filter(m=>(totals[m]?.sets||0)<9||(totals[m]?.frequency||0)<2);const high=Object.entries(totals).filter(([,v])=>v.sets>18).map(([m])=>m);if(low.length)text='Less weekly coverage: '+low.join(', ')+'.';if(high.length)text+=' Higher weekly volume: '+high.join(', ')+'.';}$('#volume-warning').textContent=text;$('#volume-warning').classList.toggle('hidden',!text);$('#week-volume').innerHTML=Object.entries(totals).map(([m,v])=>'<div>'+escapeHtml(m)+' · '+v.sets+' sets / '+v.frequency+' days</div>').join('');}
  function endWeek(){
    const ending=state.week,nextState={...state,week:ending+1,valentinWeek:state.daysPerWeek==='valentin'?((state.valentinWeek||1)%4)+1:state.valentinWeek},next=LIFT_ENGINE.generate(nextState,sourceDays,valentinDays),missing=days.filter(d=>!(logFor(ending,d.id)?.completed&&hasDone(logFor(ending,d.id))));
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
      if(state.week!==ending||state.endedWeeks[ending])return;state.endedWeeks[ending]={at:new Date().toISOString(),planKey:snapshotKey(),missing:missing.map(d=>d.id)};state.week=ending+1;state.valentinWeek=nextState.valentinWeek;state.weekPlans[snapshotKey()]=next;days=LIFT_ENGINE.clone(next.days);activeDay=null;stopRestTimer();saveState();updateHome();updateProgressScreen();renderSettings();setScreen('home-screen');showToast('Week '+state.week+' is ready.');
    },'End week');
  }
  function setScreen(id){
    $$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
    $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.screen===id));
    $('#tabbar').classList.toggle('hidden',id==='workout-screen');
    $('#session-foot').classList.toggle('hidden',id!=='workout-screen');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function openWorkout(dayId){
    if(!state.experience){showToast('Choose your experience level in Settings first.');return;}
    activeDay=days.find(d=>d.id===dayId);if(!activeDay)return;
    const names=state.exerciseNames?.[dayId]||{};
    activeDay.exercises.forEach(e=>{const name=names[e.id],equipment=equipmentFor(name,guideFor(e));if(name&&equipment&&state.equipment.includes(equipment)&&name!==e.name){e.name=name;e.equipment=equipment;e.note='';e.alternativeSelected=true;e.estimatedWeight=comparableLoad(e);e.sets.forEach(s=>s.weight=null);}});
    currentLog(activeDay);
    $('#workout-day-label').textContent='DAY '+(days.indexOf(activeDay)+1)+' · WEEK '+(state.daysPerWeek==='valentin'?state.valentinWeek:state.week);
    $('#workout-title').textContent=activeDay.name;
    let dayNote=activeDay.warmup||'';if(state.daysPerWeek==='valentin'&&state.valentinWeek===2&&activeDay.id==='v2')dayNote+=' Week 2 note: take one lateral raise set to technical failure.';if(state.daysPerWeek==='valentin'&&state.valentinWeek===2&&activeDay.id==='v5')dayNote+=' Week 2 note: take one biceps curl set to technical failure.';if(state.daysPerWeek==='valentin'&&state.valentinWeek===4)dayNote+=' Week 4 active recovery: use 20% less weight and focus on smooth control.';$('#warmup-text').textContent=dayNote;$('#warmup-text').style.display=dayNote?'block':'none';
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
      const variants=guideFor(e).options.filter(([name])=>name!==e.name);
      const prior=latestExerciseLog(e);let estimateNote='';if(e.estimated)estimateNote='Estimated from '+escapeHtml(e.estimateSource||'a comparable exercise')+'; calibrate conservatively.';else if(prior)estimateNote='Targets based on your logged '+escapeHtml(e.name)+' sets.';else if(e.sets[0]?.weight===0&&e.unit!=='seconds'&&state.daysPerWeek!=='valentin')estimateNote='No comparable load in your history yet; start at 0 kg and calibrate.';
      const illustration=itemFor(e);
      const dropEnabled=activeDay.optionalDropSet===ei,drop=data.dropSet||{},step=Number(state.weightSteps?.[e.equipment]||1),dropWeight=Math.max(0,Math.floor(Number(planned.at(-1)?.weight||0)*.8/step)*step),dropRow=drop.enabled?`<div class="set-row drop-set-row"><span class="set-index">D</span><div class="stepper"><input class="field weight-input" type="number" inputmode="decimal" min="0" step="${step}" aria-label="Drop set weight in kilograms" value="${escapeAttr(drop.weight??dropWeight)}" data-e="${ei}" data-field="weight" data-drop="true"></div><div class="stepper"><input class="field reps-input" type="number" inputmode="numeric" min="1" step="1" aria-label="Drop set reps" value="${escapeAttr(drop.reps??e.sets.at(-1).target??e.sets.at(-1).max)}" data-e="${ei}" data-field="reps" data-drop="true"></div><button class="check ${drop.done?'done':''}" data-drop-check="${ei}" aria-label="${drop.done?'Mark drop set incomplete':'Complete drop set'}">✓</button></div>`:'';
      return `<article class="exercise"><div class="exercise-top"><img class="exercise-thumb workout-thumb" src="media/exercises/${escapeAttr(illustration?.id||'')}.svg" alt="" loading="lazy" decoding="async"><div class="exercise-title"><h3>${escapeHtml(e.name)}</h3><div class="muscle">${escapeHtml(e.muscle)} · ${escapeHtml(itemFor(e)?.level||'')}</div></div><button class="info-button" data-guide="${ei}" aria-label="How to do ${escapeAttr(e.name)}">i</button><span class="target">${e.sets.length} × ${e.sets[0].min===e.sets[0].max?e.sets[0].min:e.sets[0].min+'–'+e.sets[0].max}</span></div>${estimateNote?`<div class="settings-note">${estimateNote}</div>`:''}${e.note?`<p class="exercise-note">${escapeHtml(e.note)}</p>`:''}<div class="set-head"><span>Set</span><span>Weight · kg</span><span>${e.unit==='seconds'?'Seconds':'Reps'}</span><span></span></div>${setRows}${dropRow}${dropEnabled?`<button class="text-button drop-toggle" data-drop-toggle="${ei}">${drop.enabled?'− Remove optional drop set':'＋ Optional drop set · about 20% lighter'}</button>${drop.enabled?'<div class="settings-note drop-hint">After your final set, use controlled reps and stop with about 0–1 reps left.</div>':''}`:''}<div class="exercise-actions"><button class="text-button alternatives-button" data-alt-open="${ei}">Alternatives · ${variants.length}</button><div class="rest-controls"><span class="timer" id="timer-${ei}">${formatTime(e.rest)}</span><input class="rest-duration" type="number" inputmode="numeric" min="1" max="5999" step="5" value="${e.rest}" aria-label="Rest duration in seconds"><button class="btn btn-soft btn-small rest-button" data-rest="${ei}">Start rest</button></div></div><div class="effort-row"><label>Reps left <span class="muted">(optional)</span></label><div class="effort-choices" role="group" aria-label="Reps left"><button type="button" class="effort-choice ${data.effort===0?'selected':''}" data-effort="${ei}" data-value="0" aria-pressed="${data.effort===0}">0–1</button><button type="button" class="effort-choice ${data.effort===2?'selected':''}" data-effort="${ei}" data-value="2" aria-pressed="${data.effort===2}">2–3</button><button type="button" class="effort-choice ${data.effort===4?'selected':''}" data-effort="${ei}" data-value="4" aria-pressed="${data.effort===4}">4+</button></div></div><div class="edit-actions"><button class="text-button" data-editsets="${ei}">${e.sets.length} sets · Edit</button><button class="text-button" data-remove="${ei}">Remove exercise</button></div></article>`;
    }).join('');
    $$('#exercise-list .exercise').forEach(card=>{const rows=card.querySelectorAll('.set-row:not(.drop-set-row)'),effort=card.querySelector('.effort-row');if(rows.length&&effort)rows[rows.length-1].after(effort);});
    $$('#exercise-list .weight-input,#exercise-list .reps-input').forEach(input=>input.addEventListener('input',onSetInput));
    $$('#exercise-list .check[data-check]').forEach(b=>b.addEventListener('click',()=>toggleSet(b)));
    $$('#exercise-list [data-drop-check]').forEach(b=>b.addEventListener('click',()=>toggleDropSet(b)));
    $$('#exercise-list [data-drop-toggle]').forEach(b=>b.addEventListener('click',()=>toggleDropRow(+b.dataset.dropToggle)));
    $$('#exercise-list .step-button').forEach(b=>b.addEventListener('click',()=>stepInput(b)));
    $$('#exercise-list [data-alt-open]').forEach(b=>b.addEventListener('click',()=>openAlternativePicker(+b.dataset.altOpen)));
    $$('#exercise-list .rest-button').forEach(b=>b.addEventListener('click',()=>startRest(+b.dataset.rest,b)));
    $$('#exercise-list .effort-choice').forEach(b=>b.addEventListener('click',()=>recordEffort(b)));
    $$('#exercise-list .info-button').forEach(b=>b.addEventListener('click',()=>openGuide(+b.dataset.guide)));
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
    if(s.done) startRest(ei,$(`[data-rest="${ei}"]`));
  }
  function toggleDropRow(ei){const e=activeDay.exercises[ei],log=currentLog(activeDay);log.exercises[e.id]||={name:e.name,catalogId:e.catalogId,sets:[]};const drop=log.exercises[e.id].dropSet||(log.exercises[e.id].dropSet={enabled:false,done:false});drop.enabled=!drop.enabled;log.updatedAt=new Date().toISOString();saveState();renderWorkout();}
  function toggleDropSet(btn){const ei=Number(btn.dataset.dropCheck),e=activeDay.exercises[ei],log=currentLog(activeDay),row=btn.closest('.set-row'),weight=row.querySelector('.weight-input'),reps=row.querySelector('.reps-input');if(!log.exercises[e.id])log.exercises[e.id]={name:e.name,catalogId:e.catalogId,sets:[]};const drop=log.exercises[e.id].dropSet||(log.exercises[e.id].dropSet={enabled:true,done:false});if(!drop.done&&(weight.value===''||!Number.isFinite(Number(weight.value))||Number(weight.value)<0||!Number.isFinite(Number(reps.value))||Number(reps.value)<=0)){showToast('Enter the drop set load and reps first.');reps.focus();return;}drop.weight=Number(weight.value);drop.reps=Number(reps.value);drop.done=!drop.done;log.updatedAt=new Date().toISOString();saveState();btn.classList.toggle('done',drop.done);btn.setAttribute('aria-label',drop.done?'Mark drop set incomplete':'Complete drop set');}
  function suggestionText(item){const planned=LIFT_ENGINE.descriptor(item,'preview',state,{baseline:true}),prior=LIFT_ENGINE.histories(state,item)[0],sets=planned.sets,load=sets.map(s=>s.weight).every(v=>v===sets[0].weight)?sets[0].weight+' kg':sets.map(s=>s.weight+' kg').join(' / '),reps=sets[0].min===sets[0].max?sets[0].min:sets[0].min+'–'+sets[0].max;const source=prior?'Based on your logged exercise history.':planned.estimated?'Estimated from '+planned.estimateSource+'. Calibrate conservatively.':'No comparable history; 0 kg starting value to calibrate.';return `Suggested load: ${load} · ${reps} reps per set. ${source}`;}
  function openAlternativePicker(ei){const exercise=activeDay?.exercises[ei];if(!exercise)return;const options=guideFor(exercise).options.filter(([name])=>name!==exercise.name).map(([name])=>LIFT_CATALOGUE.find(name)).filter(Boolean);$('#alternative-title').textContent='Alternatives for '+exercise.name;$('#alternative-list').innerHTML=options.map(item=>{const usable=state.equipment.includes(item.equipment),target=LIFT_ENGINE.descriptor(item,'preview',state,{baseline:true}),load=target.sets.map(s=>s.weight+' kg').filter((v,i,a)=>i===0||v!==a[i-1]).join(' / '),reps=target.sets[0].min+'–'+target.sets[0].max,source=target.estimated?'Estimated':LIFT_ENGINE.histories(state,item).length?'From your history':'Calibrate';return `<label class="alternative-option ${usable?'':'unavailable'}"><img src="media/exercises/${escapeAttr(item.id)}.svg" alt="" loading="lazy" decoding="async"><span class="alternative-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(LIFT_CATALOGUE.equipmentLabels[item.equipment])} · ${escapeHtml(item.level)}${usable?'':' · not selected in Settings'}</small><span class="alternative-target">${escapeHtml(load)} · ${escapeHtml(reps)} reps <em>${source}</em></span></span><input type="radio" name="alternative-choice" data-alt-choice="${escapeAttr(item.id)}" data-alt-for="${ei}" aria-label="Select ${escapeAttr(item.name)}" ${usable?'':'disabled'}></label>`;}).join('')||'<div class="empty">No alternatives are listed for this exercise yet.</div>';$('#alternative-modal').classList.remove('hidden');$('#alternative-close').focus();$$('[data-alt-choice]').forEach(radio=>radio.addEventListener('change',()=>{const target=LIFT_CATALOGUE.find(radio.dataset.altChoice),index=Number(radio.dataset.altFor);$('#alternative-modal').classList.add('hidden');openScope('Replace exercise?',target.name+'. '+suggestionText(target),'replace',scope=>replaceExercise(index,target,scope));}));}
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
  function startRest(ei,button){
    const e=activeDay.exercises[ei],card=button.closest('.exercise'),input=card.querySelector('.rest-duration');
    if(restTimer?.button===button){clearInterval(restTimer.interval);restTimer=null;$('#timer-'+ei).textContent=formatTime(Number(input.value)||e.rest);button.textContent='Start rest';button.classList.remove('running');return;}
    stopRestTimer();
    armRestAudio();
    const seconds=Math.max(1,Math.min(5999,Number(input.value)||e.rest));input.value=seconds;
    restTimer={endAt:Date.now()+seconds*1000,ei,button,interval:null};
    button.textContent='Cancel';button.classList.add('running');
    const tick=()=>{const remaining=Math.max(0,Math.ceil((restTimer.endAt-Date.now())/1000));$('#timer-'+ei).textContent=formatTime(remaining);if(!remaining){clearInterval(restTimer.interval);restTimer=null;button.textContent='Start rest';button.classList.remove('running');$('#timer-'+ei).textContent='Ready';playRestChime();showToast('Rest finished.');}};
    tick();if(restTimer)restTimer.interval=setInterval(tick,250);
  }
  function stopRestTimer(){if(restTimer){clearInterval(restTimer.interval);restTimer.button.textContent='Start rest';restTimer.button.classList.remove('running');restTimer=null;}}
  function armRestAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();if(audioContext.state==='suspended')audioContext.resume();}catch(e){}}
  function playRestChime(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();if(audioContext.state==='suspended')audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=880;gain.gain.setValueAtTime(0.0001,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(0.18,audioContext.currentTime+0.02);gain.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime+0.32);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.34);}catch(e){}}
  function formatTime(sec){return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
  function updateProgressScreen(){
    const vals=Object.entries(state.logs).map(([k,v])=>({k,v}));const completed=vals.filter(x=>x.v.completed&&hasDone(x.v)).length;const countSets=entry=>(entry?.sets||[]).filter(s=>s?.done).length;const allSets=vals.reduce((n,x)=>n+Object.values(x.v.exercises||{}).reduce((m,e)=>m+countSets(e),0)+(x.v.variantHistory||[]).reduce((m,e)=>m+countSets(e),0),0);
    $('#all-sessions').textContent=completed;$('#all-sets').textContent=allSets;
    const current=vals.filter(x=>Number(x.k.split('-')[0])===state.week&&x.v.updatedAt).sort((a,b)=>new Date(b.v.updatedAt)-new Date(a.v.updatedAt));
    $('#week-history').innerHTML=current.length?current.map(x=>`<div class="history-item"><strong>${escapeHtml(x.v.dayName||x.k)}</strong><span>${x.v.completed?'Completed':'In progress'} · ${new Date(x.v.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div>`).join(''):'<div class="empty">Your completed workouts will show here. Start with Day 1 when you’re ready.</div>';
    renderCharts(vals);

  }
  function renderCharts(vals){
    const sessions=[];for(const {k,v} of vals){for(const entry of [...Object.values(v.exercises||{}),...(v.variantHistory||[])]){const item=itemFor(entry),sets=(entry.sets||[]).filter(s=>s?.done&&Number(s.reps)>0&&s.weight!==''&&s.weight!=null&&Number.isFinite(Number(s.weight))&&Number(s.weight)>=0);if(!sets.length)continue;sessions.push({id:item?.id||entry.name,name:item?.name||entry.name,date:entry.updatedAt||v.updatedAt,weight:Math.max(...sets.map(s=>Number(s.weight))),reps:sets.reduce((n,s)=>n+Number(s.reps),0)/sets.length,sets,primary:item?.primary||['Other'],week:Number(k.split('-')[0]),unit:item?.unit||'reps'});}}
    const unique=[...new Map(sessions.map(x=>[x.id,x])).values()].sort((a,b)=>a.name.localeCompare(b.name));if(!unique.length){$('#progress-charts').innerHTML='<div class="empty">Complete sets to see your training charts.</div>';return;}
    const id=unique.some(x=>x.id===state.progressExercise)?state.progressExercise:unique[0].id,chosen=unique.find(x=>x.id===id),rows=sessions.filter(x=>x.id===id).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-12);state.progressExercise=id;
    function chart(field,unit){if(rows.length<2)return '<div class="empty">Log this exercise in two sessions to see a trend.</div>';const values=rows.map(r=>r[field]),lo=Math.min(...values),hi=Math.max(...values),span=hi-lo||1,point=(v,i)=>[25+i*270/(values.length-1),90-(v-lo)/span*65];return '<svg viewBox="0 0 320 118" role="img" aria-label="'+escapeAttr(chosen.name+' '+unit+' over sessions')+'"><path d="M25 95H295" stroke="#50494f"/><polyline class="chart-line" points="'+values.map((v,i)=>point(v,i).join(',')).join(' ')+'"/>'+values.map((v,i)=>'<circle class="chart-dot" cx="'+point(v,i)[0]+'" cy="'+point(v,i)[1]+'" r="4"/>').join('')+'<text class="chart-label" x="25" y="112">'+new Date(rows[0].date).toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</text><text class="chart-label" x="295" y="112" text-anchor="end">'+new Date(rows.at(-1).date).toLocaleDateString('en-US',{month:'short',day:'numeric'})+'</text><text class="chart-label" x="2" y="24">'+hi.toFixed(1)+'</text><text class="chart-label" x="2" y="91">'+lo.toFixed(1)+'</text></svg>';}
    const totals={};sessions.filter(x=>x.week===state.week).forEach(x=>x.primary.forEach(m=>totals[m]=(totals[m]||0)+x.sets.length));const max=Math.max(1,...Object.values(totals)),bars=Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([m,n])=>'<div class="muscle-bar"><span>'+escapeHtml(m)+'</span><i><b style="width:'+n/max*100+'%"></b></i><strong>'+n+'</strong></div>').join('');
    const weekly=Array.from({length:6},(_,i)=>{const week=state.week-5+i;return {week,count:vals.filter(x=>Number(x.k.split('-')[0])===week&&x.v.completed&&hasDone(x.v)).length};}),maxSessions=Math.max(1,...weekly.map(x=>x.count));
    $('#progress-charts').innerHTML='<div class="chart-card"><h3>Exercise trend</h3><select class="select" id="chart-exercise">'+unique.map(x=>'<option value="'+escapeAttr(x.id)+'" '+(x.id===id?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join('')+'</select><div class="settings-note">Highest completed load · kg</div>'+chart('weight','kg')+'<div class="settings-note">Average completed '+(chosen.unit==='seconds'?'seconds':'reps')+'</div>'+chart('reps',chosen.unit)+'</div><div class="chart-card"><h3>Completed sets by muscle · This week</h3>'+(bars||'<div class="empty">No completed sets this week.</div>')+'</div><div class="chart-card"><h3>Completed workouts per week</h3><svg viewBox="0 0 320 118" role="img" aria-label="Completed sessions over six weeks">'+weekly.map((x,i)=>'<rect x="'+(24+i*48)+'" y="'+(90-x.count/maxSessions*65)+'" width="26" height="'+Math.max(2,x.count/maxSessions*65)+'" rx="5" fill="#ee2d4d"/><text class="chart-label" x="'+(37+i*48)+'" y="110" text-anchor="middle">W'+x.week+'</text><text class="chart-label" x="'+(37+i*48)+'" y="'+(82-x.count/maxSessions*65)+'" text-anchor="middle">'+x.count+'</text>').join('')+'</svg></div>';
    $('#chart-exercise').onchange=e=>{state.progressExercise=e.target.value;saveState();renderCharts(vals);};
  }
  function updateArtCacheStatus(){const art=state.exerciseArtCache||{};const el=$('#art-cache-status');if(!el)return;el.textContent=art.ready>=LIFT_CATALOGUE.exercises.length?'All exercise sketches are ready offline.':art.ready?`Preparing offline sketches · ${art.ready} of ${LIFT_CATALOGUE.exercises.length}`:'Exercise sketches prepare for offline use after the first online visit.';}
  function renderSettings(){
    $('#weekly-days').value=String(state.daysPerWeek);$('#experience-level').value=state.experience||'';
    const muscles=[...new Set(LIFT_CATALOGUE.exercises.flatMap(e=>e.primary))].sort();$('#priority-muscles').innerHTML=muscles.map(m=>`<label class="equipment-option"><input type="checkbox" value="${escapeAttr(m)}" ${state.priorityMuscles.includes(m)?'checked':''}><span>${escapeHtml(m)}</span></label>`).join('');
    $('#equipment-grid').innerHTML=Object.entries(LIFT_CATALOGUE.equipmentLabels).map(([key,label])=>`<label class="equipment-option"><input type="checkbox" value="${key}" ${state.equipment.includes(key)?'checked':''}><span>${label}</span></label>`).join('');
    $('#weight-steps').innerHTML=Object.entries(LIFT_CATALOGUE.equipmentLabels).map(([key,label])=>`<label class="equipment-option"><span>${label}</span><select class="select weight-step-select" data-equipment="${key}" aria-label="${label} weight increment">${[.5,1,2,2.5,5].map(v=>`<option value="${v}" ${Number(state.weightSteps?.[key]??1)===v?'selected':''}>${v}</option>`).join('')}</select> kg</label>`).join('');
    $('#plan-summary').textContent=(state.daysPerWeek==='valentin'?'Valentin · 5 workouts':'Adaptive · '+days.length+' workouts')+' · '+Math.min(...days.map(d=>d.minutes))+'–'+Math.max(...days.map(d=>d.minutes))+' min estimated';$('#catalogue-size').textContent=LIFT_CATALOGUE.exercises.length+' exercises · Offline guides';
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
    if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const next=parsed.data||parsed;if(!next.logs||typeof next.logs!=='object'||Array.isArray(next.logs)||!Number.isInteger(next.week)||next.week<1)throw new Error('Invalid backup');openConfirm('Restore this backup?','Your current workout log will be replaced by the selected backup.',()=>{state=hydrate(next);delete state.storageRecovery;days=buildDays();saveState();renderSettings();updateHome();updateProgressScreen();showToast('Backup restored.');});}catch(e){showToast('That backup file could not be opened.');}};reader.readAsText(file);
  }
  function updateOnline(){const online=navigator.onLine;$('#online-dot').classList.toggle('offline',!online);$('#online-label').textContent=online?'Ready to save on this iPhone':'Offline · Your workout still saves on this iPhone';}
  function prepareExerciseArt(){if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http'))return;navigator.serviceWorker.addEventListener('message',event=>{const data=event.data;if(!data||!['EXERCISE_ART_PROGRESS','EXERCISE_ART_READY'].includes(data.type))return;const previous=state.exerciseArtCache?.ready||0;state.exerciseArtCache={ready:data.ready,total:data.total,failed:data.failed||0};saveState();updateArtCacheStatus();if(data.type==='EXERCISE_ART_READY'&&data.ready===data.total&&previous<data.total)showToast('All exercise sketches are ready offline.');});navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(reg=>{const worker=navigator.serviceWorker.controller||reg.active;if(!worker)return;worker.postMessage({type:'PREPARE_EXERCISE_ART',urls:LIFT_CATALOGUE.exercises.map(e=>'./media/exercises/'+e.id+'.svg')});}).catch(()=>{});}
  function escapeHtml(str){return String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(str){return escapeHtml(str);}

  let catalogueMode='browse',catalogueLimit=60,scopeAction=null;
  function openScope(title,copy,kind,action){scopeAction=action;$('#scope-title').textContent=title;$('#scope-copy').textContent=copy+' Choose how long this change should apply.';$('#scope-modal').classList.remove('hidden');$('#scope-week').focus();}
  function persistentDay(){const id=state.weekPlans[snapshotKey()].programId;state.persistentEdits[id]||={};state.persistentEdits[id][activeDay.id]||={remove:[],add:[],replace:[],setCounts:[]};return state.persistentEdits[id][activeDay.id];}
  function markEdited(){activeDay.customized=true;updateDropSuggestion(activeDay);savePlan();renderWorkout();updateHome();}
  function replaceExercise(ei,item,scope){const previous=activeDay.exercises[ei],log=currentLog(activeDay),old=log.exercises[previous.id];if(old){log.variantHistory||=[];log.variantHistory.push({...old,id:previous.id,updatedAt:log.updatedAt||new Date().toISOString()});delete log.exercises[previous.id];}const e=LIFT_ENGINE.descriptor(item,previous.id,state,{sets:previous.sets.length,baseline:true});e.alternativeSelected=true;e.estimatedWeight=e.estimated?e.sets[0].weight:null;activeDay.exercises[ei]=e;if(scope==='future'){const edit=persistentDay();edit.replace=edit.replace.filter(x=>x.id!==e.id);edit.replace.push({id:e.id,catalogId:e.catalogId,sets:e.sets.length});}if(state.exerciseNames?.[activeDay.id])delete state.exerciseNames[activeDay.id][previous.id];log.updatedAt=new Date().toISOString();markEdited();}
  function removeExercise(ei){const e=activeDay.exercises[ei];openScope('Remove '+e.name+'?','Completed sets will stay in your history.','remove',scope=>{activeDay.exercises.splice(ei,1);if(scope==='future'){const edit=persistentDay();edit.remove=[...new Set([...edit.remove,e.id])];edit.add=edit.add.filter(x=>x.id!==e.id);}markEdited();});}
  function editSets(ei){const e=activeDay.exercises[ei];$('#sets-count').value=String(e.sets.length);$('#sets-modal').classList.remove('hidden');$('#sets-save').onclick=()=>{const count=Number($('#sets-count').value);$('#sets-modal').classList.add('hidden');openScope('Use '+count+' sets?',e.name+'. Three sets are the default; higher volume adds fatigue and session time.','sets',scope=>{while(e.sets.length<count)e.sets.push({...e.sets.at(-1)});e.sets=e.sets.slice(0,count);if(scope==='future'){const edit=persistentDay();edit.setCounts=edit.setCounts.filter(x=>x.id!==e.id);edit.setCounts.push({id:e.id,count});}markEdited();});};}
  function openCatalogue(mode='browse'){catalogueMode=mode;catalogueLimit=60;$('#catalogue-search').value='';$('#catalogue-muscle').value='';$('#catalogue-level').value='';$('#catalogue-equipment').value='';$('#catalogue-title').textContent=mode==='add'?'Add exercise':'Exercise catalogue';$('#catalogue-modal').classList.remove('hidden');renderCatalogue();$('#catalogue-search').focus();}
  function renderCatalogue(){const words=$('#catalogue-search').value.toLowerCase().trim().split(/\s+/).filter(Boolean),muscle=$('#catalogue-muscle').value,level=$('#catalogue-level').value,equipment=$('#catalogue-equipment').value;const entries=LIFT_CATALOGUE.exercises.filter(e=>words.every(w=>(e.name+' '+e.primary.join(' ')+' '+e.secondary.join(' ')).toLowerCase().includes(w))&&(!muscle||e.primary.includes(muscle))&&(!level||e.level===level)&&(!equipment||e.equipment===equipment));entries.sort((a,b)=>{const rank=e=>Math.max(0,LIFT_CATALOGUE.levels.indexOf(e.level)-LIFT_CATALOGUE.levels.indexOf(state.experience||'beginner'));return rank(a)-rank(b)||a.name.localeCompare(b.name);});$('#catalogue-count').textContent=entries.length+' exercises found';$('#catalogue-list').innerHTML=entries.slice(0,catalogueLimit).map(e=>`<div class="catalogue-entry"><img class="exercise-thumb catalogue-thumb" src="media/exercises/${escapeAttr(e.id)}.svg" alt="" loading="lazy" decoding="async"><div><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(e.primary.join(', '))} · ${escapeHtml(LIFT_CATALOGUE.equipmentLabels[e.equipment])} · ${escapeHtml(e.level)}</small></div><button class="info-button" data-catalogue-guide="${e.id}" aria-label="Guide for ${escapeAttr(e.name)}">i</button>${catalogueMode==='add'?`<button class="btn btn-soft btn-small" data-add="${e.id}">Add</button>`:''}</div>`).join('')+(entries.length>catalogueLimit?'<button class="btn btn-outline" id="catalogue-more">Show more</button>':'')+(entries.length?'':'<div class="empty">No exercises match these filters.</div>');$$('[data-catalogue-guide]').forEach(b=>b.onclick=()=>showGuide(LIFT_CATALOGUE.find(b.dataset.catalogueGuide)));$$('[data-add]').forEach(b=>b.onclick=()=>{const item=LIFT_CATALOGUE.find(b.dataset.add);if(!state.equipment.includes(item.equipment)){showToast('This exercise needs equipment not selected in Settings.');return;}if(activeDay.exercises.some(e=>e.catalogId===item.id)){showToast('This exercise is already in this day.');return;}const expWarning=LIFT_CATALOGUE.levels.indexOf(item.level)>LIFT_CATALOGUE.levels.indexOf(state.experience)?'This exercise requires more technical experience than your selected level. ':'';openScope('Add '+item.name+'?',item.level+' · 3 work sets. '+expWarning+suggestionText(item),'add',scope=>{const id='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),e=LIFT_ENGINE.descriptor(item,id,state,{baseline:true});e.addedByUser=true;activeDay.exercises.push(e);if(scope==='future')persistentDay().add.push({id,catalogId:item.id,sets:3});$('#catalogue-modal').classList.add('hidden');markEdited();});});if($('#catalogue-more'))$('#catalogue-more').onclick=()=>{catalogueLimit+=60;renderCatalogue();};}
  function initializeEditors(){
    $('#catalogue-muscle').innerHTML='<option value="">All muscles</option>'+[...new Set(LIFT_CATALOGUE.exercises.flatMap(e=>e.primary))].sort().map(m=>'<option>'+escapeHtml(m)+'</option>').join('');$('#catalogue-equipment').innerHTML='<option value="">All equipment</option>'+Object.entries(LIFT_CATALOGUE.equipmentLabels).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');
    $('#priority-muscles').addEventListener('change',e=>{if(e.target.matches('input[type="checkbox"]')&&e.target.checked&&$$('#priority-muscles input:checked').length>2){e.target.checked=false;showToast('Choose up to two priority muscle groups.');}});
    ['catalogue-search','catalogue-muscle','catalogue-level','catalogue-equipment'].forEach(id=>$('#'+id).addEventListener(id==='catalogue-search'?'input':'change',()=>{catalogueLimit=60;renderCatalogue();}));$('#catalogue-close').onclick=()=>$('#catalogue-modal').classList.add('hidden');$('#browse-catalogue').onclick=()=>openCatalogue();$('#add-exercise').onclick=()=>openCatalogue('add');$('#scope-cancel').onclick=()=>$('#scope-modal').classList.add('hidden');for(const [id,scope] of [['scope-week','week'],['scope-future','future']])$('#'+id).onclick=()=>{const action=scopeAction;scopeAction=null;$('#scope-modal').classList.add('hidden');action?.(scope);};$('#sets-cancel').onclick=()=>$('#sets-modal').classList.add('hidden');$('#end-week').onclick=endWeek;
  }

  $$('.tab').forEach(tab=>tab.addEventListener('click',()=>{setScreen(tab.dataset.screen);if(tab.dataset.screen==='progress-screen')updateProgressScreen();}));
  $('#back-home').addEventListener('click',closeWorkout);$('#discard-session').addEventListener('click',closeWorkout);
  $('#finish-button').addEventListener('click',()=>openConfirm('Finish this workout?','Your entries have been saved on this iPhone.',finishWorkout));
  $('#finish-session').addEventListener('click',()=>openConfirm('Finish this workout?','Your entries have been saved on this iPhone.',finishWorkout));
  $('#export-settings').addEventListener('click',exportBackup);
  $('#import-button').addEventListener('click',()=>$('#import-file').click());$('#import-file').addEventListener('change',e=>{importBackup(e.target.files[0]);e.target.value='';});
  $('#apply-plan').addEventListener('click',updatePlanSettings);
  $('#guide-close').addEventListener('click',()=>$('#guide-modal').classList.add('hidden'));
  $('#guide-modal').addEventListener('click',e=>{if(e.target.id==='guide-modal')$('#guide-modal').classList.add('hidden');});
  $('#alternative-close').addEventListener('click',()=>$('#alternative-modal').classList.add('hidden'));
  $('#alternative-modal').addEventListener('click',e=>{if(e.target.id==='alternative-modal')$('#alternative-modal').classList.add('hidden');});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')$('#guide-modal').classList.add('hidden');});
  window.addEventListener('online',updateOnline);window.addEventListener('offline',updateOnline);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&restTimer){const button=restTimer.button;const ei=restTimer.ei;if(Date.now()>=restTimer.endAt){$('#timer-'+ei).textContent='Ready';clearInterval(restTimer.interval);restTimer=null;button.textContent='Start rest';button.classList.remove('running');playRestChime();showToast('Rest finished.');}else $('#timer-'+ei).textContent=formatTime(Math.ceil((restTimer.endAt-Date.now())/1000));}});
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',prepareExerciseArt);
  initializeEditors();renderSettings();updateHome();updateProgressScreen();saveState();
})();
