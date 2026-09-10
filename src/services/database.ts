import * as SQLite from 'expo-sqlite';
import { historySchema, taskSchema } from '../types/task';
import type { HistoryEntry, SyncPayload, Task } from '../types/task';
import { chooseLatest } from '../utils/syncMerge';

let database: SQLite.SQLiteDatabase | undefined;
interface DataRow { data: string }

export async function initializeDatabase(): Promise<void> {
  database = await SQLite.openDatabaseAsync('field-tasks.db');
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS history (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    PRAGMA user_version = 1;
  `);
}

function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) throw new Error('Local storage is not ready. Please reopen the app.');
  return database;
}

export async function readSnapshot(): Promise<SyncPayload> {
  const db = getDatabase();
  const tasks = await db.getAllAsync<DataRow>('SELECT data FROM tasks');
  const history = await db.getAllAsync<DataRow>('SELECT data FROM history');
  return {
    tasks: tasks.map(row => taskSchema.parse(JSON.parse(row.data))),
    history: history.map(row => historySchema.parse(JSON.parse(row.data)))
      .sort((left, right) => right.at.localeCompare(left.at)),
  };
}

export async function persistTask(task: Task, entries: HistoryEntry[]): Promise<void> {
  await getDatabase().withExclusiveTransactionAsync(async transaction => {
    await transaction.runAsync('INSERT OR REPLACE INTO tasks (id, data) VALUES (?, ?)',
      task.id, JSON.stringify(task));
    for (const entry of entries) {
      await transaction.runAsync('INSERT OR REPLACE INTO history (id, data) VALUES (?, ?)',
        entry.id, JSON.stringify(entry));
    }
  });
}

export async function persistHistory(entry: HistoryEntry): Promise<void> {
  await getDatabase().runAsync('INSERT OR REPLACE INTO history (id, data) VALUES (?, ?)',
    entry.id, JSON.stringify(entry));
}

export async function applySyncResponse(payload: SyncPayload, sent: SyncPayload): Promise<void> {
  await getDatabase().withExclusiveTransactionAsync(async transaction => {
    for (const remote of payload.tasks) {
      const row = await transaction.getFirstAsync<DataRow>('SELECT data FROM tasks WHERE id = ?', remote.id);
      const local = row ? taskSchema.parse(JSON.parse(row.data)) : undefined;
      // A change made while the request was in flight must stay queued.
      const winner = local ? chooseLatest(local, remote) : remote;
      const task = winner.revision === remote.revision ? { ...winner, syncState: 'synced' } : winner;
      await transaction.runAsync('INSERT OR REPLACE INTO tasks (id, data) VALUES (?, ?)',
        task.id, JSON.stringify(task));
    }
    for (const entry of payload.history) {
      await transaction.runAsync('INSERT OR REPLACE INTO history (id, data) VALUES (?, ?)',
        entry.id, JSON.stringify({ ...entry, syncState: 'synced' }));
    }
    for (const entry of sent.history) {
      await transaction.runAsync('INSERT OR REPLACE INTO history (id, data) VALUES (?, ?)',
        entry.id, JSON.stringify({ ...entry, syncState: 'synced' }));
    }
  });
}

export async function markSyncFailed(sent: SyncPayload): Promise<void> {
  await getDatabase().withExclusiveTransactionAsync(async transaction => {
    for (const task of sent.tasks) {
      const row = await transaction.getFirstAsync<DataRow>('SELECT data FROM tasks WHERE id = ?', task.id);
      if (!row) continue;
      const current = taskSchema.parse(JSON.parse(row.data));
      if (current.revision !== task.revision) continue;
      await transaction.runAsync('UPDATE tasks SET data = ? WHERE id = ?',
        JSON.stringify({ ...current, syncState: 'failed' }), task.id);
    }
  });
}

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await getDatabase().getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getDatabase().runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}
