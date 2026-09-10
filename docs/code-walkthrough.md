# Understanding the implementation

## A task save

1. `useTaskForm` runs React Hook Form/Zod validation and checks the due time.
2. `taskService.saveTask` creates a UUID revision and timestamp, sets Pending sync, and builds audit events.
3. `database.persistTask` writes the task and history inside one SQLite transaction. If the transaction fails, neither half appears saved.
4. Notification scheduling happens after the durable save. Permission failure is a warning; it does not erase valid work.
5. Zustand refreshes from SQLite. The sync service is triggered without blocking navigation.

## Why deletion is a tombstone

If an offline deletion physically removed the only local record, synchronization would not know which server record to delete. We keep `deletedAt` and a new `updatedAt`/revision, hide the task in selectors, and sync the tombstone. History remains independently accessible.

## How retries avoid duplicates

Tasks and history have stable UUIDs. The server merges by task ID and history-event ID rather than appending duplicates. A request that succeeded on the server but lost its response can be retried. The same revisions and events produce the same stored records.

## In-flight edits

Imagine task revision A is uploaded. Before the response returns, the user saves B. Applying A blindly would lose B or falsely mark it synced. `applySyncResponse` reads the current SQLite row in its transaction and calls `chooseLatest`; B remains pending if it is newer. The next sync sends it.

## Conflict trade-off

Last-write-wins compares ISO UTC timestamps and uses revision UUIDs as a deterministic tie-break. It is predictable and small enough to audit in this assignment. It does not merge individual fields, prevent skewed clocks, or implement collaborative editing. A production system could use server versions and explicit conflicts instead.

## Notification behavior

Each normal task reminder has ID `task-<uuid>`. Editing cancels that ID before scheduling its replacement; terminal status and deletion cancel it. If the 30-minute lead time is already past, the due time is used. Demo reminders use the same scheduler with a 45-second trigger and a separate ID. Android permissions and scheduling are external to the database transaction.

## Likely interview questions

- Why SQLite instead of storing everything only in Zustand? Durable transactional writes and an independent source of truth.
- Why no React Query? Screens read local state; a single replication protocol handles the server rather than many server queries.
- What happens if the server is down? CRUD continues. Pending rows become failed and are retried when connectivity/foreground/timer permits.
- What if an image disappears? Its metadata remains, and the preview renders an unavailable-image explanation.
- What does offline map support mean here? Coordinates and marker rendering are local; fresh basemap tiles require internet.
- What would you improve next? Binary attachment sync/cleanup, incremental sync with server versions, background work, and device notification coverage.
