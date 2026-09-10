import { View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { TaskDraft } from '../../types/task';
import { useTheme } from '../../theme/theme';
import { Field } from '../common/Field';

export function TaskFields() {
  const { control } = useFormContext<TaskDraft>();
  const { styles } = useTheme();
  return <View style={styles.section}>
    <Controller control={control} name="title" render={({ field, fieldState }) => (
      <Field label="Task title *" placeholder="e.g. Inspect ventilation system" maxLength={120}
        value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
    )} />
    <Controller control={control} name="description" render={({ field, fieldState }) => (
      <Field label="Description *" placeholder="What needs to be done?" multiline maxLength={4000}
        value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
    )} />
  </View>;
}
