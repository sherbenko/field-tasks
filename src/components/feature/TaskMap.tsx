import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { z } from 'zod';
import type { Task } from '../../types/task';
import { useMapDocument } from '../../hooks/useMapDocument';
import { useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';

interface TaskMapProps { tasks: Task[]; onOpen: (id: string) => void }
const messageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('open'), taskId: z.string() }), z.object({ type: z.literal('tileError') }),
  z.object({ type: z.literal('ready') }),
]);

export function TaskMap({ tasks, onOpen }: TaskMapProps) {
  const { styles, colors, isDark } = useTheme();
  const { html, error } = useMapDocument();
  const webView = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasTileError, setHasTileError] = useState(false);
  const [hasWebError, setHasWebError] = useState(false);
  const data = JSON.stringify(tasks.map(task => ({
    id: task.id, title: task.title, address: task.address, latitude: task.latitude, longitude: task.longitude,
  })));
  const script = `window.setTasks(${data},${isDark});true;`;
  useEffect(() => { if (isReady) webView.current?.injectJavaScript(script); }, [script, isReady]);
  const onLoad = () => setIsReady(true);
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const message = messageSchema.parse(JSON.parse(event.nativeEvent.data));
      if (message.type === 'tileError') setHasTileError(true);
      else if (message.type === 'ready') onLoad();
      else if (tasks.some(task => task.id === message.taskId)) onOpen(message.taskId);
    } catch { setHasWebError(true); }
  };
  const handleNavigation = (request: WebViewNavigation) => {
    if (request.url === 'about:blank' || request.url.startsWith('https://field-tasks.local/')) return true;
    if (request.url.startsWith('https://www.openstreetmap.org/') || request.url.startsWith('https://leafletjs.com')) {
      void Linking.openURL(request.url).catch(() => Alert.alert('Link unavailable', 'Please try again when you are online.'));
    }
    return false;
  };
  if (error || hasWebError) return <View style={styles.banner}>
    <AppText style={styles.bannerText}>{error ?? 'Map unavailable. Open a task from the location list below.'}</AppText>
  </View>;
  return <View style={styles.tight}>
    <View style={styles.map}>
      {html ? <WebView ref={webView} source={{ html, baseUrl: 'https://field-tasks.local/' }}
        style={styles.mapView} onLoad={onLoad} onMessage={onMessage}
        userAgent="FieldTasks/1.0 SA-RN-7842 (ReactNativeWebView)"
        onError={() => setHasWebError(true)} onContentProcessDidTerminate={() => setHasWebError(true)}
        onShouldStartLoadWithRequest={handleNavigation}
        originWhitelist={['https://field-tasks.local', 'about:blank']} javaScriptEnabled
        setSupportMultipleWindows={false} />
        : <View style={styles.center}><ActivityIndicator color={colors.primary} /><AppText>Loading map…</AppText></View>}
    </View>
    {hasTileError && <AppText variant="small">Base map tiles are unavailable. Task markers and the location list remain usable.</AppText>}
  </View>;
}
