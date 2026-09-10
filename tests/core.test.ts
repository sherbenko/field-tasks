import assert from 'node:assert/strict';
import test from 'node:test';
import { taskDraftSchema, validateDueDate } from '../src/utils/taskValidation';
import { chooseLatest, mergePayload } from '../src/utils/syncMerge';
import { selectTasks } from '../src/utils/taskSelectors';
import type { Task, TaskDraft } from '../src/types/task';

const draft: TaskDraft = {
  title: 'Inspect pump', description: 'Check seals and pressure.', dueAt: '2030-01-01T12:00:00.000Z',
  address: 'Depot 1', latitude: '53.9', longitude: '27.5', status: 'new', attachments: [],
};
const task: Task = {
  ...draft, latitude: 53.9, longitude: 27.5, id: 'task-1', revision: 'a',
  createdAt: '2026-09-10T10:00:00.000Z', updatedAt: '2026-09-10T10:00:00.000Z',
  deletedAt: null, syncState: 'pending',
};

test('required text rejects whitespace, invalid coordinates and invalid dates', () => {
  for (const key of ['title', 'description', 'address', 'latitude', 'longitude']) {
    assert.equal(taskDraftSchema.safeParse({ ...draft, [key]: '  ' }).success, false);
  }
  assert.equal(taskDraftSchema.safeParse({ ...draft, latitude: '91' }).success, false);
  assert.equal(taskDraftSchema.safeParse({ ...draft, longitude: '-181' }).success, false);
  assert.equal(taskDraftSchema.safeParse({ ...draft, longitude: 'abc' }).success, false);
  assert.equal(taskDraftSchema.safeParse({ ...draft, dueAt: 'bad-date' }).success, false);
  assert.equal(taskDraftSchema.safeParse(draft).success, true);
});

test('new due dates must be strictly in the future', () => {
  const now = Date.parse(draft.dueAt);
  assert.equal(validateDueDate(draft.dueAt, now), false);
  assert.equal(validateDueDate(draft.dueAt, now - 1), true);
  assert.equal(validateDueDate('invalid', now), false);
});

test('newer deletion wins over a stale task and stays deleted on retry', () => {
  const deleted: Task = { ...task, revision: 'b', updatedAt: '2026-09-10T11:00:00.000Z', deletedAt: '2026-09-10T11:00:00.000Z' };
  const merged = mergePayload({ tasks: [deleted], history: [] }, { tasks: [task], history: [] });
  assert.equal(merged.tasks[0]?.deletedAt, deleted.deletedAt);
  assert.deepEqual(mergePayload(merged, { tasks: [task], history: [] }), merged);
});

test('a local edit during an in-flight sync is not replaced by an older acknowledgement', () => {
  const changed: Task = { ...task, title: 'Changed while syncing', revision: 'b', updatedAt: '2026-09-10T12:00:00.000Z' };
  assert.equal(chooseLatest(changed, { ...task, syncState: 'synced' }).title, changed.title);
  assert.equal(chooseLatest(changed, task).syncState, 'pending');
});

test('equal timestamps use a deterministic revision tie-break in either direction', () => {
  const other: Task = { ...task, revision: 'z' };
  assert.deepEqual(chooseLatest(task, other), chooseLatest(other, task));
});

test('filtering keeps terminal tasks, hides tombstones and does not mutate input order', () => {
  const completed: Task = { ...task, id: 'completed', status: 'completed' };
  const deleted: Task = { ...task, id: 'deleted', deletedAt: task.updatedAt };
  const input = [completed, deleted, task];
  assert.equal(selectTasks(input, '', 'all', 'status').length, 2);
  assert.equal(selectTasks(input, 'pump', 'completed', 'due')[0]?.id, 'completed');
  assert.equal(selectTasks(input, 'depot', 'new', 'created')[0]?.id, task.id);
  assert.equal(input[0]?.id, 'completed');
});
