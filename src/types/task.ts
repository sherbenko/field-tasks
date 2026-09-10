import { z } from 'zod';

export const TASK_STATUSES = ['new', 'in_progress', 'completed', 'cancelled'] as const;
export const syncStateSchema = z.enum(['pending', 'synced', 'failed']);
export const attachmentSchema = z.object({
  id: z.string(), uri: z.string(), name: z.string(), mimeType: z.string(),
});
export const taskSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), dueAt: z.string().datetime(),
  address: z.string(), latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180), status: z.enum(TASK_STATUSES),
  attachments: z.array(attachmentSchema), createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(), deletedAt: z.string().datetime().nullable(),
  revision: z.string(), syncState: syncStateSchema,
});
export const historySchema = z.object({
  id: z.string(), taskId: z.string().nullable(), taskTitle: z.string(),
  action: z.enum(['created', 'edited', 'status', 'attachment', 'deleted', 'sync']),
  description: z.string(), at: z.string().datetime(), syncState: syncStateSchema,
});
export const syncPayloadSchema = z.object({
  tasks: z.array(taskSchema), history: z.array(historySchema),
});
export type Task = z.infer<typeof taskSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type HistoryEntry = z.infer<typeof historySchema>;
export type TaskStatus = Task['status'];
export type SyncState = Task['syncState'];
export type SyncPayload = z.infer<typeof syncPayloadSchema>;
export type SortOrder = 'created' | 'due' | 'status';

export interface TaskDraft {
  title: string;
  description: string;
  dueAt: string;
  address: string;
  latitude: string;
  longitude: string;
  status: TaskStatus;
  attachments: Attachment[];
}
