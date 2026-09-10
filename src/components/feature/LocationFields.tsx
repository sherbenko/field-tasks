import { View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { TaskDraft } from '../../types/task';
import { LOCATIONS } from '../../constants/config';
import { useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';
import { Button } from '../common/Button';
import { Field } from '../common/Field';

export function LocationFields() {
  const { control, setValue } = useFormContext<TaskDraft>();
  const { styles } = useTheme();
  const selectLocation = (location: typeof LOCATIONS[number]) => {
    setValue('address', location.address, { shouldDirty: true, shouldValidate: true });
    setValue('latitude', String(location.latitude), { shouldDirty: true, shouldValidate: true });
    setValue('longitude', String(location.longitude), { shouldDirty: true, shouldValidate: true });
  };
  return <View style={styles.section}>
    <AppText variant="title">Work location</AppText>
    <AppText variant="small">Choose a saved site or enter an address and coordinates. Addresses are not geocoded automatically.</AppText>
    {LOCATIONS.map(location => <Button key={location.name} label={location.name}
      variant="secondary" onPress={() => selectLocation(location)} />)}
    <Controller control={control} name="address" render={({ field, fieldState }) => (
      <Field label="Address *" placeholder="Street, building, city" value={field.value}
        onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
    )} />
    <Controller control={control} name="latitude" render={({ field, fieldState }) => (
      <Field label="Latitude *" placeholder="53.8964" keyboardType="numbers-and-punctuation"
        value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
    )} />
    <Controller control={control} name="longitude" render={({ field, fieldState }) => (
      <Field label="Longitude *" placeholder="27.5479" keyboardType="numbers-and-punctuation"
        value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
    )} />
  </View>;
}
