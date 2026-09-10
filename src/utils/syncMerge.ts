import type { SyncPayload, Task } from '../types/task';

export function chooseLatest(left: Task, right: Task): Task {
  const comparison = left.updatedAt.localeCompare(right.updatedAt)
    || left.revision.localeCompare(right.revision);
  return comparison >= 0 ? left : right;
}

export function mergePayload(current: SyncPayload, incoming: SyncPayload): SyncPayload {
  const tasks = new Map(current.tasks.map(task => [task.id, task]));
  for (const task of incoming.tasks) {
    const existing = tasks.get(task.id);
    tasks.set(task.id, { ...(existing ? chooseLatest(existing, task) : task), syncState: 'synced' });
  }
  const history = new Map(current.history.map(entry => [entry.id, entry]));
  for (const entry of incoming.history) history.set(entry.id, { ...entry, syncState: 'synced' });
  return { tasks: [...tasks.values()], history: [...history.values()] };
}
