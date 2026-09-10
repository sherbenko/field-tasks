To: pavel@salesautomators.com; hr@salesautomators.com

Subject: Mobile RN intern test task done - [Full Name]

Hello Pavel and team,

My name is [Full Name]. Please find my completed React Native assignment, Field Tasks.

- Candidate code: **SA-RN-7842** (also shown in the app, README and video).
- Recruiting profile: [direct profile link].
- Source repository: https://github.com/sherbenko/field-tasks
- Android APK: attach FieldTasks-SA-RN-7842.apk, available at https://github.com/sherbenko/field-tasks/releases/download/v1.0.0/FieldTasks-SA-RN-7842.apk
- Video demonstration: [direct unrestricted Google Drive link; upload the video from https://github.com/sherbenko/field-tasks/releases/download/v1.0.0/FieldTasks-SA-RN-7842-demo.mp4].
- My CV is attached as a PDF.

I used React Native with Expo SDK 55 and TypeScript, SQLite for transactional local storage, Zustand for UI snapshots, React Hook Form and Zod for typed validation, React Navigation for screens, and Expo modules for image access and local notifications. Leaflet/OpenStreetMap inside a WebView provides a map without requiring a private API key. A small Node.js REST server persists mock data to a JSON file.

The main design choice is local-first persistence: task operations and history are saved before synchronization, so creating, editing and deleting work offline. Deletion tombstones and stable identifiers make retries safe. Conflicts use documented last-write-wins, and the client preserves edits made while a sync request is in flight.

The app includes a 45-second notification demo, persistent light/dark theme, searchable and sortable tasks, map markers, image attachments, and timestamped history. Focused tests cover validation and sync conflict behavior. Map basemap tiles require connectivity; attachment metadata is synchronized, while image files remain local to the originating device.

AI disclosure: I used OpenAI Codex to assist with implementation, tests, debugging and documentation. [Review the code and replace this bracketed sentence with an accurate statement about your own review and understanding.]

Setup, architecture, APK build instructions, notification behavior and known limitations are documented in the README.

Best regards,
[Full Name]
