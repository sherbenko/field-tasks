import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigationTypes';
import { changeTaskStatus, deleteTask } from '../services/taskService';
import { openPreciseReminderSettings, scheduleDemoReminder } from '../services/notificationService';
import { synchronize } from '../services/syncService';
import { useAppStore } from '../store/useAppStore';
import type { Task, TaskStatus } from '../types/task';
import { DEMO_DELAY_SECONDS } from '../constants/config';

export function useTaskActions(task?: Task) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isBusy, setIsBusy] = useState(false);
  const perform = async (operation: () => Promise<void>) => {
    if (isBusy) return;
    setIsBusy(true);
    try { await operation(); }
    catch (error) { Alert.alert('Action could not be completed', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setIsBusy(false); }
  };
  const updateStatus = (status: TaskStatus) => perform(async () => {
    if (!task) return;
    const warning = await changeTaskStatus(task, status);
    await useAppStore.getState().refresh();
    if (warning) Alert.alert('Reminder needs attention', warning);
    void synchronize().catch(() => undefined);
  });
  const confirmDelete = () => {
    if (!task) return;
    Alert.alert('Delete task?', `“${task.title}” will be removed. Its action history will remain available.`, [
      { text: 'Keep task', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void perform(async () => {
        await deleteTask(task);
        await useAppStore.getState().refresh();
        navigation.popToTop();
        void synchronize().catch(() => undefined);
      }); } },
    ]);
  };
  const demoReminder = () => perform(async () => {
    if (!task) return;
    await scheduleDemoReminder(task);
    Alert.alert('Demo reminder scheduled', `Scheduled for ${DEMO_DELAY_SECONDS} seconds from now. Send the app to the background. Android may delay delivery if precise reminders are disabled.`);
  });
  const enablePreciseReminders = () => perform(openPreciseReminderSettings);
  const edit = () => { if (task) navigation.navigate('TaskForm', { taskId: task.id }); };
  return { isBusy, updateStatus, confirmDelete, demoReminder, enablePreciseReminders, edit };
}
