/* Pure weekly planning/progression. A saved week is a snapshot, never a moving target. */
window.LIFT_ENGINE=(()=>{
  const C=LIFT_CATALOGUE,clone=x=>JSON.parse(JSON.stringify(x)),hasArt=item=>!!window.LIFT_REPDB_ART?.[item?.id];
  const majorMuscleGroups=['Chest','Shoulders','Biceps','Triceps','Forearms','Core','Back','Traps','Quadriceps','Adductors','Glutes','Hamstrings','Calves'];
  function majorMuscleGroup(name){if(['Front delts','Side delts','Rear delts','Front deltoids','Rear deltoids'].includes(name))return 'Shoulders';if(['Abs','Obliques','Hip flexors'].includes(name))return 'Core';if(name==='Upper back')return 'Back';if(name==='Upper traps')return 'Traps';if(name==='Brachialis')return 'Biceps';return majorMuscleGroups.includes(name)?name:'';}
  const templates={
    3:[['Full Body A','inclinePress','row','squat','legCurl','curl','triceps','crunch'],['Full Body B','chestPress','verticalPull','hinge','lunge','lateralRaise','calfRaise','crunch'],['Full Body C','chestPress','row','squat','hinge','overheadPress','curl','triceps','crunch']],
    4:[['Upper A','inclinePress','row','verticalPull','overheadPress','curl','triceps'],['Lower A','squat','hinge','legCurl','calfRaise','crunch'],['Upper B','chestPress','row','verticalPull','lateralRaise','curl','triceps'],['Lower B','lunge','hipThrust','kneeExtension','legCurl','calfRaise','crunch']],
    5:[['Push A','inclinePress','chestPress','overheadPress','lateralRaise','triceps'],['Pull A','row','verticalPull','rearDelt','curl','crunch'],['Legs A','squat','hinge','legCurl','calfRaise','crunch'],['Upper B','chestPress','row','verticalPull','lateralRaise','triceps','curl'],['Lower B','lunge','hipThrust','kneeExtension','legCurl','calfRaise','crunch']],
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
        const sets=(entry.sets||[]).map((s,index)=>{const weight=Number(s?.weight),hasValidLoad=Number.isFinite(weight)&&(item.equipment==='bodyweight'?weight>=0:weight>0);return s?.done&&hasValidLoad&&s.weight!==''&&s.weight!=null&&Number(s.reps)>0?{...s,index}:null;});
        if(sets.some(Boolean))records.push({sets,completed:sets.filter(Boolean).length,effort:entry.effort,at:entry.updatedAt||log.updatedAt||'',key});
      }
    }
    return records.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  }
  const compound=new Set(['inclinePress','chestPress','row','verticalPull','squat','lunge','hinge','deadlift','hipThrust','overheadPress','dip']);
  function range(item){if(item.unit==='seconds')return [20,40];return compound.has(item.pattern)?[6,12]:[10,20];}
  function profileLoadGuess(state,item,step){
    if(item.unit==='seconds'||item.equipment==='bodyweight')return null;
    const ratios={inclinePress:.18,chestPress:.18,fly:.06,row:.22,verticalPull:.2,pullover:.1,squat:.28,lunge:.1,hinge:.26,deadlift:.28,hipThrust:.32,kneeExtension:.12,legCurl:.12,calfRaise:.12,seatedCalf:.12,lateralRaise:.04,rearDelt:.05,facePull:.05,overheadPress:.1,uprightRow:.05,curl:.05,hammerCurl:.05,triceps:.05,tricepsOverhead:.05,crunch:.07,antiRotation:.04,shrug:.1};
    const levels={beginner:.72,intermediate:1,advanced:1.25},profile=state.nutrition?.profile||{},bodyWeight=Math.max(40,Math.min(160,Number(profile.currentWeightKg)||70)),age=Number(profile.age)||0;
    let ageFactor=age>0&&age<18?.75:age>40?Math.max(.7,1-(age-40)*.006):1;
    const equipmentFactor={barbell:1,dumbbell:/single-arm|one-arm|single-leg/i.test(item.name)?.7:.5,smith:.85,machine:.75,cable:.65,band:.45};
    const ratio=ratios[item.pattern]||.08,raw=bodyWeight*ratio*(levels[state.experience]||levels.beginner)*ageFactor*(equipmentFactor[item.equipment]||.65);
    const rounded=Math.floor(raw/step)*step;
    return Math.max(step,Math.round(rounded*100)/100);
  }
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
      if(estimate==null){estimate=profileLoadGuess(state,item,step);if(estimate!=null)estimateSource='your profile';}
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
  function minutes(exercises){const paired=new Set();let total=8;for(const e of exercises){const minis=e.sets.filter(s=>s.mini).length;total+=e.sets.length*.75+1.5;if(e.supersetGroup){if(!paired.has(e.supersetGroup)){paired.add(e.supersetGroup);total+=(e.sets.length-1)*e.rest/60;}}else total+=minis*.25+Math.max(0,e.sets.length-1-minis)*e.rest/60;}return Math.ceil(total/5)*5;}
  function removeLegAccessory(days,preferred,order){
    const groups=new Set(['Quadriceps','Hamstrings','Glutes','Calves']);
    const dayOrder=[...preferred,...days.map(d=>d.id).filter(id=>!preferred.includes(id))];
    for(const pattern of order)for(const dayId of dayOrder){const day=days.find(d=>d.id===dayId);if(!day)continue;const index=day.exercises.findIndex(e=>e.pattern===pattern);if(index<0)continue;const exercise=day.exercises[index],item=C.find(exercise.catalogId),primary=(item?.primary||[]).filter(m=>groups.has(m));
      const keepsFrequency=primary.every(m=>new Set(days.flatMap(d=>d.exercises.filter(e=>e!==exercise&&(C.find(e.catalogId)?.primary||[]).includes(m)).map(()=>d.id))).size>=2);
      if(keepsFrequency){day.exercises.splice(index,1);return {dayId,pattern,exercise};}}
    return null;
  }
  function movePattern(days,fromId,toId,pattern){const from=days.find(d=>d.id===fromId),to=days.find(d=>d.id===toId);if(!from||!to)return;const index=from.exercises.findIndex(e=>e.pattern===pattern);if(index>=0)to.exercises.push(from.exercises.splice(index,1)[0]);}
  function removeAdjacentDuplicates(days){let previous=new Set();for(const day of days){const used=new Set(previous),kept=[];for(const exercise of day.exercises){const key=exercise.catalogId||exercise.name.trim().toLowerCase();if(used.has(key))continue;used.add(key);kept.push(exercise);}day.exercises=kept;previous=new Set(kept.map(e=>e.catalogId||e.name.trim().toLowerCase()));day.minutes=minutes(day.exercises);}return days;}
  function reduceLegVolumePlan(plan){if(!plan?.days||plan.legVolumeAdjusted)return plan;const groups=['Quadriceps','Hamstrings','Glutes','Calves'],accessories=new Set(['kneeExtension','legCurl','abduction','calfRaise','seatedCalf']),compoundPatterns=new Set(['inclinePress','chestPress','row','verticalPull','squat','lunge','hinge','deadlift','hipThrust','overheadPress','dip']);for(const group of groups){const entries=()=>plan.days.flatMap(day=>day.exercises.map(exercise=>({exercise,item:C.find(exercise.catalogId)||C.find(exercise.name)})).filter(row=>row.item?.primary.includes(group)));let rows=entries(),total=rows.reduce((sum,row)=>sum+row.exercise.sets.length,0),remove=Math.max(0,total-Math.round(total*.85));const ordered=[...rows.filter(row=>accessories.has(row.exercise.pattern)),...rows.filter(row=>!accessories.has(row.exercise.pattern))];for(const row of ordered){if(!remove)break;const compound=compoundPatterns.has(row.exercise.pattern),minimum=compound?2:1,available=Math.max(0,row.exercise.sets.length-minimum),cut=Math.min(remove,available);if(cut){row.exercise.sets.splice(row.exercise.sets.length-cut,cut);remove-=cut;}}}plan.days.forEach(day=>{day.minutes=minutes(day.exercises);day.optionalDropSet=day.minutes<65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!compoundPatterns.has(e.pattern)&&e.unit!=='seconds'):-1;});plan.legVolumeAdjusted=true;return plan;}
  function rebalance(days,count){
    if(count===3){removeLegAccessory(days,['d3','d2'],['kneeExtension','legCurl','seatedCalf','calfRaise']);movePattern(days,'d2','d3','triceps');}
    if(count===4){const removed=removeLegAccessory(days,['d4','d3','d2'],['abduction','kneeExtension','legCurl','seatedCalf','calfRaise']);if(removed?.pattern==='abduction')movePattern(days,'d3','d4','seatedCalf');}
    if(count===5){const removed=removeLegAccessory(days,['d5','d1','d2'],['abduction','kneeExtension','legCurl','seatedCalf','calfRaise']);if(removed?.pattern==='abduction')movePattern(days,'d1','d5','seatedCalf');movePattern(days,'d1','d3','triceps');movePattern(days,'d1','d4','crunch');}
    if(count===6){removeLegAccessory(days,['d6','d3'],['abduction','seatedCalf','kneeExtension','legCurl','calfRaise']);}
    return days;
  }
  function rebalanceLowerFocus(days,state,groups){
    const focus=new Set(groups||[]),experience=C.levels.indexOf(state.experience||'beginner'),isolation=new Set(['kneeExtension','legCurl','calfRaise','seatedCalf','lateralRaise','rearDelt','facePull','curl','hammerCurl','triceps','tricepsOverhead','crunch','antiRotation','shrug','uprightRow','abduction','fly']);
    if(!focus.size)return;
    const currentIds=new Set(days.flatMap(day=>day.exercises.map(exercise=>exercise.catalogId)).filter(Boolean));
    for(const muscle of focus){
      let replaced=false;
      const weeklySets=new Map();for(const entry of days.flatMap(d=>d.exercises)){const item=C.find(entry.catalogId);for(const group of item?.primary||[])weeklySets.set(group,(weeklySets.get(group)||0)+entry.sets.length);}
      for(const day of [...days].sort((a,b)=>minutes(b.exercises)-minutes(a.exercises))){
        const index=day.exercises.findIndex(exercise=>{const item=C.find(exercise.catalogId);return item?.primary.includes(muscle)&&isolation.has(exercise.pattern);});
        if(index<0)continue;
        const old=day.exercises[index],dayMuscles=new Set(day.exercises.filter((_,i)=>i!==index).flatMap(exercise=>C.find(exercise.catalogId)?.primary||[]).filter(group=>!focus.has(group)));
        const candidates=C.exercises.filter(item=>hasArt(item)&&state.equipment.includes(item.equipment)&&C.levels.indexOf(item.level)<=experience&&isolation.has(item.pattern)&&!item.primary.some(group=>focus.has(group))&&!currentIds.has(item.id)&&item.primary.some(group=>dayMuscles.has(group)));
        candidates.sort((a,b)=>{const score=item=>item.primary.reduce((sum,group)=>sum+(weeklySets.get(group)||0),0);return score(a)-score(b)||a.name.localeCompare(b.name);});
        const alternative=candidates[0];if(!alternative)continue;
        day.exercises[index]=descriptor(alternative,old.id,state,{sets:old.sets.length,baseline:true});
        day.exercises[index].replacedForLowerFocus=muscle;day.exercises[index].replacedExercise=old.name;
        currentIds.delete(old.catalogId);currentIds.add(alternative.id);day.minutes=minutes(day.exercises);replaced=true;break;
      }
      if(!replaced)continue;
    }
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
    const eligible=list.filter(e=>e.planningEligible!==false&&C.levels.indexOf(e.level)<=allowed),pool=eligible;
    const available=pool.filter(e=>!usedIds.includes(e.id)),names=preferred[level]?.[pattern]||defaults[pattern]||[],ordered=names.map(C.find).filter(e=>e&&available.some(x=>x.id===e.id));
    const recent=new Set(Object.entries(state.weekPlans||{}).filter(([key])=>Number(key.split(':')[0])>=state.week-2).flatMap(([,plan])=>(plan.days||[]).flatMap(day=>(day.exercises||[]).map(e=>e.catalogId))));
    const anchors=ordered.filter(e=>histories(state,e).length);
    const selected=compound.has(pattern)?(anchors[0]||ordered[index]||ordered[0]||available[0]):(available.find(e=>!recent.has(e.id))||ordered[index]||ordered[0]||available[0]);
    return selected||pool[0]||null;
  }
  function generate(state,source){
    const programId='adaptive-'+(Number(state.daysPerWeek)||5);let missing=[];
    let days;
      const seen={};const usedThisWeek=[];days=templates[Number(state.daysPerWeek)||5].map((row,di)=>{const day={id:'d'+(di+1),name:row[0],warmup:'Warm-up: 5–8 minutes of comfortable movement, then 1–3 progressively heavier warm-up sets for your first compound exercises.',exercises:row.slice(1).map((p,ei)=>{
        const item=choose(p,state,seen[p]||0,usedThisWeek);seen[p]=(seen[p]||0)+1;if(!item){missing.push(p);return null;}usedThisWeek.push(item.id);return descriptor(item,'d'+(di+1)+'-slot'+ei,state);
      }).filter(Boolean)};return day;});
      const priorities=[...new Set((state.priorityMuscles||[]).filter(m=>C.exercises.some(e=>e.primary.includes(m))))].slice(0,2);
      for(const muscle of priorities){
        let slots=days.map(day=>({day,e:day.exercises.find(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle))})).filter(x=>x.e).sort((a,b)=>minutes(a.day.exercises)-minutes(b.day.exercises));
        let addedBaseline=null;if(!slots.length){const item=C.exercises.find(e=>hasArt(e)&&e.primary.includes(muscle)&&state.equipment.includes(e.equipment)&&C.levels.indexOf(e.level)<=C.levels.indexOf(state.experience||'beginner'));if(item){const day=days.slice().sort((a,b)=>minutes(a.exercises)-minutes(b.exercises))[0],candidate=day&&descriptor(item,'priority-'+slug(muscle),state);if(day&&candidate&&minutes([...day.exercises,candidate])<=90){day.exercises.push(candidate);addedBaseline=candidate;slots=[{day,e:candidate}];}}}
        let increased=0;for(const {day,e} of slots){if(increased>=2)break;if(e!==addedBaseline){const trial=day.exercises.map(x=>x===e?{...x,sets:[...x.sets,{...x.sets.at(-1)}]}:x),history=histories(state,C.find(e.catalogId)),planned=slots.reduce((n,slot)=>n+slot.e.sets.length,0),progress=history.length>=2&&history.slice(0,2).every(h=>h.completed>=e.sets.length)&&history[0].sets.filter(Boolean).reduce((n,s)=>n+Number(s.weight)*Number(s.reps),0)>history[1].sets.filter(Boolean).reduce((n,s)=>n+Number(s.weight)*Number(s.reps),0);if(e.sets.length<4&&minutes(trial)<=70&&(!history.length&&planned<10||progress)){e.sets.push({...e.sets.at(-1)});increased++;}}day.priorityMuscles=[...new Set([...(day.priorityMuscles||[]),muscle])];}
        days.forEach(day=>{const index=day.exercises.findIndex(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle));if(index>0){const [e]=day.exercises.splice(index,1);day.exercises.unshift(e);}});
      }
      if((Number(state.daysPerWeek)||5)===6)rebalance(days,6);
      for(const muscle of priorities)days.forEach(day=>{const index=day.exercises.findIndex(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle));if(index>0){const [e]=day.exercises.splice(index,1);day.exercises.unshift(e);}});
      days.forEach(day=>{day.priorityMuscles=[];for(const muscle of priorities)if(day.exercises.some(e=>(C.find(e.catalogId)?.primary||[]).includes(muscle)))day.priorityMuscles.push(muscle);});
      rebalanceLowerFocus(days,state,[...new Set((state.lowerFocusMuscles||[]).filter(m=>C.exercises.some(e=>e.primary.includes(m))&&!priorities.includes(m)))].slice(0,2));
    const edits=state.persistentEdits?.[programId]||{};
    const removed=new Set(Object.values(edits).flatMap(edit=>edit.remove||[])),replacements=new Map(Object.values(edits).flatMap(edit=>edit.replace||[]).map(x=>[x.id,x])),setCounts=new Map(Object.values(edits).flatMap(edit=>edit.setCounts||[]).map(x=>[x.id,x.count]));
    days.forEach(day=>{const edit=edits[day.id]||{};day.exercises=day.exercises.filter(e=>!removed.has(e.id));for(const saved of edit.add||[]){const item=C.find(saved.catalogId);if(item&&hasArt(item))day.exercises.push(descriptor(item,saved.id,state,{sets:saved.sets||3}));}day.exercises=day.exercises.map(e=>{const replacement=replacements.get(e.id),item=replacement&&C.find(replacement.catalogId);if(item&&hasArt(item))e=descriptor(item,e.id,state,{sets:replacement.sets||3});const count=setCounts.get(e.id);if(count){while(e.sets.length<count)e.sets.push({...e.sets.at(-1)});e.sets=e.sets.slice(0,count);}return e;});day.minutes=minutes(day.exercises);day.optionalDropSet=day.minutes<65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!compound.has(e.pattern)&&e.unit!=='seconds'):-1;});
    removeAdjacentDuplicates(days);
    days.forEach((day,di)=>{
      while(minutes(day.exercises)>70&&day.exercises.length>4){const i=day.exercises.findLastIndex(e=>!compound.has(e.pattern)&&!priorities.some(m=>(C.find(e.catalogId)?.primary||[]).includes(m)));day.exercises.splice(i>=0?i:day.exercises.length-1,1);}
      const top=day.exercises.find(e=>compound.has(e.pattern)&&e.equipment!=='bodyweight'&&e.sets.length>=3&&histories(state,C.find(e.catalogId)).length>0&&Number(e.sets[0].weight)>=2*Number(state.weightSteps?.[e.equipment]||1));
      if(top){const step=Number(state.weightSteps?.[top.equipment]||1),load=Number(top.sets[0].weight);top.sets.forEach((set,i)=>{set.role=i?'backoff':'top';if(i)set.weight=Math.max(0,Math.floor(load*.92/step)*step);});}
      day.minutes=minutes(day.exercises);
      day.optionalDropSet=di%3===1&&day.minutes<=65?day.exercises.findIndex(e=>['cable','machine'].includes(e.equipment)&&!compound.has(e.pattern)&&e.unit!=='seconds'):-1;
      day.optionalDropExerciseId=day.exercises[day.optionalDropSet]?.id||null;
    });
    return {version:5,programId,week:state.week,experience:state.experience,days,missingPatterns:[...new Set(missing)],localGenerated:true};
  }
  function volume(days){const result=Object.fromEntries(majorMuscleGroups.map(group=>[group,{sets:0,days:new Set()}]));for(const d of days)for(const e of d.exercises){const item=C.find(e.catalogId)||C.find(e.name),groups=[...new Set((item?.primary||[e.muscle]).map(majorMuscleGroup).filter(Boolean))];for(const group of groups){result[group].sets+=e.sets.filter(s=>!s.mini).length;result[group].days.add(d.id);}}return Object.fromEntries(majorMuscleGroups.map(group=>[group,{sets:result[group].sets,frequency:result[group].days.size}]));}
  function slug(value){return String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  return {clone,generate,descriptor,histories,targets,minutes,volume,templates,illustratedReplacement,removeAdjacentDuplicates,reduceLegVolumePlan,rebalanceLowerFocus,majorMuscleGroups,majorMuscleGroup};
})();
