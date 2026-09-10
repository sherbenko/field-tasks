# Field Tasks

An Android app for technicians to plan and track work outside the office. Built specifically for the Sales Automators React Native assignment.

**Candidate code: SA-RN-7842** — visible in Settings and required in the video.

## Download and demo

- [Installable Android ARM64 APK](https://github.com/sherbenko/field-tasks/releases/download/v1.0.0/FieldTasks-SA-RN-7842.apk)
- [Video demonstration — 4 minutes 38 seconds](https://github.com/sherbenko/field-tasks/releases/download/v1.0.0/FieldTasks-SA-RN-7842-demo.mp4)
- [Release notes and downloads](https://github.com/sherbenko/field-tasks/releases/tag/v1.0.0)

These downloads are public. The assignment specifically requests a Google Drive video link, so also upload the video there before submitting.

## Features

- Create, edit and delete tasks with validated title, description, due date, manual address, coordinates and images.
- Four statuses: New, In progress, Completed and Cancelled. Terminal tasks stay visible.
- Search by title/address, status filters, and sorting by date added, due date or status.
- Task details with image previews and a task-specific history. Global History also keeps deletion and sync events.
- SQLite persistence: tasks and audit events are written in one transaction before synchronization.
- Offline CRUD, persistent pending/failed sync states, automatic retry on connectivity restoration, app foreground and every 30 seconds while active.
- Interactive Leaflet/OpenStreetMap map with selectable task markers; no API key required.
- Local reminders, a 45-second notification demo and notification tap navigation.
- Persistent light/dark theme toggle and candidate code in Settings.

## Requirements and installation

- Node **22.22.3** (see `.nvmrc`), npm, Java 17 and Android SDK for local APK builds.
- Android phone or emulator. The submitted arm64 APK targets modern ARM64 Android devices.

```sh
nvm use
npm ci
npm run server
```

In a second terminal:

```sh
npm start
```

Expo Go can be used for development, but the release APK is the submission artifact and runs independently of Metro. This implementation targets Android; the native date/time picker UI has not been implemented for iOS.

## APK

The locally prepared deliverable is placed in `artifacts/FieldTasks-SA-RN-7842.apk` after a successful release build. The artifacts directory is intentionally excluded from source control; attach the APK to the submission or upload it with unrestricted access.

Local build:

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk" # adapt to your machine
EXPO_NO_GIT_STATUS=1 npx expo prebuild --platform android --no-install
cd android
./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Output: `android/app/build/outputs/apk/release/app-release.apk`.

Omit the architecture flag for all configured ABIs, or use `-PreactNativeArchitectures=arm64-v8a,x86_64` for an ARM64 phone plus an Intel emulator. Expo's generated local release configuration uses its debug signing key; this is suitable for this installable test submission, not a Play Store release. The app bundles JavaScript and assets and does not require a development server.

Alternative cloud build after linking your own Expo account/project:

```sh
npx eas-cli build --platform android --profile preview
```

## Mock REST server

```sh
npm run server
```

The server listens on `0.0.0.0:3001`. On first run, it copies `server/sample-data.json` into the ignored `server/data.json`. The sample is intentionally an empty workspace, allowing reviewers to test the empty state and create their own tasks. Task changes and audit entries subsequently persist across server restarts. For an optional populated dataset, copy `server/example-data.json` to a separate writable file and start with `MOCK_DATA_FILE=/path/to/your-copy.json npm run server`; it contains two example tasks and history events.

| Endpoint | Behavior |
| --- | --- |
| `GET /health` | Server health and candidate code |
| `GET /tasks` | Stored tasks, including deletion tombstones |
| `GET /history` | Stored audit events |
| `POST /sync` | Validate and merge `{ tasks, history }`, persist atomically, return the merged snapshot |

```sh
curl http://localhost:3001/health
curl http://localhost:3001/tasks
```

Connection settings are editable in the app:

- Android emulator: `http://10.0.2.2:3001` (default).
- Physical phone: `http://YOUR_COMPUTER_LAN_IP:3001`, on the same Wi-Fi network. Allow port 3001 in the host firewall.
- USB alternative: `adb reverse tcp:3001 tcp:3001`, then set `http://127.0.0.1:3001`.

`PORT` and `MOCK_DATA_FILE` environment variables can override the server port and data file. The mock has no authentication, matching assignment scope. HTTP is enabled in the Android build so a local development server works without TLS.

## Architecture and choices

```text
src/app/             Typed React Navigation stack and tabs
src/screens/         Screen composition
src/components/      Reusable controls and task UI
src/hooks/           Forms, task actions, settings and sync lifecycle
src/store/           Zustand in-memory view of durable data
src/services/        SQLite, task operations, attachments, sync, notifications
src/types/           Domain types and runtime schemas
src/utils/           Pure validation, sorting and conflict resolution
src/theme/           Semantic colors, spacing, typography and styles
server/              File-backed mock REST service
tests/               Focused validation and sync-merge tests
```

**React Native + Expo SDK 55 + TypeScript:** native Android support with Expo modules for SQLite, file access, image selection and notifications. The SDK and native package versions are aligned and locked in `package-lock.json`.

**SQLite:** durable task, history and settings tables. Task changes and their history events commit in an exclusive transaction. SQLite is the source of truth; a failed write is not optimistically presented as saved. Deleted tasks become tombstones so an offline deletion can reach the server. History is retained.

**Zustand:** a small observable snapshot for screens, theme and connection state. Data access remains in services. React Query was not introduced because there are no independent server queries driving the screens: a single explicit sync protocol replicates local data.

**React Hook Form + Zod:** typed form state and runtime validation. New or changed due dates must be in the future. An overdue existing task can still have its description or status edited without changing its due date. Coordinates are required to guarantee every task can appear on the map.

**Sync:** `src/services/syncService.ts` sends unsynced tasks and immutable history events. Failed changes remain in SQLite and retry automatically. Only one sync request runs at a time. The server serializes merges and writes a temporary JSON file followed by atomic rename before replying. Repeated requests are idempotent by task/event ID.

**Conflict rule:** task-level last-write-wins using ISO `updatedAt`, with lexicographic revision UUID as a deterministic tie-break. Deletion is an ordinary timestamped update. A newer explicit edit can win over an older deletion. Device clocks should be reasonably aligned. When a response arrives, the client compares against its current SQLite row, preserving a newer local edit made while the request was in flight. Full snapshots are returned for simplicity; this is not a pagination or multi-user production sync protocol.

**Attachments:** selected images are copied into the app's documents directory, rather than keeping temporary picker URIs. ID, URI, filename and MIME type are stored with the task. Up to five images per task. Missing images render an explanatory fallback. The mock synchronizes metadata, **not image bytes**: attachments originating on another device may be unavailable there. Removed/orphaned image files are retained until app data is cleared; a cleanup policy is outside this submission's scope.

**Notifications:** `expo-notifications` schedules local Android notifications using deterministic task identifiers. The normal trigger is due time minus 30 minutes; if that time has passed but the task is still in the future, the reminder is scheduled at the due time. Past-due tasks do not create new reminders. Editing reschedules; completion, cancellation and deletion cancel task reminders. Startup and sync reconcile reminders with stored tasks. Permission denial does not discard the task and produces a user-facing message when saving. The detail screen's **Notify me in 45 seconds** action uses the same scheduling function/channel, with a separate demo identifier. On Android 12+, use **Enable precise reminders** in Settings or task details and allow **Alarms & reminders** for Field Tasks before the 45-second demo. The app links directly to that system permission screen. Without this special permission, Expo uses an inexact alarm and Android can delay delivery. Battery restrictions may also affect timing; scheduling failures are shown to the user. No remote push server or FCM credentials are needed.

**Map/location:** Leaflet 1.9.4 is bundled into `assets/map.html`, generated by `npm run prepare:map` during installation. The WebView executes the bundled library offline. Only OpenStreetMap tile images need the internet. Markers use the task's persisted coordinates, with no geocoding or location permission. Three sample Minsk locations fill address and coordinates; both can be edited manually. Without network or available cached tiles, markers and the native location list still work against a plain map background. OpenStreetMap attribution remains visible. See [Leaflet documentation](https://leafletjs.com/reference.html) and [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).

## Verification

Focused checks:

```sh
npm run typecheck
npm run test:core
```

Tests cover whitespace/missing fields, coordinate boundaries, invalid and past dates, deletion retries, concurrent local edits, deterministic timestamp ties, and list filtering. Manual release-build results are recorded separately in `docs/verification.md` when performed.

Manual smoke test:

1. Launch a clean APK; confirm the empty state. Try saving an incomplete task.
2. Create a task with required fields, a saved location and an image. Allow notifications.
3. Change sort/filter options; open details; edit and change status. Check both history views.
4. Open a map marker and navigate to its task.
5. Trigger a 45-second demo on an active task; background the app; tap the notification.
6. Disable Wi-Fi/mobile data. Create and edit a task, then restart the app. Verify task and image persistence.
7. Delete a task offline. Restore connectivity with the mock server running. Verify Synced and server tombstones; restart again to confirm deletion stays applied.
8. Stop the mock server, edit a task, confirm Sync failed without losing data. Restart the server and retry.
9. Toggle dark mode and restart. Confirm theme, history and candidate code remain available.

## Known limitations

- Android is the tested target; iOS date/time selection and iOS builds are not supplied.
- Sync runs while the app is active and on next launch/foreground; it is not a background OS job after force-stop.
- Attachments are local files; binary upload/download and orphan cleanup are not implemented.
- Map tiles need connectivity and are not bulk-downloaded for offline use.
- No authentication, production backend, real geocoding, PDF support or realtime collaboration.
- Storage uses JSON domain records in SQLite and loads a snapshot into memory, appropriate to a small daily-work assignment rather than millions of tasks.
- The mock returns all records and retains tombstones/history indefinitely.
- Notifications depend on Android permissions and device scheduling policies.
- App text is English. Localization infrastructure was not added for this single-language assignment.

## Submission materials

Prepared local artifacts: `artifacts/FieldTasks-SA-RN-7842.apk`, `artifacts/FieldTasks-SA-RN-7842-demo.mp4`, and `artifacts/FieldTasks-SA-RN-7842-source.zip`. The video uses English captions, shows the installed release APK and includes a short walkthrough of actual storage/sync code. Artifacts are distributed separately from the source repository.

See `docs/video-script.md` for a 2–5 minute demonstration plan, `docs/code-walkthrough.md` for an explanation of the sync module, and `docs/submission-email.md` for the email draft. Replace personal details and upload links before sending. The repository, APK and video must be accessible without access requests.

Bundled Leaflet's license is included in `docs/leaflet-license.txt`.

## AI/tooling disclosure

OpenAI Codex assisted with scaffolding, implementation, validation/sync tests, debugging, and documentation. The candidate should review the implementation and be ready to explain persistence, tombstones, last-write-wins, in-flight edits, and notification behavior. No personal credentials or secret API keys are required or committed.
