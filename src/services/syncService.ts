import { REQUEST_TIMEOUT_MS } from '../constants/config';
import { useAppStore } from '../store/useAppStore';
import { syncPayloadSchema } from '../types/task';
import type { SyncPayload } from '../types/task';
import { applySyncResponse, markSyncFailed, persistHistory, readSnapshot, setSetting } from './database';
import { createHistory } from './taskService';
import { restoreReminders } from './notificationService';

let activeSync: Promise<void> | undefined;

async function runSync(): Promise<void> {
  const state = useAppStore.getState();
  if (state.phase !== 'ready' || !state.isOnline) return;
  useAppStore.setState({ isSyncing: true, syncError: null });
  let sent: SyncPayload = { tasks: [], history: [] };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const snapshot = await readSnapshot();
    sent = {
      tasks: snapshot.tasks.filter(task => task.syncState !== 'synced'),
      history: snapshot.history.filter(entry => entry.syncState !== 'synced'),
    };
    const response = await fetch(`${state.serverUrl}/sync`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sent), signal: controller.signal,
    });
    if (!response.ok) throw new Error('Server rejected the synchronization request.');
    const payload = syncPayloadSchema.parse(await response.json());
    await applySyncResponse(payload, sent);
    const lastSync = new Date().toISOString();
    const hasChanges = sent.tasks.length > 0 || sent.history.some(entry => entry.action !== 'sync')
      || payload.tasks.some(task => !snapshot.tasks.some(local => local.revision === task.revision));
    if (hasChanges) await persistHistory(createHistory(undefined, 'sync',
      `Synchronized ${sent.tasks.length} local task change(s); received ${payload.tasks.length} server task(s).`));
    await setSetting('lastSync', lastSync);
    useAppStore.setState({ lastSync });
    await state.refresh();
    await restoreReminders(useAppStore.getState().tasks);
  } catch {
    const message = 'Could not reach the mock server. Changes are stored on this device and will retry automatically.';
    useAppStore.setState({ syncError: message });
    try {
      await markSyncFailed(sent);
      if (sent.tasks.length && state.syncError !== message) {
        await persistHistory(createHistory(undefined, 'sync', 'Sync failed. Local changes retained for retry.'));
      }
      await state.refresh();
    } catch {
      useAppStore.setState({ syncError: 'Could not update local sync status. Please reopen the app.' });
    }
  } finally {
    clearTimeout(timeout);
    useAppStore.setState({ isSyncing: false });
  }
}

export function synchronize(): Promise<void> {
  if (!activeSync) activeSync = runSync().finally(() => { activeSync = undefined; });
  return activeSync;
}
