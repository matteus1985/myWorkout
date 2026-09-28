LIFT LOG — IPHONE WORKOUT APP

The app is entirely in English. It saves entries on the device and includes an offline cache and manual backup/restore.

In Settings, choose 3, 4, 5 or 6 workouts per week and tick the equipment you have. Tap Update plan to reorganize the current week. Earlier workout logs remain in Progress and backups. Session times are estimates and the generated sessions stay under 90 minutes; there is no minimum duration to fill. Bodyweight pulling exercises require a secure bar.

Each exercise has an (i) button with a short technique guide and an original, lightweight movement GIF. The GIF is a simple movement cue, not a substitute for a coach checking your form. The Alternatives menu contains at least seven variants per movement family. Variants that need equipment you did not select are shown as unavailable.

IMPORTANT: An interactive iPhone home-screen app needs to be served from an HTTPS website. A file saved in Google Drive does not itself provide the working app link, and opening an HTML preview from Drive is not a reliable way to run it.

Once this folder is hosted at an HTTPS address:
1. Open the link in Safari on your iPhone while online.
2. Tap Share, then Add to Home Screen, then Add.
3. Open Lift Log from the new icon. The app can then load offline after the first successful visit.
4. In Settings, tap Export Backup. In the share menu choose Save to Files, then select your Google Drive folder and tap Save. Do this regularly. If the share menu does not appear, find the downloaded JSON file in Files and move it to Google Drive.
5. To restore, download the JSON backup from Drive to Files, open Lift Log > Settings > Import Backup, and choose the downloaded file.

The workout log is stored in Safari's local storage on that iPhone. A backup is needed to recover it if website data is cleared or you move to another phone.

This folder contains the site files: index.html, exercise-data.js, manifest.json, sw.js, icon.svg, and the media folder. Upload the contents of this folder to an HTTPS static web host; do not upload just index.html if you want the exercise guides and offline features. The optional generate-gifs.js file is the source for the original GIF assets.

Training logic follows gradual resistance training progression: completed reps are logged, the next target rises within the planned rep range, and a small load increase is suggested only after all sets reach the top of the range. Reference: American College of Sports Medicine, Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults (2026), https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
