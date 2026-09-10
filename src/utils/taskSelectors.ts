import type { SortOrder, Task, TaskStatus } from '../types/task';
import { TASK_STATUSES } from '../types/task';

export function selectTasks(tasks: Task[], search: string, status: TaskStatus | 'all', sort: SortOrder) {
  const query = search.trim().toLowerCase();
  return tasks.filter(task => !task.deletedAt && (status === 'all' || task.status === status)
    && `${task.title} ${task.address}`.toLowerCase().includes(query))
    .sort((left, right) => {
      if (sort === 'due') return left.dueAt.localeCompare(right.dueAt);
      if (sort === 'status') {
        const difference = TASK_STATUSES.indexOf(left.status) - TASK_STATUSES.indexOf(right.status);
        if (difference) return difference;
      }
      return right.createdAt.localeCompare(left.createdAt);
    });
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'New', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled',
};

export const SYNC_LABELS = { pending: 'Pending sync', synced: 'Synced', failed: 'Sync failed' };
