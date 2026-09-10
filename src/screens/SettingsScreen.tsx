import { ScrollView, Switch, View } from 'react-native';
import { CANDIDATE_CODE } from '../constants/config';
import { useSettings } from '../hooks/useSettings';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils/taskSelectors';
import { useTheme } from '../theme/theme';
import { AppText } from '../components/common/AppText';
import { Button } from '../components/common/Button';
import { Field } from '../components/common/Field';

export default function SettingsScreen() {
  const { styles, colors, isDark } = useTheme();
  const settings = useSettings();
  const isSyncing = useAppStore(state => state.isSyncing);
  const isOnline = useAppStore(state => state.isOnline);
  const syncError = useAppStore(state => state.syncError);
  const lastSync = useAppStore(state => state.lastSync);
  const tasks = useAppStore(state => state.tasks);
  const pending = tasks.filter(task => task.syncState !== 'synced').length;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <AppText variant="heading">Make it work for you.</AppText>
    <View style={styles.card}>
      <View style={styles.spread}>
        <View style={styles.grow}><AppText variant="title">Dark theme</AppText>
          <AppText variant="small">Comfortable in any light.</AppText></View>
        <Switch accessibilityLabel="Dark theme" value={isDark} onValueChange={settings.toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }} />
      </View>
    </View>
    <View style={styles.card}>
      <AppText variant="title">Synchronization</AppText>
      <AppText>{isOnline ? 'Network connected' : 'Offline'} · {pending} pending task change(s)</AppText>
      <AppText variant="small">Last sync: {lastSync ? formatDate(lastSync) : 'Not yet synchronized'}</AppText>
      {syncError && <View style={styles.banner}><AppText style={styles.bannerText}>{syncError}</AppText></View>}
      <Field label="Mock server URL" value={settings.url} onChangeText={settings.setUrl}
        autoCapitalize="none" autoCorrect={false} keyboardType="url" error={settings.error ?? undefined} />
      <AppText variant="small">Android emulator: http://10.0.2.2:3001. On a phone, use your computer’s Wi-Fi IP address and port 3001.</AppText>
      <Button label="Save server address" variant="secondary" onPress={settings.saveServer} isLoading={settings.isSaving} disabled={isSyncing} />
      <Button label="Sync now" onPress={settings.syncNow} isLoading={isSyncing} disabled={!isOnline || settings.isSaving} />
    </View>
    <View style={styles.card}>
      <AppText variant="title">Notifications</AppText>
      <AppText variant="small">Reminders arrive 30 minutes before a task is due. For tasks due sooner, the reminder arrives at the due time. Use the 45-second demo on an active task’s detail screen.</AppText>
      <Button label="Open notification permissions" variant="secondary" onPress={settings.openSystemSettings} />
      <AppText variant="small">Android 12+: allow Alarms & reminders for timely delivery, including the 45-second demo.</AppText>
      <Button label="Enable precise reminders" variant="secondary" onPress={settings.enablePreciseReminders} />
    </View>
    <View style={styles.hero}>
      <AppText variant="title" style={styles.heroText}>Field Tasks</AppText>
      <AppText style={styles.heroText}>Purpose-built for work beyond the office.</AppText>
      <AppText variant="label" style={styles.heroText}>Candidate code: {CANDIDATE_CODE}</AppText>
      <AppText variant="small" style={styles.heroText}>Version 1.0.0 · React Native + Expo</AppText>
    </View>
  </ScrollView>;
}
