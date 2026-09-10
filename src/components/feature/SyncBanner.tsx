import { View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';

export function SyncBanner() {
  const { styles } = useTheme();
  const isOnline = useAppStore(state => state.isOnline);
  const isSyncing = useAppStore(state => state.isSyncing);
  const syncError = useAppStore(state => state.syncError);
  if (isOnline && !syncError && !isSyncing) return null;
  const message = !isOnline ? 'Offline · Your work is saved on this device.'
    : isSyncing ? 'Synchronizing your work…' : 'Server unavailable · Local changes are safe. Check Settings.';
  return <View style={styles.banner}><AppText style={styles.bannerText} accessibilityLiveRegion="polite">{message}</AppText></View>;
}
