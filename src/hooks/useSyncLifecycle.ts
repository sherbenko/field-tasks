import { useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SYNC_INTERVAL_MS } from '../constants/config';
import { synchronize } from '../services/syncService';
import { restoreReminders } from '../services/notificationService';
import { useAppStore } from '../store/useAppStore';

export function useSyncLifecycle(): void {
  const phase = useAppStore(state => state.phase);
  useEffect(() => {
    if (phase !== 'ready') return;
    const sync = () => { void synchronize().catch(() => undefined); };
    void restoreReminders(useAppStore.getState().tasks).catch(() => undefined);
    const unsubscribe = NetInfo.addEventListener(network => {
      const isOnline = Boolean(network.isConnected) && network.isInternetReachable !== false;
      useAppStore.setState({ isOnline });
      if (isOnline) sync();
    });
    const subscription = AppState.addEventListener('change', status => {
      if (status === 'active') sync();
    });
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') sync();
    }, SYNC_INTERVAL_MS);
    return () => { unsubscribe(); subscription.remove(); clearInterval(interval); };
  }, [phase]);
}
