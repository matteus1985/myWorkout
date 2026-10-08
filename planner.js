/* Pure weekly planning/progression. A saved week is a snapshot, never a moving target. */
window.LIFT_ENGINE=(()=>{
  const C=LIFT_CATALOGUE,clone=x=>JSON.parse(JSON.stringify(x)),hasArt=item=>!!window.LIFT_REPDB_ART?.[item?.id];
  const templates={
    3:[['Full Body A','inclinePress','row','squat','hinge','hipThrust','overheadPress','lateralRaise','rearDelt','triceps','calfRaise'],['Full Body B','chestPress','verticalPull','lunge','hipThrust','legCurl','overheadPress','curl','triceps','calfRaise','crunch'],['Full Body C','chestPress','row','kneeExtension','hinge','rearDelt','legCurl','seatedCalf','crunch','curl','lateralRaise']],
    4:[['Upper A','inclinePress','chestPress','row','verticalPull','lateralRaise','overheadPress','rearDelt','curl','triceps'],['Lower A','squat','lunge','hinge','hipThrust','legCurl','calfRaise','crunch'],['Upper B','chestPress','row','verticalPull','overheadPress','rearDelt','lateralRaise','curl','triceps','seatedCalf'],['Lower B','kneeExtension','hinge','hipThrust','legCurl','abduction','calfRaise','crunch']],
    5:[['Upper','inclinePress','row','verticalPull','lateralRaise','overheadPress','rearDelt','curl','triceps','seatedCalf','crunch'],['Lower','squat','lunge','hinge','hipThrust','legCurl','calfRaise'],['Push','chestPress','fly','overheadPress','lateralRaise','triceps'],['Pull','row','verticalPull','rearDelt','curl','triceps'],['Legs + Core','kneeExtension','hinge','hipThrust','legCurl','abduction','calfRaise','crunch']],
    6:[['Push A','inclinePress','chestPress','overheadPress','lateralRaise','triceps'],['Pull A','row','verticalPull','rearDelt','curl','crunch'],['Legs A','squat','lunge','hinge','hipThrust','legCurl','calfRaise'],['Push B','chestPress','overheadPress','lateralRaise','tricepsOverhead'],['Pull B','row','verticalPull','rearDelt','hammerCurl','crunch'],['Legs B','kneeExtension','hinge','hipThrust','legCurl','abduction','calfRaise','seatedCalf']]
  };
  const preferred={
    beginner:{inclinePress:['Incline Machine Press','Incline Smith Machine Press','Incline Dumbbell Press'],chestPress:['Machine Chest Press','Dumbbell Floor Press','Incline Push-Up'],row:['Chest-Supported Row','Seated Cable Row','Chest-Supported Dumbbell Row','Band Row'],verticalPull:['Neutral-Grip Lat Pulldown','Assisted Pull-Up Machine','Band Lat Pulldown'],squat:['Leg Press','Hack Squat','Goblet Squat','Bodyweight Squat'],lunge:['Smith Machine Split Squat','Bodyweight Split Squat','Dumbbell Split Squat'],hinge:['Smith Machine Romanian Deadlift','Dumbbell Romanian Deadlift','Cable Pull-Through','45-Degree Back Extension'],fly:['Pec Deck Fly','Band Chest Fly','Standing Cable Fly'],overheadPress:['Machine Shoulder Press','Seated Dumbbell Shoulder Press','Band Overhead Press']},
    intermediate:{inclinePress:['Incline Dumbbell Press','Incline Barbell Bench Press'],chestPress:['Flat Dumbbell Press','Machine Chest Press','Flat Barbell Bench Press','Push-Up'],row:['Chest-Supported Row','Seated Cable Row','Chest-Supported Dumbbell Row'],verticalPull:['Neutral-Grip Lat Pulldown','Pull-Up','Band Lat Pulldown'],squat:['Back Squat','Hack Squat','Goblet Squat'],lunge:['Dumbbell Split Squat','Smith Machine Split Squat','Bodyweight Reverse Lunge'],hinge:['Barbell Romanian Deadlift','Dumbbell Romanian Deadlift','Cable Pull-Through'],fly:['Low-to-High Cable Fly','Pec Deck Fly'],overheadPress:['Seated Dumbbell Shoulder Press','Machine Shoulder Press']},
    advanced:{inclinePress:['Incline Barbell Bench Press','Incline Dumbbell Press'],chestPress:['Flat Dumbbell Press','Flat Barbell Bench Press','Machine Chest Press'],row:['Chest-Supported Row','Seal Row','Meadows Row','Seated Cable Row'],verticalPull:['Weighted Pull-Up','Neutral-Grip Lat Pulldown','Pull-Up'],squat:['Back Squat','Safety-Bar Squat','Hack Squat'],lunge:['Bulgarian Split Squat','Dumbbell Split Squat'],hinge:['Barbell Romanian Deadlift','B-Stance Dumbbell Romanian Deadlift'],fly:['Low-to-High Cable Fly','Pec Deck Fly'],overheadPress:['Seated Dumbbell Shoulder Press','Barbell Overhead Press']}
  };
  const defaults={kneeExtension:['Leg Extension','Band Leg Extension','Assisted Reverse Nordic Curl'],legCurl:['Seated Leg Curl','Lying Leg Curl','Band Leg Curl','Sliding Hamstring Curl'],calfRaise:['Standing Calf Raise','Dumbbell Standing Calf Raise','Single-Leg Calf Raise'],lateralRaise:['Cable Lateral Raise','Machine Lateral Raise','Dumbbell Lateral Raise','Band Lateral Raise'],rearDelt:['Reverse Pec Deck','Chest-Supported Rear-Delt Raise','Band Pull-Apart'],curl:['Cable Curl','EZ-Bar Curl','Standing Dumbbell Curl','Band Curl'],hammerCurl:['Hammer Curl','Rope Hammer Curl','Band Hammer Curl'],triceps:['Rope Pushdown','Single-Arm Cable Triceps Extension','Band Pushdown'],tricepsOverhead:['Overhead Cable Extension','Dumbbell Overhead Extension','Band Overhead Triceps Extension'],crunch:['Cable Crunch','Ab Crunch Machine','Floor Crunch','Band Crunch']};
  function histories(state,item){
    const records=[];
    for(const [key,log] of Object.entries(state.logs||{})){
      if(Number(key.split('-')[0])>state.week)continue;
      for(const entry of [...Object.values(log.exercises||{}),...(log.variantHistory||[])]){
        const found=C.find(entry.catalogId)||C.find(entry.name);if(found?.id!==item.id)continue;
        const sets=(entry.sets||[]).map((s,index)=>s?.done&&Number.isFinite(Number(s.weight))&&s.weight!==''&&s.weight!=null&&Number(s.reps)>0?{...s,index}:null);
        if(sets.some(Boolean))records.push({sets,completed:sets.filter(Boolean).length,effort:entry.effort,at:entry.updatedAt||log.updatedAt||'',key});
      }
    }
    return records.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  }
  const compound=new Set(['inclinePress','chestPress','row','verticalPull','squat','lunge','hinge','deadlift','hipThrust','overheadPress','dip']);
  function range(item){if(item.unit==='seconds')return [20,40];return compound.has(item.pattern)?[6,12]:[10,20];}
  function targets(state,item,sets,base=false){
    const history=histories(state,item),prior=history[0],n=sets.length,step=Number(state.weightSteps?.[item.equipment]||1);
    const full=prior&&prior.sets.slice(0,n).every(Boolean);
    const top=r=>r&&r.sets.slice(0,n).every((x,i)=>x&&Number(x.reps)>=sets[i].max);
    const sameLoad=prior&&history[1]&&sets.every((s,i)=>Number(prior.sets[i]?.weight)===Number(history[1].sets[i]?.weight));
    const rise=full&&top(prior)&&(Number(prior.effort)>=2||(prior.effort==null&&sameLoad&&top(history[1])));
    let estimate=null,estimateSource='';
    if(!prior&&item.unit!=='seconds'){
      const candidates=C.exercises.filter(x=>x.id!==item.id&&x.pattern===item.pattern&&x.equipment===item.equipment&&x.unit===item.unit&&x.primary.some(m=>item.primary.includes(m))).flatMap(x=>histories(state,x).map(h=>({exercise:x,history:h})));
      candidates.sort((a,b)=>String(b.history.at).localeCompare(String(a.history.at)));
      const candidate=candidates.find(x=>x.history.sets.find(Boolean));
      if(candidate){const sourceSet=candidate.history.sets.find(Boolean),scale=['barbell','dumbbell','smith','bodyweight'].includes(item.equipment)?.8:.7;estimate=Math.max(0,Math.floor(Number(sourceSet.weight)*scale/step)*step);estimateSource=candidate.exercise.name;}
    }
    return {estimated:!prior&&estimate!=null,estimateSource:estimateSource||null,sets:sets.map((s,i)=>{
      const p=prior?.sets[i],lastLogged=prior?.sets.filter(Boolean).at(-1);let weight=p?Number(p.weight):s.weight==null?(estimate??lastLogged?.weight??0):s.weight,reps=p?Math.max(s.min,Math.min(s.max,Number(p.reps))):s.min;
      if(full&&!base){if(rise){weight=Math.round((weight+step)*100)/100;reps=s.min;}else if(prior.effort==null||Number(prior.effort)>=2)reps=Math.min(s.max,reps+1);}
      return {...s,weight,target:reps};
    })};
  }
  function descriptor(item,id,state,{sets=3,baseline=false}={}){
    const [min,max]=range(item),planned=targets(state,item,Array.from({length:sets},()=>({weight:null,min,max})),baseline);
    return {id,catalogId:item.id,name:item.name,muscle:item.primary.join(' · '),equipment:item.equipment,pattern:item.pattern,level:item.level,unit:item.unit,sets:planned.sets,rest:compound.has(item.pattern)?150:90,note:'',estimated:planned.estimated,estimateSource:planned.estimateSource||null};
  }
  function minutes(exercises){return Math.ceil((8+exercises.reduce((s,e)=>s+e.sets.length*.75+(e.sets.length-1)*e.rest/60+1.5,0))/5)*5;}
  function removeLegAccessory(days,preferred,order){
    const groups=new Set(['Quadriceps','Hamstrings','Glutes','Calves']);
    const dayOrder=[...preferred,...days.map(d=>d.id).filter(id=>!preferred.includes(id))];
    for(const pattern of order)for(const dayId of dayOrder){const day=days.find(d=>d.id===dayId);if(!day)continue;const index=day.exercises.findIndex(e=>e.pattern===pattern);if(index<0)continue;const exercise=day.exercises[index],item=C.find(exercise.catalogId),primary=(item?.primary||[]).filter(m=>groups.has(m));
      const keepsFrequency=primary.every(m=>new Set(days.flatMap(d=>d.exercises.filter(e=>e!==exercise&&(C.find(e.catalogId)?.primary||[]).includes(m)).map(()=>d.id))).size>=2);
      if(keepsFrequency){day.exercises.splice(index,1);return {dayId,pattern,exercise};}}
    return null;
  }
  function movePattern(days,fromId,toId,pattern){const from=days.find(d=>d.id===fromId),to=days.find(d=>d.id===toId);if(!from||!to)return;const index=from.exercises.findIndex(e=>e.pattern===pattern);if(index>=0)to.exercises.push(from.exercises.splice(index,1)[0]);}
  function rebalance(days,count){
    if(count===3){removeLegAccessory(days,['d3','d2'],['kneeExtension','legCurl','seatedCalf','calfRaise']);movePattern(days,'d2','d3','triceps');}
    if(count===4){const removed=removeLegAccessory(days,['d4','d3','d2'],['abduction','kneeExtension','legCurl','seatedCalf','calfRaise']);if(removed?.pattern==='abduction')movePattern(days,'d3','d4','seatedCalf');}
    if(count===5){const removed=removeLegAccessory(days,['d5','d1','d2'],['abduction','kneeExtension','legCurl','seatedCalf','calfRaise']);if(removed?.pattern==='abduction')movePattern(days,'d1','d5','seatedCalf');movePattern(days,'d1','d3','triceps');movePattern(days,'d1','d4','crunch');}
    if(count===6){removeLegAccessory(days,['d6','d3'],['abduction','seatedCalf','kneeExtension','legCurl','calfRaise']);}
    return days;
  }
  function illustratedReplacement(item,state,{usedIds=[]}={}){
    const level=state.experience||'beginner',allowed=C.levels.indexOf(level),source=item?.primary?item:C.find(item?.catalogId)||C.find(item?.name)||C.find(item),sourceMuscles=source?.primary||[];
    if(!sourceMuscles.length)return null;
    const candidates=C.exercises.filter(e=>hasArt(e)&&state.equipment.includes(e.equipment)&&e.primary.some(m=>sourceMuscles.includes(m)));
    const rank=e=>[e.pattern===source?.pattern?0:1,e.unit===source?.unit?0:1,C.levels.indexOf(e.level)<=allowed?0:1,Math.abs(C.levels.indexOf(e.level)-allowed),e.equipment===source?.equipment?0:1,usedIds.includes(e.id)?1:0];
    candidates.sort((a,b)=>{const x=rank(a),y=rank(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return a.name.localeCompare(b.name);});
    return candidates.find(e=>!usedIds.includes(e.id))||candidates[0]||null;
  }
  function choose(pattern,state,index,usedIds=[]){
    const level=state.experience||'beginner',allowed=C.levels.indexOf(level),list=C.exercises.filter(e=>e.pattern===pattern&&state.equipment.includes(e.equipment)&&hasArt(e));
    const eligible=list.filter(e=>C.levels.indexOf(e.level)<=allowed),pool=eligible.length?eligible:list.filter(e=>e.level==='beginner');
    const names=preferred[level]?.[pattern]||defaults[pattern]||[],ordered=names.map(C.find).filter(e=>e&&pool.some(x=>x.id===e.id));
    const selected=ordered.length?ordered[Math.min(index,ordered.length-1)]:pool.find(e=>!usedIds.includes(e.id))||pool[0];
    return selected||illustratedReplacement(C.exercises.find(e=>e.pattern===pattern),state,{usedIds});
  }
  function generate(state,source){
    const programId='adaptive-'+(Number(state.daysPerWeek)||5);let missing=[];
    let days;
      const seen={};days=templates[Number(state.daysPerWeek)||5].map((row,di)=>{const used=[];return {id:'d'+(di+1),name:row[0],warmup:'Warm-up: 5–8 minutes of comfortable movement, then 1–3 progressively heavier warm-up sets for your first compound exercises.',exercises:row.slice(1).map((p,ei)=>{
        const item=choose(p,state,seen[p]||0,used);seen[p]=(seen[p]||0)+1;if(!item){missing.push(p);return null;}used.push(item.id);return descriptor(item,'d'+(di+1)+'-slot'+ei,state);
      }).filter(Boolean)};});
      const priorities=[...new Set((state.priorityMuscles||[]).filter(m=>C.exercises.some(e=>e.primary.includes(m))))].slice(0,2);
      for(const muscle of priorities){
        let slots=days.map(day=>({day,e:day.exercises.find(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle))})).filter(x=>x.e).sort((a,b)=>minutes(a.day.exercises)-minutes(b.day.exercises));
        let addedBaseline=null;if(!slots.length){const item=C.exercises.find(e=>hasArt(e)&&e.primary.includes(muscle)&&state.equipment.includes(e.equipment)&&C.levels.indexOf(e.level)<=C.levels.indexOf(state.experience||'beginner'));if(item){const day=days.slice().sort((a,b)=>minutes(a.exercises)-minutes(b.exercises))[0],candidate=day&&descriptor(item,'priority-'+slug(muscle),state);if(day&&candidate&&minutes([...day.exercises,candidate])<=90){day.exercises.push(candidate);addedBaseline=candidate;slots=[{day,e:candidate}];}}}
        let increased=0;for(const {day,e} of slots){if(increased>=2)break;if(e!==addedBaseline){const trial=day.exercises.map(x=>x===e?{...x,sets:[...x.sets,{...x.sets.at(-1)}]}:x);if(e.sets.length<4&&minutes(trial)<=90){e.sets.push({...e.sets.at(-1)});increased++;}}day.priorityMuscles=[...new Set([...(day.priorityMuscles||[]),muscle])];}
        days.forEach(day=>{const index=day.exercises.findIndex(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle));if(index>0){const [e]=day.exercises.splice(index,1);day.exercises.unshift(e);}});
      }
      rebalance(days,Number(state.daysPerWeek)||5);
      for(const muscle of priorities)days.forEach(day=>{const index=day.exercises.findIndex(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle));if(index>0){const [e]=day.exercises.splice(index,1);day.exercises.unshift(e);}});
      days.forEach(day=>{day.priorityMuscles=[];for(const muscle of priorities)if(day.exercises.some(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle)))day.priorityMuscles.push(muscle);});
    const edits=state.persistentEdits?.[programId]||{};
    const removed=new Set(Object.values(edits).flatMap(edit=>edit.remove||[])),replacements=new Map(Object.values(edits).flatMap(edit=>edit.replace||[]).map(x=>[x.id,x])),setCounts=new Map(Object.values(edits).flatMap(edit=>edit.setCounts||[]).map(x=>[x.id,x.count]));
    days.forEach(day=>{const edit=edits[day.id]||{};day.exercises=day.exercises.filter(e=>!removed.has(e.id));for(const saved of edit.add||[]){const item=C.find(saved.catalogId);if(item&&hasArt(item))day.exercises.push(descriptor(item,saved.id,state,{sets:saved.sets||3}));}day.exercises=day.exercises.map(e=>{const replacement=replacements.get(e.id),item=replacement&&C.find(replacement.catalogId);if(item&&hasArt(item))e=descriptor(item,e.id,state,{sets:replacement.sets||3});const count=setCounts.get(e.id);if(count){while(e.sets.length<count)e.sets.push({...e.sets.at(-1)});e.sets=e.sets.slice(0,count);}return e;});day.minutes=minutes(day.exercises);day.optionalDropSet=day.minutes<65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!compound.has(e.pattern)&&e.unit!=='seconds'):-1;});
    return {version:4,programId,week:state.week,experience:state.experience,days,missingPatterns:[...new Set(missing)]};
  }
  function volume(days){const result={};for(const d of days)for(const e of d.exercises){const item=C.find(e.catalogId)||C.find(e.name);for(const group of item?.primary||[e.muscle]){result[group]||={sets:0,days:new Set()};result[group].sets+=e.sets.length;result[group].days.add(d.id);}}return Object.fromEntries(Object.entries(result).map(([k,v])=>[k,{sets:v.sets,frequency:v.days.size}]));}
  function slug(value){return String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  return {clone,generate,descriptor,histories,targets,minutes,volume,templates,illustratedReplacement};
})();
