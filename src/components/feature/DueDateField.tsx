import { View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useFormContext, useWatch } from 'react-hook-form';
import type { TaskDraft } from '../../types/task';
import { REMINDER_LEAD_MS } from '../../constants/config';
import { formatDate } from '../../utils/taskSelectors';
import { useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';
import { Button } from '../common/Button';

export function DueDateField() {
  const { control, setValue, formState: { errors } } = useFormContext<TaskDraft>();
  const dueAt = useWatch({ control, name: 'dueAt' });
  const { styles } = useTheme();
  const chooseDate = () => DateTimePickerAndroid.open({
    value: new Date(dueAt), mode: 'date',
    onChange: (event, selected) => {
      if (event.type !== 'set' || !selected) return;
      const next = new Date(dueAt);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setValue('dueAt', next.toISOString(), { shouldDirty: true });
    },
  });
  const chooseTime = () => DateTimePickerAndroid.open({
    value: new Date(dueAt), mode: 'time', is24Hour: true,
    onChange: (event, selected) => {
      if (event.type !== 'set' || !selected) return;
      const next = new Date(dueAt);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setValue('dueAt', next.toISOString(), { shouldDirty: true });
    },
  });
  return <View style={styles.card}>
    <AppText variant="label">Due date & time *</AppText>
    <AppText>{formatDate(dueAt)}</AppText>
    <View style={styles.wrap}>
      <Button label="Choose date" variant="secondary" onPress={chooseDate} />
      <Button label="Choose time" variant="secondary" onPress={chooseTime} />
    </View>
    <AppText variant="small">{Date.parse(dueAt) - Date.now() < REMINDER_LEAD_MS
      ? 'Less than 30 minutes away: the reminder will arrive at the due time.'
      : 'A local reminder will arrive 30 minutes before the due time.'}</AppText>
    {errors.dueAt && <AppText style={styles.error} variant="small">{errors.dueAt.message}</AppText>}
  </View>;
}
