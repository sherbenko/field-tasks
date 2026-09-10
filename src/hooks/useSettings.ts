import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { synchronize } from '../services/syncService';
import { openPreciseReminderSettings } from '../services/notificationService';
import { useAppStore } from '../store/useAppStore';

export function useSettings() {
  const serverUrl = useAppStore(state => state.serverUrl);
  const [url, setUrl] = useState(serverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveServer = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await useAppStore.getState().setServerUrl(url);
      await synchronize();
      if (!useAppStore.getState().syncError) Alert.alert('Server saved', 'Connection settings have been saved on this device.');
    } catch { setError('Enter a valid server URL, for example http://10.0.2.2:3001.'); }
    finally { setIsSaving(false); }
  };
  const toggleTheme = async (value: boolean) => {
    try { await useAppStore.getState().setTheme(value); }
    catch { Alert.alert('Theme not saved', 'Please try again.'); }
  };
  const openSystemSettings = async () => {
    try { await Linking.openSettings(); }
    catch { Alert.alert('Settings unavailable', 'Open Android settings and find Field Tasks to enable notifications.'); }
  };
  const syncNow = () => { void synchronize().catch(() => Alert.alert('Sync unavailable', 'Please try again.')); };
  const enablePreciseReminders = async () => {
    try { await openPreciseReminderSettings(); }
    catch { Alert.alert('Settings unavailable', 'Open Android settings → Special app access → Alarms & reminders → Field Tasks.'); }
  };
  return { url, setUrl, isSaving, error, saveServer, toggleTheme, openSystemSettings, enablePreciseReminders, syncNow };
}
