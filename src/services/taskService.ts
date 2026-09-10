import * as Crypto from 'expo-crypto';
import { persistTask } from './database';
import { reconcileReminder } from './notificationService';
import type { HistoryEntry, Task, TaskDraft, TaskStatus } from '../types/task';
import { taskDraftSchema, validateDueDate } from '../utils/taskValidation';
import { STATUS_LABELS } from '../utils/taskSelectors';

export function createHistory(task: Task | undefined, action: HistoryEntry['action'], description: string): HistoryEntry {
  return {
    id: Crypto.randomUUID(), taskId: task?.id ?? null, taskTitle: task?.title ?? 'Synchronization',
    action, description, at: new Date().toISOString(), syncState: 'pending',
  };
}

export async function saveTask(draft: TaskDraft, previous?: Task): Promise<{ id: string; warning?: string }> {
  const values = taskDraftSchema.parse(draft);
  if ((!previous || previous.dueAt !== values.dueAt) && !validateDueDate(values.dueAt)) {
    throw new Error('Choose a due date and time in the future.');
  }
  const now = new Date().toISOString();
  const task: Task = {
    ...values, latitude: Number(values.latitude), longitude: Number(values.longitude),
    id: previous?.id ?? Crypto.randomUUID(), createdAt: previous?.createdAt ?? now,
    updatedAt: now, deletedAt: null, revision: Crypto.randomUUID(), syncState: 'pending',
  };
  const entries = [createHistory(task, previous ? 'edited' : 'created', previous ? 'Task details updated.' : 'Task created.')];
  if (previous && previous.status !== task.status) {
    entries.push(createHistory(task, 'status', `${STATUS_LABELS[previous.status]} → ${STATUS_LABELS[task.status]}`));
  }
  const before = new Set(previous?.attachments.map(item => item.id));
  const after = new Set(task.attachments.map(item => item.id));
  const added = task.attachments.filter(item => !before.has(item.id)).length;
  const removed = previous?.attachments.filter(item => !after.has(item.id)).length ?? 0;
  if (added || removed) entries.push(createHistory(task, 'attachment', `${added} image(s) added, ${removed} removed.`));
  await persistTask(task, entries);
  const warning = await reconcileReminder(task, true);
  return { id: task.id, warning };
}

export async function changeTaskStatus(task: Task, status: TaskStatus): Promise<string | undefined> {
  if (task.status === status) return;
  const updated: Task = { ...task, status, updatedAt: new Date().toISOString(), revision: Crypto.randomUUID(), syncState: 'pending' };
  await persistTask(updated, [createHistory(updated, 'status', `${STATUS_LABELS[task.status]} → ${STATUS_LABELS[status]}`)]);
  return reconcileReminder(updated, true);
}

export async function deleteTask(task: Task): Promise<void> {
  const now = new Date().toISOString();
  const deleted: Task = { ...task, deletedAt: now, updatedAt: now, revision: Crypto.randomUUID(), syncState: 'pending' };
  await persistTask(deleted, [createHistory(task, 'deleted', 'Task deleted. History retained.')]);
  await reconcileReminder(deleted);
}
