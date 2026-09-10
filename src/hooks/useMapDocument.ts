import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export function useMapDocument() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/map.html'));
        await asset.downloadAsync();
        if (!asset.localUri) throw new Error('Map document not available.');
        const document = await FileSystem.readAsStringAsync(asset.localUri);
        if (isMounted) setHtml(document);
      } catch {
        if (isMounted) setError('Could not load the map. Your locations are still available in the list below.');
      }
    };
    void load();
    return () => { isMounted = false; };
  }, []);
  return { html, error };
}
