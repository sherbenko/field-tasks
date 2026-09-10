# Verification record

Candidate code: **SA-RN-7842**

Environment: macOS ARM64, Node 22.22.3, Java 17, Android API 34 ARM64 emulator (1440×2560, density 560). The application was installed from a release APK and launched without Metro.

## Automated checks

- TypeScript strict check passed.
- Six focused tests passed: required fields/coordinates, future due dates, deletion retries, in-flight edits, deterministic conflict ties, and task filtering.
- Mock HTTP `/health` returned the candidate code.
- `/sync` accepted a valid empty payload and rejected an invalid payload with a validation error.
- Release Gradle build completed successfully, including its required Android release checks.

## Release APK checks

- Installation and cold launch succeeded.
- Missing title/description/address/coordinates prevented saving and showed field-specific messages.
- Task creation with due date, saved location and image succeeded.
- The server received task metadata and creation/attachment history.
- A status change while offline persisted after force-stop and relaunch.
- The attached image remained visible after offline relaunch.
- Restoring connectivity synchronized the pending status change to the mock server.
- Completed status was retained locally and on the server.
- Map tiles, multiple markers, marker popup and navigation to task details worked.
- Light/dark theme switching and the visible candidate code worked; theme persisted after restart.
- A local demo notification was delivered and its tap opened the corresponding task.
- Android's default inexact scheduling delayed the initial notification test; the app now provides a direct Alarms & reminders permission action. The action was tested and the permission enabled for subsequent demo recording.

The initial APK exposed an incompatible transitive `expo-font` version. Pinning `expo-font` to the SDK 55 version fixed the launch crash; subsequent release installations launched successfully. The map also uses a local ready handshake so marker injection does not wait for remote tiles, and a completed tile load does not unnecessarily rebuild markers.

## Limits of verification

One Android emulator was used. Physical OEM devices, iOS, long-duration battery/Doze behavior and multi-device binary attachment transfer were not tested. Image bytes are intentionally not synchronized. A 45-second notification demo is used instead of waiting through a full 30-minute reminder interval.

The final offline recording also verified creation without Wi-Fi/mobile data, persistence after force-stop/relaunch, deletion with confirmation, retained deletion history, and synchronization after reconnecting. Settings showed zero pending task changes; the mock data file contained the deletion tombstones and their history events.

## Deliverables

- `artifacts/FieldTasks-SA-RN-7842.apk`: ARM64 release APK used for the final recordings.
- APK SHA-256: `7839f4f80d0edf8be423c07fc185ce184d29c0b12460f9ef9fc2ab18f68c39a4`.
- `artifacts/FieldTasks-SA-RN-7842-demo.mp4`: captioned demonstration of the installed APK, followed by an explanation using actual storage and sync source excerpts. Creation and offline sections play at 1.2×; the notification section remains at real-time speed. No voiceover is included.
- `artifacts/FieldTasks-SA-RN-7842-source.zip`: source package excluding dependencies, generated native projects, local server data and binaries.

The public repository is https://github.com/sherbenko/field-tasks; APK and video downloads are provided through its v1.0.0 release. Google Drive uploads and submission email sending have not been performed. Personal details and CV must be supplied by the candidate.
