import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormProvider } from 'react-hook-form';
import type { RootStackParamList } from '../app/navigationTypes';
import { useTaskForm } from '../hooks/useTaskForm';
import { MAX_ATTACHMENTS } from '../constants/config';
import { TASK_STATUSES } from '../types/task';
import { STATUS_LABELS } from '../utils/taskSelectors';
import { useTheme } from '../theme/theme';
import { AppText } from '../components/common/AppText';
import { Button } from '../components/common/Button';
import { ChoiceChips } from '../components/common/ChoiceChips';
import { EmptyState } from '../components/common/EmptyState';
import { TaskFields } from '../components/feature/TaskFields';
import { DueDateField } from '../components/feature/DueDateField';
import { LocationFields } from '../components/feature/LocationFields';
import { AttachmentPreview } from '../components/feature/AttachmentPreview';

type TaskFormScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;
const STATUS_OPTIONS = TASK_STATUSES.map(value => ({ value, label: STATUS_LABELS[value] }));

export default function TaskFormScreen({ route }: TaskFormScreenProps) {
  const { styles } = useTheme();
  const form = useTaskForm(route.params?.taskId);
  const attachments = form.methods.watch('attachments');
  const status = form.methods.watch('status');
  const changeStatus = (value: typeof status) => form.methods.setValue('status', value, { shouldDirty: true });
  if (form.isMissing) return <EmptyState title="Task unavailable" description="This task was deleted. Return to your task list." />;
  return <FormProvider {...form.methods}>
    <KeyboardAvoidingView style={styles.screen} behavior="height">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading">{route.params?.taskId ? 'Edit your task' : 'Plan your next job'}</AppText>
        <AppText variant="small">Fields marked * are required. Your work is saved locally first.</AppText>
        <TaskFields />
        <DueDateField />
        <LocationFields />
        <AppText variant="title">Status</AppText>
        <ChoiceChips options={STATUS_OPTIONS} value={status} onChange={changeStatus} />
        <AppText variant="title">Attachments · {attachments.length}/{MAX_ATTACHMENTS}</AppText>
        {attachments.map(attachment => <AttachmentPreview key={attachment.id}
          attachment={attachment} onRemove={form.removeImage} />)}
        <Button label="Attach an image" variant="secondary" onPress={form.addImage} isLoading={form.isPicking} />
        {form.saveError && <AppText style={styles.error} accessibilityLiveRegion="polite">{form.saveError}</AppText>}
        {Object.keys(form.methods.formState.errors).length > 0 && <View style={styles.banner}>
          <AppText style={styles.bannerText}>Please check the highlighted fields above.</AppText>
        </View>}
        <Button label="Save task" onPress={form.save} isLoading={form.methods.formState.isSubmitting} disabled={form.isPicking} />
      </ScrollView>
    </KeyboardAvoidingView>
  </FormProvider>;
}
