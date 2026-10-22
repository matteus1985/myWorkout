LIFT LOG — IPHONE WORKOUT APP

Lift Log is an English workout tracker with a dark red interface. It stores workout history in the browser on this device and works offline after the first successful visit.

GET STARTED ON IPHONE
1. Open https://matteus1985.github.io/myWorkout/ in Safari while online.
2. Tap Share, then Add to Home Screen, then Add.
3. Open Lift Log from the new Home Screen icon.
4. In Settings, choose your experience, weekly schedule and available equipment.

NUTRITION
The Nutrition tab includes an offline food list, editable serving sizes, custom foods, calorie/macronutrient totals, a gradual body-weight goal estimate, and weekly average-weight check-ins. If you configure the optional Cloudflare Worker, Llama 4 Scout can suggest visible foods, portions, calories and macros from a photo. These are approximate AI estimates, not verified label data or medical advice; review and correct every item before saving. Manual food search continues to work offline.

OPTIONAL AI FOOD PHOTO SETUP
1. Open Settings > AI food photo setup. Use Show setup steps for the guided Cloudflare configuration.
2. Deploy the included worker/src/index.mjs Worker with the Workers AI binding named AI.
3. Generate a private code in Lift Log, set it as the Worker secret APP_TOKEN in Cloudflare, then enter the Worker HTTPS address and save/test the connection in Lift Log.
4. The private code is stored separately on this device and is not included in app backups. Never publish it or paste it into app source files.
5. Taking or selecting a photo starts analysis and sends it to your Worker. The Worker does not intentionally log or store photos, prompts or results; Cloudflare describes its standard inference as zero-retention. Photos saved with a meal remain on this device and are excluded from backups.
6. Cloudflare Workers AI has a daily free allowance that may change. Lift Log does not enable automatic paid usage; photo analysis can stop when a limit or service issue is reached. Check Cloudflare's current terms and quota before use.

Food diary entries, profile information, custom foods and weight check-ins are part of Export Backup. Meal photo files stay in local browser storage and are deliberately excluded from backups; they cannot be recovered from a backup after clearing this iPhone's website data or moving to another device.

The app offers adaptive 3–6 day plans. Settings include experience, equipment and up to two priority muscle groups. Workout targets use completed sets in your history, and new exercises show a logged or estimated starting load. End week reviews missed sessions and prepares the next week's targets. Exercise guides contain short form instructions and RepDB illustrations, available offline.

IMAGE CREDIT
Exercise data by RepDB (https://repdb.co). The bundled free-tier illustrations are used inside this app under the RepDB in-app license: https://github.com/RepDB/exercise-dataset/blob/main/LICENSE-DATA.md

BACK UP YOUR RECORDS
Workout history is saved on this iPhone. In Settings, tap Export Backup and save the JSON file in Google Drive or Files regularly. To restore, download the backup to the iPhone, tap Import Backup, and choose the file. A backup helps recover records if Safari data is cleared or you switch phones.

ABOUT THE TRAINING TARGETS
Adaptive plans use three working sets by default, usually 6–12 repetitions for compound lifts and 10–20 for accessories, with longer rests for heavier compound work. Optional drop sets may be offered for a suitable cable or machine accessory in a shorter session. The app suggests gradual rep increases and only suggests a load increase when logged performance meets the progression rule. These are general training guidelines; choose loads and exercises you can perform with controlled, comfortable technique.

FILES
Keep index.html, app.js, catalogue.js, planner.js, sketches.js, exercise-art.js, nutrition.js, nutrition-data.js, material.css, manifest.json, sw.js, icon.svg, worker/wrangler.toml, worker/src/index.mjs, media/repdb and media/exercises together when hosting the app. The folder contains locally bundled WebP illustrations and preserved SVG exercise sketches. The service worker caches the RepDB illustrations in small groups after the first online visit and shows progress in Settings. Keep these files available at the same paths for offline use.
