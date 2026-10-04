/* Original exercise catalogue. Equipment and technique difficulty are explicit. */
window.LIFT_CATALOGUE = (() => {
  const equipmentLabels={barbell:'Barbells',dumbbell:'Dumbbells',machine:'Machines',smith:'Smith machine',cable:'Cables',bodyweight:'Bodyweight',band:'Bands'};
  const levels=['beginner','intermediate','advanced'];
  const groups={
    inclinePress:['Chest',['Front delts','Triceps'],'press','Set the bench to a low incline, plant your feet and draw your shoulder blades gently back.','Lower toward your upper chest with wrists over elbows, then press upward with control.','Avoid lifting your hips, bouncing or flaring your elbows straight out.'],
    chestPress:['Chest',['Front delts','Triceps'],'press','Position the handles or weights beside your chest and keep your shoulders supported.','Press smoothly, then lower until you reach a comfortable chest stretch.','Avoid shrugging, bouncing or losing wrist alignment.'],
    fly:['Chest',['Front delts'],'fly','Set a comfortable starting stretch, keep a soft elbow bend and brace your torso.','Bring your upper arms together in an arc, then open slowly.','Avoid turning the movement into a press or forcing a deep shoulder stretch.'],
    row:['Back',['Biceps','Rear delts'],'row','Brace or support your torso, with shoulders allowed to reach forward.','Pull your elbows toward your hips, pause, then let your arms extend under control.','Avoid swinging your torso or pulling your shoulders toward your ears.'],
    verticalPull:['Back',['Biceps'],'pulldown','Start with arms overhead, ribs controlled and shoulders engaged.','Pull elbows down toward your sides, then extend your arms slowly.','Avoid kicking, leaning far back or pulling behind your neck.'],
    pullover:['Back',['Triceps'],'pullover','Keep ribs down and elbows softly bent; use a comfortable overhead starting position.','Move your upper arms toward your torso without changing the elbow angle much.','Avoid arching your lower back or forcing shoulder range.'],
    squat:['Quadriceps',['Glutes','Adductors'],'squat','Place your feet at a comfortable width, brace and keep your whole foot supported.','Bend knees and hips together, lower to a controlled depth, then push the floor away.','Avoid lifting your heels, collapsing your knees inward or losing your brace.'],
    lunge:['Quadriceps',['Glutes'],'lunge','Take a stable stance with enough width for balance, and brace before descending.','Bend both knees, lower under control and drive through the working leg.','Avoid bouncing, twisting your pelvis or losing balance.'],
    hinge:['Hamstrings',['Glutes','Back'],'hinge','Brace, keep a slight knee bend and hold the load close to your legs.','Push your hips back, lower to a hamstring stretch, then extend your hips.','Avoid rounding your lower back or reaching deeper than you can control.'],
    deadlift:['Glutes',['Hamstrings','Back','Quadriceps'],'deadlift','Place the load over midfoot, brace and take the slack out before lifting.','Push the floor away and extend hips and knees together; lower with control.','Avoid jerking the load or leaning backward at lockout.'],
    hipThrust:['Glutes',['Hamstrings'],'hipThrust','Support your upper back securely, pad the load and plant your feet.','Drive through your feet until hips extend; pause and lower under control.','Avoid extending your lower back instead of your hips.'],
    kneeExtension:['Quadriceps',[],'legExtension','Align your knee with the machine pivot or anchor, and support your thighs.','Straighten your knees smoothly, pause, then lower under control.','Avoid kicking, lifting your hips or snapping your knees into lockout.'],
    legCurl:['Hamstrings',[],'legCurl','Align your knees with the pivot and place the pad or resistance near your ankles.','Bend your knees without moving your hips, then straighten slowly.','Avoid arching your back or using momentum.'],
    calfRaise:['Calves',[],'calf','Keep knees gently extended and support your balance on a stable surface.','Lower your heels into a comfortable stretch, then rise onto your toes.','Avoid bouncing or rolling onto the outside of your feet.'],
    seatedCalf:['Calves',[],'seatedCalf','Sit with knees bent, load above the knees and forefeet supported.','Lower your heels, then rise fully onto your toes with control.','Avoid bouncing or letting the load slide onto your kneecaps.'],
    lateralRaise:['Side delts',[],'lateral','Stand or sit tall, keep shoulders relaxed and elbows softly bent.','Raise your arms out and slightly forward toward shoulder height, then lower slowly.','Avoid shrugging or swinging to move the weight.'],
    rearDelt:['Rear delts',['Upper back'],'rearDelt','Support your torso or hinge at your hips, with arms in front of you.','Open your arms out with a soft elbow bend, then return slowly.','Avoid excessive shrugging or heaving your torso.'],
    facePull:['Rear delts',['Upper back'],'facePull','Set the resistance around face height and brace with shoulders relaxed.','Pull toward your face, separating your hands as your elbows move outward.','Avoid arching your back or pulling only with your wrists.'],
    overheadPress:['Front delts',['Triceps','Side delts'],'overhead','Start with resistance at shoulder height and ribs stacked over your pelvis.','Press overhead through a comfortable path, then lower slowly.','Avoid arching your lower back or forcing a painful shoulder range.'],
    uprightRow:['Side delts',['Upper traps'],'upright','Hold the resistance with a comfortable grip and relaxed shoulders.','Lead with your elbows and lift toward your lower chest, then lower slowly.','Avoid forcing your elbows high if your shoulders feel pinched.'],
    curl:['Biceps',['Forearms'],'curl','Keep your upper arms still, wrists straight and shoulders relaxed.','Bend your elbows, squeeze briefly, then straighten with control.','Avoid swinging, leaning back or moving your elbows to finish a rep.'],
    hammerCurl:['Biceps',['Brachialis','Forearms'],'curl','Hold a neutral grip with palms facing inward and upper arms still.','Bend your elbows without changing your wrist angle, then lower slowly.','Avoid swinging your torso or bending your wrists.'],
    triceps:['Triceps',[],'triceps','Hold upper arms steady, brace and set a comfortable elbow starting angle.','Straighten your elbows against resistance, then return under control.','Avoid flaring your elbows widely or moving your shoulders to shift the load.'],
    tricepsOverhead:['Triceps',[],'tricepsOverhead','Position upper arms overhead, keep ribs down and choose a comfortable shoulder angle.','Bend and straighten your elbows while keeping upper arms mostly still.','Avoid arching your back or forcing a deep elbow stretch.'],
    dip:['Triceps',['Chest','Front delts'],'dip','Support yourself on stable bars with shoulders engaged and wrists comfortable.','Bend your elbows to a comfortable depth, then press back up.','Avoid dropping into a painful shoulder range or bouncing at the bottom.'],
    crunch:['Abs',[],'crunch','Brace lightly and start with ribs above your pelvis; keep hips controlled.','Curl your ribs toward your pelvis, pause, then return slowly.','Avoid pulling with your neck or moving only at the hips.'],
    legRaise:['Abs',['Hip flexors'],'legRaise','Support yourself securely and keep shoulders engaged and ribs down.','Raise your knees or legs while curling your pelvis upward, then lower slowly.','Avoid swinging or kicking your legs.'],
    antiRotation:['Abs',['Obliques'],'antiRotation','Brace and position your torso square to the direction you want to maintain.','Hold your trunk steady while resisting rotation or extension.','Avoid holding your breath for long periods or letting your lower back sag.'],
    abduction:['Glutes',[],'abduction','Stabilize your pelvis and position resistance on the outside of your legs.','Move the working leg outward without twisting your pelvis, then return slowly.','Avoid leaning or swinging to create movement.'],
    adduction:['Adductors',[],'adduction','Stabilize your pelvis and place resistance on the inner leg.','Bring your leg toward your midline, then return with control.','Avoid rotating your trunk or forcing a wide starting stretch.'],
    shrug:['Upper traps',['Forearms'],'shrug','Stand or sit tall, holding the resistance with arms extended.','Lift your shoulders upward, pause, then lower slowly.','Avoid rolling your shoulders or jutting your head forward.']
  };
  // name | equipment | minimum technical level. Variations change support, resistance or mechanics.
  const rows={
    inclinePress:`Incline Dumbbell Press|dumbbell|intermediate
Incline Barbell Bench Press|barbell|intermediate
Incline Machine Press|machine|beginner
Incline Smith Machine Press|smith|beginner
Single-Arm Incline Dumbbell Press|dumbbell|advanced
Incline Cable Press|cable|intermediate
Incline Band Press|band|beginner
Feet-Elevated Push-Up|bodyweight|intermediate
Reverse-Grip Incline Barbell Press|barbell|advanced`,
    chestPress:`Machine Chest Press|machine|beginner
Flat Dumbbell Press|dumbbell|intermediate
Flat Barbell Bench Press|barbell|intermediate
Smith Machine Bench Press|smith|beginner
Cable Chest Press|cable|intermediate
Push-Up|bodyweight|intermediate
Incline Push-Up|bodyweight|beginner
Kneeling Push-Up|bodyweight|beginner
Band Chest Press|band|beginner
Single-Arm Machine Chest Press|machine|beginner
Dumbbell Floor Press|dumbbell|beginner
Single-Arm Dumbbell Floor Press|dumbbell|intermediate
Decline Dumbbell Press|dumbbell|intermediate
Decline Barbell Bench Press|barbell|advanced
Ring Push-Up|bodyweight|advanced
Weighted Push-Up|bodyweight|advanced`,
    fly:`Low-to-High Cable Fly|cable|intermediate
Pec Deck Fly|machine|beginner
Standing Cable Fly|cable|intermediate
High-to-Low Cable Fly|cable|intermediate
Flat Dumbbell Fly|dumbbell|intermediate
Incline Dumbbell Fly|dumbbell|intermediate
Single-Arm Cable Fly|cable|intermediate
Incline Cable Fly|cable|intermediate
Band Chest Fly|band|beginner
Supine Cable Fly|cable|intermediate
Chest-Supported Cable Fly|cable|beginner`,
    row:`Chest-Supported Row|machine|beginner
Chest-Supported T-Bar Row|machine|beginner
Chest-Supported Dumbbell Row|dumbbell|beginner
Seated Cable Row|cable|beginner
One-Arm Dumbbell Row|dumbbell|intermediate
Barbell Row|barbell|intermediate
Inverted Row|bodyweight|intermediate
Band Row|band|beginner
Single-Arm Machine Row|machine|beginner
Seal Row|barbell|intermediate
Pendlay Row|barbell|advanced
Meadows Row|barbell|advanced
Landmine Row|barbell|intermediate
Single-Arm Cable Row|cable|beginner
Humble Row|dumbbell|intermediate
Ring Row|bodyweight|intermediate
Kneeling Cable Row|cable|intermediate
Wide-Grip Seated Cable Row|cable|intermediate
Underhand Barbell Row|barbell|intermediate
Single-Arm Chest-Supported Dumbbell Row|dumbbell|beginner`,
    verticalPull:`Neutral-Grip Lat Pulldown|machine|beginner
Wide-Grip Pronated Lat Pulldown|machine|beginner
Underhand Lat Pulldown|machine|beginner
Single-Arm Lat Pulldown|cable|beginner
Half-Kneeling Single-Arm Pulldown|cable|intermediate
Pull-Up|bodyweight|intermediate
Weighted Pull-Up|bodyweight|advanced
Chin-Up|bodyweight|intermediate
Weighted Chin-Up|bodyweight|advanced
Neutral-Grip Pull-Up|bodyweight|intermediate
Assisted Pull-Up Machine|machine|beginner
Band-Assisted Pull-Up|band|beginner
Band Lat Pulldown|band|beginner
Ring Pull-Up|bodyweight|advanced
Kneeling Cable Lat Pulldown|cable|intermediate
Close-Grip Lat Pulldown|machine|beginner`,
    pullover:`Straight-Arm Pulldown|cable|beginner
Dumbbell Pullover|dumbbell|intermediate
Cable Pullover|cable|intermediate
Machine Pullover|machine|beginner
Kneeling Straight-Arm Pulldown|cable|beginner
Band Straight-Arm Pulldown|band|beginner
Single-Arm Cable Pullover|cable|intermediate
Floor Dumbbell Pullover|dumbbell|beginner`,
    squat:`Back Squat|barbell|intermediate
Front Squat|barbell|advanced
Goblet Squat|dumbbell|beginner
Dumbbell Squat|dumbbell|beginner
Smith Machine Squat|smith|beginner
Hack Squat|machine|beginner
Leg Press|machine|beginner
Bodyweight Squat|bodyweight|beginner
Pendulum Squat|machine|beginner
Belt Squat|machine|beginner
Safety-Bar Squat|barbell|intermediate
Box Squat|barbell|intermediate
Zercher Squat|barbell|advanced
Heel-Elevated Goblet Squat|dumbbell|beginner
Single-Leg Leg Press|machine|intermediate
Landmine Squat|barbell|beginner`,
    lunge:`Dumbbell Reverse Lunge|dumbbell|intermediate
Bodyweight Reverse Lunge|bodyweight|beginner
Dumbbell Split Squat|dumbbell|intermediate
Bodyweight Split Squat|bodyweight|beginner
Bulgarian Split Squat|dumbbell|intermediate
Smith Machine Split Squat|smith|beginner
Walking Dumbbell Lunge|dumbbell|intermediate
Barbell Reverse Lunge|barbell|advanced
Dumbbell Step-Up|dumbbell|intermediate
Bodyweight Step-Up|bodyweight|beginner
Deficit Reverse Lunge|dumbbell|advanced
Front-Foot-Elevated Split Squat|dumbbell|intermediate`,
    hinge:`Barbell Romanian Deadlift|barbell|intermediate
Dumbbell Romanian Deadlift|dumbbell|beginner
Smith Machine Romanian Deadlift|smith|beginner
Single-Leg Dumbbell Romanian Deadlift|dumbbell|advanced
B-Stance Dumbbell Romanian Deadlift|dumbbell|intermediate
Cable Pull-Through|cable|beginner
Band Good Morning|band|beginner
Barbell Good Morning|barbell|advanced
45-Degree Back Extension|bodyweight|beginner
Weighted Back Extension|dumbbell|intermediate
Seated Good Morning|barbell|advanced
Single-Leg Bodyweight Hip Hinge|bodyweight|beginner`,
    deadlift:`Conventional Deadlift|barbell|intermediate
Reset Deadlift|barbell|intermediate
Sumo Deadlift|barbell|intermediate
Trap-Bar Deadlift|barbell|beginner
Dumbbell Deadlift|dumbbell|beginner
Block Pull|barbell|intermediate
Deficit Deadlift|barbell|advanced
Rack Pull|barbell|intermediate`,
    hipThrust:`Barbell Hip Thrust|barbell|intermediate
Hip Thrust Machine|machine|beginner
Smith Machine Hip Thrust|smith|beginner
Dumbbell Hip Thrust|dumbbell|beginner
Bodyweight Hip Thrust|bodyweight|beginner
Single-Leg Hip Thrust|bodyweight|intermediate
Barbell Glute Bridge|barbell|beginner
Dumbbell Glute Bridge|dumbbell|beginner
Bodyweight Glute Bridge|bodyweight|beginner
Band Hip Thrust|band|beginner
B-Stance Hip Thrust|barbell|intermediate`,
    kneeExtension:`Leg Extension|machine|beginner
Single-Leg Leg Extension|machine|beginner
Cable Leg Extension|cable|intermediate
Band Leg Extension|band|beginner
Reverse Nordic Curl|bodyweight|advanced
Assisted Reverse Nordic Curl|band|intermediate
Sissy Squat Machine|machine|intermediate
Supported Sissy Squat|bodyweight|advanced`,
    legCurl:`Seated Leg Curl|machine|beginner
Lying Leg Curl|machine|beginner
Standing Single-Leg Curl|machine|beginner
Sliding Hamstring Curl|bodyweight|intermediate
Stability-Ball Hamstring Curl|bodyweight|intermediate
Band Leg Curl|band|beginner
Nordic Curl|bodyweight|advanced
Band-Assisted Nordic Curl|band|intermediate
Cable Leg Curl|cable|intermediate
Single-Leg Seated Leg Curl|machine|beginner
Single-Leg Lying Leg Curl|machine|beginner`,
    calfRaise:`Standing Calf Raise|machine|beginner
Leg Press Calf Raise|machine|beginner
Single-Leg Calf Raise|bodyweight|beginner
Dumbbell Standing Calf Raise|dumbbell|beginner
Barbell Calf Raise|barbell|intermediate
Smith Machine Calf Raise|smith|beginner
Band Calf Raise|band|beginner
Donkey Calf Raise Machine|machine|beginner
Single-Leg Dumbbell Calf Raise|dumbbell|intermediate`,
    seatedCalf:`Seated Calf Raise|machine|beginner
Seated Dumbbell Calf Raise|dumbbell|beginner
Seated Barbell Calf Raise|barbell|intermediate
Seated Smith Machine Calf Raise|smith|beginner
Seated Band Calf Raise|band|beginner
Single-Leg Seated Calf Raise|machine|beginner`,
    lateralRaise:`Cable Lateral Raise|cable|beginner
Dumbbell Lateral Raise|dumbbell|beginner
Machine Lateral Raise|machine|beginner
Cable Lateral Raise Behind Body|cable|intermediate
Seated Dumbbell Lateral Raise|dumbbell|beginner
Leaning Cable Lateral Raise|cable|intermediate
Single-Arm Dumbbell Lateral Raise|dumbbell|beginner
Band Lateral Raise|band|beginner
Lying Dumbbell Lateral Raise|dumbbell|intermediate
Chest-Supported Dumbbell Lateral Raise|dumbbell|intermediate`,
    rearDelt:`Reverse Pec Deck|machine|beginner
Cable Rear-Delt Fly|cable|intermediate
Dumbbell Rear-Delt Raise|dumbbell|intermediate
Chest-Supported Rear-Delt Raise|dumbbell|beginner
Band Pull-Apart|band|beginner
Single-Arm Cable Rear-Delt Fly|cable|intermediate
Prone Rear-Delt Raise|dumbbell|beginner
Seated Bent-Over Rear-Delt Raise|dumbbell|intermediate`,
    facePull:`Rope Face Pull|cable|beginner
Seated Cable Face Pull|cable|beginner
Half-Kneeling Cable Face Pull|cable|intermediate
Band Face Pull|band|beginner
Single-Arm Cable Face Pull|cable|intermediate
Supine Cable Face Pull|cable|intermediate
High-Pulley Rope Face Pull|cable|beginner`,
    overheadPress:`Dumbbell Arnold Press|dumbbell|intermediate
Seated Dumbbell Shoulder Press|dumbbell|beginner
Barbell Overhead Press|barbell|intermediate
Machine Shoulder Press|machine|beginner
Single-Arm Cable Shoulder Press|cable|intermediate
Pike Push-Up|bodyweight|advanced
Seated Smith Machine Shoulder Press|smith|beginner
Half-Kneeling Landmine Press|barbell|beginner
Standing Dumbbell Shoulder Press|dumbbell|intermediate
Band Overhead Press|band|beginner
Single-Arm Dumbbell Shoulder Press|dumbbell|intermediate`,
    uprightRow:`Cable Rope Upright Row|cable|intermediate
Dumbbell Upright Row|dumbbell|intermediate
Wide-Grip Barbell Upright Row|barbell|intermediate
Wide-Grip Cable Upright Row|cable|intermediate
Band Upright Row|band|intermediate
Smith Machine Upright Row|smith|intermediate
Single-Arm Cable Upright Row|cable|intermediate`,
    curl:`Preacher Curl Machine|machine|beginner
Bayesian Cable Curl|cable|intermediate
Cable Curl|cable|beginner
Incline Dumbbell Curl|dumbbell|intermediate
EZ-Bar Curl|barbell|beginner
Band Curl|band|beginner
Concentration Curl|dumbbell|beginner
Machine Curl|machine|beginner
Standing Dumbbell Curl|dumbbell|beginner
Barbell Curl|barbell|intermediate
Dumbbell Preacher Curl|dumbbell|beginner
Spider Curl|dumbbell|intermediate
High Cable Curl|cable|intermediate
Seated Dumbbell Curl|dumbbell|beginner
Single-Arm Cable Curl|cable|beginner
EZ-Bar Preacher Curl|barbell|intermediate`,
    hammerCurl:`Hammer Curl|dumbbell|beginner
Rope Hammer Curl|cable|beginner
Cross-Body Hammer Curl|dumbbell|beginner
Incline Hammer Curl|dumbbell|intermediate
Band Hammer Curl|band|beginner
Preacher Hammer Curl|dumbbell|beginner
Seated Hammer Curl|dumbbell|beginner`,
    triceps:`Rope Pushdown|cable|beginner
Single-Arm Cable Triceps Extension|cable|beginner
Single-Arm Cable Pushdown|cable|beginner
Straight-Bar Pushdown|cable|beginner
V-Bar Pushdown|cable|beginner
Band Pushdown|band|beginner
Machine Triceps Extension|machine|beginner
Reverse-Grip Cable Pushdown|cable|intermediate
EZ-Bar Skull Crusher|barbell|intermediate
Dumbbell Skull Crusher|dumbbell|intermediate
Cable Skull Crusher|cable|intermediate
Dumbbell Triceps Kickback|dumbbell|beginner
Cable Triceps Kickback|cable|beginner`,
    tricepsOverhead:`Overhead Cable Extension|cable|intermediate
Dumbbell Overhead Extension|dumbbell|intermediate
Single-Arm Dumbbell Overhead Extension|dumbbell|intermediate
Single-Arm Overhead Cable Extension|cable|intermediate
Band Overhead Triceps Extension|band|beginner
EZ-Bar Overhead Triceps Extension|barbell|intermediate
Seated Cable Overhead Extension|cable|intermediate`,
    dip:`Parallel-Bar Dip|bodyweight|intermediate
Weighted Dips|bodyweight|advanced
Assisted Dip Machine|machine|beginner
Band-Assisted Dip|band|beginner
Ring Dip|bodyweight|advanced
Weighted Ring Dip|bodyweight|advanced
Straight-Bar Dip|bodyweight|advanced`,
    crunch:`Cable Crunch|cable|beginner
Ab Crunch Machine|machine|beginner
Floor Crunch|bodyweight|beginner
Band Crunch|band|beginner
Decline Crunch|bodyweight|intermediate
Weighted Crunch|dumbbell|intermediate
Kneeling Cable Crunch|cable|beginner
Stability-Ball Crunch|bodyweight|intermediate
Seated Cable Crunch|cable|intermediate`,
    legRaise:`Hanging Leg Raise|bodyweight|advanced
Weighted Hanging Leg Raise|bodyweight|advanced
Hanging Knee Raise|bodyweight|intermediate
Captain's-Chair Knee Raise|machine|beginner
Lying Leg Raise|bodyweight|beginner
Reverse Crunch|bodyweight|beginner
Incline Bench Leg Raise|bodyweight|intermediate
Cable Reverse Crunch|cable|intermediate
Captain's-Chair Leg Raise|machine|intermediate`,
    antiRotation:`Pallof Press|cable|beginner
Band Pallof Press|band|beginner
Half-Kneeling Pallof Press|cable|intermediate
Plank|bodyweight|beginner
Side Plank|bodyweight|intermediate
Dead Bug|bodyweight|beginner
Bird Dog|bodyweight|beginner
Ab Wheel Rollout|bodyweight|advanced
Dumbbell Suitcase Carry|dumbbell|intermediate
Farmer's Carry|dumbbell|intermediate`,
    abduction:`Hip Abduction Machine|machine|beginner
Standing Cable Hip Abduction|cable|beginner
Standing Band Hip Abduction|band|beginner
Side-Lying Hip Abduction|bodyweight|beginner
Band Clamshell|band|beginner
Lateral Band Walk|band|beginner
Side-Lying Cable Hip Abduction|cable|intermediate`,
    adduction:`Hip Adduction Machine|machine|beginner
Standing Cable Hip Adduction|cable|beginner
Standing Band Hip Adduction|band|beginner
Side-Lying Hip Adduction|bodyweight|beginner
Copenhagen Plank|bodyweight|advanced
Short-Lever Copenhagen Plank|bodyweight|intermediate
Side-Lying Cable Hip Adduction|cable|intermediate`,
    shrug:`Dumbbell Shrug|dumbbell|beginner
Barbell Shrug|barbell|beginner
Smith Machine Shrug|smith|beginner
Cable Shrug|cable|beginner
Machine Shrug|machine|beginner
Seated Dumbbell Shrug|dumbbell|beginner
Trap-Bar Shrug|barbell|beginner
Chest-Supported Dumbbell Shrug|dumbbell|intermediate`
  };
  const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const aliases={'Hip thrust':'Barbell Hip Thrust','Hip Thrust':'Barbell Hip Thrust','Romanian Deadlift':'Barbell Romanian Deadlift','Low-to-High Cable Flye':'Low-to-High Cable Fly','Rear Delt Fly Machine':'Reverse Pec Deck','Face Pull':'Rope Face Pull','Preacher Curl':'Preacher Curl Machine','Neutral-Grip Pulldown':'Neutral-Grip Lat Pulldown','Straight-Arm Pullover':'Straight-Arm Pulldown','Weighted Cable Crunch':'Cable Crunch','Tricep Pressdown':'Rope Pushdown','Supinated EZ Bar Curl':'EZ-Bar Curl','EZ Bar Skull Crusher':'EZ-Bar Skull Crusher','Bodyweight Dips':'Parallel-Bar Dip','Assisted Dips':'Assisted Dip Machine','Cable lateral raise':'Cable Lateral Raise'};
  function instructions(name,equipment,pattern){
    const g=groups[pattern];let setup=g[3],movement=g[4],avoid=g[5];
    if(/single-arm|one-arm/i.test(name))setup+=' Work one side at a time and keep your torso square.';
    if(/single-leg/i.test(name))setup+=' Train one leg at a time and use support for balance if needed.';
    if(/seated/i.test(name))setup+=' Adjust the seat so you can maintain the starting position without reaching.';
    if(/chest-supported|seal row|humble row/i.test(name))setup+=' Keep your chest on the pad throughout the set.';
    if(equipment==='cable')setup+=' Check the pulley height and attachment before loading.';
    if(equipment==='smith')setup+=' Set the safety stops before you begin.';
    if(equipment==='band')setup+=' Use a secure anchor and inspect the band.';
    if(/pull-up|chin-up/i.test(name)){setup='Hang from a secure bar with shoulders engaged and a comfortable '+(/chin/i.test(name)?'palms-toward-you':'overhand or neutral')+' grip.';movement='Pull elbows down until your upper chest approaches the bar, then lower with control.';}
    if(/push-up/i.test(name)){setup='Place hands slightly wider than shoulders and brace from shoulders to knees or heels.';movement='Lower your chest toward the support, then press away while keeping your body aligned.';avoid='Avoid sagging your hips, jutting your head or bouncing.';}
    if(/leg press/i.test(name)){setup='Adjust the backrest and place feet on the platform with hips supported.';movement='Bend knees to a depth you can control without your pelvis rolling, then press the platform away.';avoid='Avoid lifting your hips or snapping your knees into lockout.';}
    if(/skull crusher/i.test(name)){setup='Lie on a stable bench with upper arms angled slightly behind vertical and wrists straight.';movement='Bend elbows to lower the resistance beside or behind your forehead, then extend elbows smoothly.';}
    if(/kickback/i.test(name)){setup='Hinge and brace your torso, keeping the working upper arm beside it.';movement='Straighten your elbow without moving your upper arm, then bend it slowly.';}
    if(/nordic/i.test(name)&&pattern==='legCurl'){setup='Kneel on padding with ankles secured and hips extended; use assistance if needed.';movement='Lower your whole body forward by straightening your knees, then return with assistance as needed.';avoid='Avoid bending at the hips or dropping without control.';}
    if(/reverse nordic/i.test(name)){setup='Kneel on padding, keep hips extended and brace your trunk.';movement='Lean your body backward as one unit, then use your thighs to return to upright.';avoid='Use a comfortable range; avoid bending your hips or forcing knee discomfort.';}
    if(/step-up/i.test(name)){setup='Place your entire working foot on a stable box of a comfortable height.';movement='Push through the elevated foot to stand on the box, then lower slowly.';avoid='Avoid jumping off the trailing foot or using an excessively high box.';}
    if(/back extension/i.test(name)){setup='Set the hip pad below the hip crease, anchor your feet and brace.';movement='Hinge at the hips, then extend until your body forms a straight line.';avoid='Avoid hyperextending your lower back at the top.';}
    if(pattern==='antiRotation'){
      if(/pallof/i.test(name)){setup='Stand or kneel sideways to a secure anchor, holding the handle at your chest.';movement='Press your hands forward, resist rotation, then return to your chest.';}
      else if(/carry/i.test(name)){setup='Stand tall with the load beside your body; clear a walking path.';movement='Walk slowly while keeping your ribs over your pelvis and shoulders level.';avoid='Avoid leaning toward the load or rushing your steps.';}
      else if(/dead bug/i.test(name)){setup='Lie on your back with knees above hips and hands above shoulders.';movement='Extend opposite arm and leg while keeping your lower back gently supported, then alternate.';}
      else if(/bird dog/i.test(name)){setup='Start on hands and knees with a neutral spine.';movement='Reach opposite arm and leg away without twisting your pelvis, then alternate.';}
      else if(/rollout/i.test(name)){setup='Kneel on padding and brace with hands on the wheel.';movement='Roll forward only as far as you can keep your trunk controlled, then return.';}
      else {setup=/side/i.test(name)?'Support yourself on one forearm with elbow under shoulder and legs stacked.':'Support yourself on forearms with elbows under shoulders and legs extended.';movement='Hold a straight, braced body position while breathing normally.';}
    }
    if(/copenhagen/i.test(name)){setup='Lie on your side with the upper leg supported on a stable bench, using the knee for the short-lever version.';movement='Lift your hips and hold your body aligned while pressing the supported leg into the bench.';avoid='Avoid dropping your pelvis or forcing groin discomfort.';}
    return {setup,movement,avoid};
  }
  const exercises=Object.entries(rows).flatMap(([pattern,text])=>text.split('\n').map(line=>{const [name,equipment,level]=line.split('|'),g=groups[pattern],timed=/plank|carry/i.test(name),guide=instructions(name,equipment,pattern);return {id:slug(name),name,equipment,level,pattern,movement:g[2],primary:[g[0]],secondary:g[1],guide,illustration:{profile:g[2],variant:slug(name)},unit:timed?'seconds':'reps'};}));
  const byId=Object.fromEntries(exercises.map(e=>[e.id,e]));const byName=Object.fromEntries(exercises.map(e=>[e.name.toLowerCase(),e]));
  const find=value=>byId[value]||byName[String(aliases[value]||value||'').toLowerCase()]||null;
  function alternatives(e,level='beginner'){const item=find(e.catalogId)||find(e.name);if(!item)return [];return exercises.filter(x=>x.pattern===item.pattern&&x.id!==item.id).sort((a,b)=>Math.max(0,levels.indexOf(a.level)-levels.indexOf(level||'beginner'))-Math.max(0,levels.indexOf(b.level)-levels.indexOf(level||'beginner'))||levels.indexOf(a.level)-levels.indexOf(b.level));}
  return {exercises,byId,find,alternatives,groups,equipmentLabels,levels};
})();
