/* Corrections for extension exercises whose first-pass media match used the wrong movement. */
(() => {
  const sourceByExercise = {
    // Chest and back
    'incline-band-press': '1254',
    'feet-elevated-push-up': '0662',
    'pec-deck-fly': '0596',
    'band-chest-fly': '1262',
    'machine-chest-press': '0577',
    'smith-machine-bench-press': '0748',
    'chest-supported-row': '0327',
    'seal-row': '0049',
    'single-arm-machine-row': '1360',
    'ring-row': '0498',
    'single-arm-lat-pulldown': '3563',
    'half-kneeling-single-arm-pulldown': '3563',
    'straight-arm-pulldown': '0238',
    'kneeling-straight-arm-pulldown': '0238',
    'band-straight-arm-pulldown': '0238',
    'floor-dumbbell-pullover': '0375',

    // Squat and lunge patterns
    'leg-press': '0739',
    'hack-squat': '0743',
    'pendulum-squat': '0743',
    'belt-squat': '0743',
    'single-leg-leg-press': '1425',
    'bodyweight-step-up': '1684',
    'deficit-reverse-lunge': '0381',
    'barbell-reverse-lunge': '0078',
    'bodyweight-reverse-lunge': '0381',

    // Hip hinge and glute exercises
    '45-degree-back-extension': '0573',
    'weighted-back-extension': '0573',
    'single-leg-bodyweight-hip-hinge': '1757',
    'band-good-morning': '0980',
    'cable-pull-through': '0196',
    'barbell-hip-thrust': '3562',
    'hip-thrust-machine': '2286',
    'smith-machine-hip-thrust': '0756',
    'dumbbell-hip-thrust': '3523',
    'bodyweight-hip-thrust': '3523',
    'single-leg-hip-thrust': '3561',
    'dumbbell-glute-bridge': '3523',

    // Knee flexion and extension; calves
    'reverse-nordic-curl': '1489',
    'assisted-reverse-nordic-curl': '1489',
    'sissy-squat-machine': '1489',
    'sliding-hamstring-curl': '0496',
    'band-leg-curl': '0496',
    'stability-ball-hamstring-curl': '0586',
    'nordic-curl': '0697',
    'band-assisted-nordic-curl': '0697',
    'seated-smith-machine-calf-raise': '1395',
    'seated-band-calf-raise': '1369',

    // Delts and arms
    'cable-rear-delt-fly': '0225',
    'cable-rope-upright-row': '0246',
    'pike-push-up': '3662',
    'half-kneeling-landmine-press': '1457',
    'band-upright-row': '0120',
    'concentration-curl': '0297',
    'spider-curl': '0454',
    'dumbbell-skull-crusher': '0351',
    'cable-skull-crusher': '0186',
    'dumbbell-overhead-extension': '2188',
    'single-arm-dumbbell-overhead-extension': '2188',
    'band-overhead-triceps-extension': '0998',
    'parallel-bar-dip': '2363',
    'ring-dip': '0677',
    'weighted-ring-dip': '0677',
    'straight-bar-dip': '2462',

    // Core and carries
    'stability-ball-crunch': '2297',
    'lying-leg-raise': '0620',
    'plank': '0464',
    'ab-wheel-rollout': '0857',
    'dumbbell-suitcase-carry': '2133',
    'farmer-s-carry': '2133',
    'pallof-press': '0979',
    'half-kneeling-pallof-press': '0979',

    // Hip abduction and adduction; traps
    'standing-cable-hip-abduction': '0710',
    'band-clamshell': '3006',
    'lateral-band-walk': '0628',
    'standing-band-hip-adduction': '0168',
    'trap-bar-shrug': '0095',

    // Exact matches from the local RepDB set
    'smith-machine-squat': '0770',
    'bodyweight-glute-bridge': '3013',
    'single-leg-calf-raise': '1387',
    'band-calf-raise': '1369',
    'smith-machine-calf-raise': '0773',
    'neutral-grip-lat-pulldown': '0818',
    'dumbbell-reverse-lunge': '0381',
    'bodyweight-split-squat': '2368',
    'chest-supported-dumbbell-row': '0327',
    'single-arm-chest-supported-dumbbell-row': '1330',
    'seated-cable-row': '0180',
    'dumbbell-triceps-kickback': '0333',
    'cable-triceps-kickback': '0860',
    'weighted-dips': '1767',
    'band-crunch': '1005',
    'captain-s-chair-leg-raise': '2963'
  };
  const customMediaByExercise = {
    'bird-dog': {
      image: 'data/exercises/images/bird-dog.svg',
      animation: 'data/exercises/images/bird-dog.svg'
    }
  };

  const catalogue = window.LIFT_CATALOGUE;
  const originalGifs = window.LIFT_EXERCISE_GIFS || {};
  const originalArt = window.LIFT_REPDB_ART || {};
  if (!catalogue?.byId) return;

  const retiredIds = new Set(window.LIFT_RETIRED_EXERCISES || []);
  const gifs = { ...originalGifs };
  const art = { ...originalArt };
  const sourceByDatasetId = new Map(catalogue.exercises.filter(exercise => exercise.datasetId).map(exercise => [exercise.datasetId, exercise]));
  const errors = [];

  const activeOverrides = Object.fromEntries(Object.entries(sourceByExercise).filter(([exerciseId]) => !retiredIds.has(exerciseId)));
  window.LIFT_EXERCISE_MEDIA_OVERRIDES = Object.freeze(activeOverrides);

  for (const [exerciseId, datasetId] of Object.entries(activeOverrides)) {
    const target = catalogue.byId[exerciseId];
    const source = sourceByDatasetId.get(datasetId);
    if (!target || target.source !== 'local-extension' || !source?.animation || !source?.image) {
      errors.push(`${exerciseId} → dataset-${datasetId}`);
      continue;
    }
    gifs[exerciseId] = source.animation;
    art[exerciseId] = source.image;
  }

  for (const [exerciseId, media] of Object.entries(customMediaByExercise)) {
    if (!catalogue.byId[exerciseId] || !media.image || !media.animation) {
      errors.push(`${exerciseId} → custom media`);
      continue;
    }
    gifs[exerciseId] = media.animation;
    art[exerciseId] = media.image;
  }

  for (const exerciseId of retiredIds) {
    delete gifs[exerciseId];
    delete art[exerciseId];
  }

  window.LIFT_EXERCISE_GIFS = Object.freeze(gifs);
  window.LIFT_REPDB_ART = Object.freeze(art);
  if (errors.length) console.error('Exercise media overrides could not be applied:', errors);
})();
