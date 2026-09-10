import { z } from 'zod';
import { MAX_ATTACHMENTS } from '../constants/config';
import { attachmentSchema, TASK_STATUSES } from '../types/task';

const coordinate = (limit: number, label: string) => z.string().trim()
  .min(1, `${label} is required. Select a saved location or enter coordinates.`)
  .refine(value => Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit,
    `${label} must be between -${limit} and ${limit}.`);

export const taskDraftSchema = z.object({
  title: z.string().trim().min(1, 'Enter a task title.').max(120, 'Use 120 characters or fewer.'),
  description: z.string().trim().min(1, 'Describe the work to be done.').max(4000, 'Use 4000 characters or fewer.'),
  dueAt: z.string().refine(value => Number.isFinite(Date.parse(value)), 'Choose a valid date and time.'),
  address: z.string().trim().min(1, 'Enter an address.').max(300, 'Use 300 characters or fewer.'),
  latitude: coordinate(90, 'Latitude'), longitude: coordinate(180, 'Longitude'),
  status: z.enum(TASK_STATUSES), attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS),
});

export function validateDueDate(dueAt: string, now: number = Date.now()): boolean {
  return Number.isFinite(Date.parse(dueAt)) && Date.parse(dueAt) > now;
}
