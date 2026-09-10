import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RootStackParamList } from '../app/navigationTypes';
import { MAX_ATTACHMENTS } from '../constants/config';
import { pickImage } from '../services/attachmentService';
import { saveTask } from '../services/taskService';
import { synchronize } from '../services/syncService';
import { useAppStore } from '../store/useAppStore';
import type { TaskDraft } from '../types/task';
import { taskDraftSchema, validateDueDate } from '../utils/taskValidation';

export function useTaskForm(taskId?: string) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const previous = useAppStore(state => state.tasks.find(task => task.id === taskId && !task.deletedAt));
  const [isPicking, setIsPicking] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const methods = useForm<TaskDraft>({
    resolver: zodResolver(taskDraftSchema),
    defaultValues: previous ? {
      ...previous, latitude: String(previous.latitude), longitude: String(previous.longitude),
    } : {
      title: '', description: '', dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      address: '', latitude: '', longitude: '', status: 'new', attachments: [],
    },
  });
  const save = methods.handleSubmit(async draft => {
    if ((!previous || previous.dueAt !== draft.dueAt) && !validateDueDate(draft.dueAt)) {
      methods.setError('dueAt', { message: 'Choose a date and time in the future.' });
      return;
    }
    setSaveError(null);
    try {
      const result = await saveTask(draft, previous);
      await useAppStore.getState().refresh();
      if (result.warning) Alert.alert('Reminder needs attention', result.warning);
      navigation.replace('TaskDetails', { taskId: result.id });
      void synchronize().catch(() => undefined);
    } catch {
      setSaveError('Could not save this task. Please check the fields and try again.');
    }
  });
  const addImage = async () => {
    if (isPicking) return;
    if (methods.getValues('attachments').length >= MAX_ATTACHMENTS) {
      Alert.alert('Attachment limit', `You can attach up to ${MAX_ATTACHMENTS} images.`);
      return;
    }
    setIsPicking(true);
    try {
      const image = await pickImage();
      if (image) methods.setValue('attachments', [...methods.getValues('attachments'), image], { shouldDirty: true });
    } catch (error) {
      Alert.alert('Image not attached', error instanceof Error ? error.message : 'Please try selecting the image again.');
    } finally { setIsPicking(false); }
  };
  const removeImage = (id: string) => methods.setValue('attachments',
    methods.getValues('attachments').filter(image => image.id !== id), { shouldDirty: true });
  return { methods, save, saveError, addImage, removeImage, isPicking, isMissing: Boolean(taskId && !previous) };
}
