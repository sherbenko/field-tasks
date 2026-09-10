import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { startActivityAsync } from 'expo-intent-launcher';
import { APPLICATION_ID, DEMO_DELAY_SECONDS, REMINDER_LEAD_MS } from '../constants/config';
import type { Task } from '../types/task';

const CHANNEL_ID = 'task-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

async function ensurePermission(request: boolean): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Task reminders', importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!request) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function schedule(task: Task, date: Date, identifier: string, isDemo: boolean): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: isDemo ? `Demo reminder · ${task.title}` : `Task reminder · ${task.title}`,
      body: `${task.address} · Due ${new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      data: { taskId: task.id }, sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
  });
}

export async function reconcileReminder(task: Task, requestPermission = false): Promise<string | undefined> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-${task.id}`);
    if (task.deletedAt || task.status === 'completed' || task.status === 'cancelled') {
      await Notifications.cancelScheduledNotificationAsync(`demo-${task.id}`);
      return;
    }
    const due = Date.parse(task.dueAt);
    if (due <= Date.now()) return;
    if (!(await ensurePermission(requestPermission))) {
      return 'Task saved. Notifications are disabled. Enable them in Android settings to receive reminders.';
    }
    const reminder = due - REMINDER_LEAD_MS;
    const date = new Date(reminder > Date.now() ? reminder : due);
    await schedule(task, date, `task-${task.id}`, false);
  } catch {
    return 'Task saved, but its reminder could not be scheduled. Check notification permissions in Android settings.';
  }
}

export async function scheduleDemoReminder(task: Task): Promise<void> {
  if (!(await ensurePermission(true))) {
    throw new Error('Allow notifications in Android settings, then try again.');
  }
  await schedule(task, new Date(Date.now() + DEMO_DELAY_SECONDS * 1000), `demo-${task.id}`, true);
}

export async function restoreReminders(tasks: Task[]): Promise<void> {
  for (const task of tasks) await reconcileReminder(task);
}

export async function openPreciseReminderSettings(): Promise<void> {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
    await startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
      data: `package:${APPLICATION_ID}`,
    });
    return;
  }
  await Linking.openSettings();
}
