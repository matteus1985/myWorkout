LIFT LOG — IPHONE WORKOUT APP

The app is entirely in English. It saves entries on the device and includes an offline cache and manual backup/restore.

IMPORTANT: An interactive iPhone home-screen app needs to be served from an HTTPS website. A file saved in Google Drive does not itself provide the working app link, and opening an HTML preview from Drive is not a reliable way to run it.

Once this folder is hosted at an HTTPS address:
1. Open the link in Safari on your iPhone while online.
2. Tap Share, then Add to Home Screen, then Add.
3. Open Lift Log from the new icon. The app can then load offline after the first successful visit.
4. In Settings, tap Export Backup. In the share menu choose Save to Files, then select your Google Drive folder and tap Save. Do this regularly. If the share menu does not appear, find the downloaded JSON file in Files and move it to Google Drive.
5. To restore, download the JSON backup from Drive to Files, open Lift Log > Settings > Import Backup, and choose the downloaded file.

The workout log is stored in Safari's local storage on that iPhone. A backup is needed to recover it if website data is cleared or you move to another phone.

This folder contains the site files: index.html, manifest.json, sw.js, and icon.svg. Upload the contents of this folder to an HTTPS static web host; do not upload just index.html if you want the install/offline features.
