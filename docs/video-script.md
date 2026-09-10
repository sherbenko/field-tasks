# Video demonstration — SA-RN-7842

Target length: 4 minutes 30 seconds. Record the installed release APK, not an Expo development screen. Keep the mock server running except during the failure demonstration. Use English captions or narration. Show the candidate code clearly.

| Time | On-screen action and suggested narration |
| --- | --- |
| 00:00–00:15 | Open the installed Field Tasks app. Open Settings and show **SA-RN-7842**. “This is my Field Tasks submission, built with React Native and Expo.” |
| 00:15–00:40 | Tasks → Create task → Save with missing fields. Show required-field messages. Enter title “Inspect ventilation system” and description “Check airflow, replace filter and photograph the unit.” |
| 00:40–01:10 | Choose a future due date/time, saved location, edit the manual address if desired, attach an image and save. Show complete task details and the image. |
| 01:10–01:25 | Use “Enable precise reminders”, allow Alarms & reminders, return, then trigger “Notify me in 45 seconds”. Continue demonstrating while the notification is pending. |
| 01:25–01:50 | Return to list. Switch Date added/Due date/Status sorting. Search title. Open Map, tap the marker, and use Open task. |
| 01:50–02:15 | Background the app. Show the notification banner/tray and tap it to open the task. Edit a detail, update status to In progress, then Completed; show it remains in the list. |
| 02:15–02:50 | Disable Wi-Fi and mobile data. Create a second task “Offline site visit”. Show pending sync. Close/reopen the app and show the task still exists. Delete that task offline and confirm. |
| 02:50–03:15 | Restore network. Show Settings → Sync now and synced status. Briefly show `GET /tasks` / mock server console with the deletion tombstone. |
| 03:15–03:35 | Open History with timestamps, creation, edits, status changes, attachments, deletion and sync events. Toggle dark theme and return to Tasks. |
| 03:35–04:20 | Show `src/services/syncService.ts`, `src/services/database.ts` and `src/utils/syncMerge.ts`. Explain local-first commit, persistent queue, idempotent retries, tombstones and preservation of edits made during a request. Use `docs/code-walkthrough.md` as preparation. |
| 04:20–04:30 | Show candidate code again. Mention map tiles need network and images are local; close with repository/APK availability. |

Before sharing: verify 2–5 minutes, readable text, candidate code visible, and unrestricted video access in a private/incognito browser. Do not speed up the 45-second notification demonstration in a way that conceals the actual flow; use that waiting time for other features.
