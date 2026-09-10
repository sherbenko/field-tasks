import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigation } from './src/app/Navigation';
import { useSyncLifecycle } from './src/hooks/useSyncLifecycle';
import { useAppStore } from './src/store/useAppStore';
import { useTheme } from './src/theme/theme';
import { AppText } from './src/components/common/AppText';
import { Button } from './src/components/common/Button';
import { ErrorFallback } from './src/components/common/ErrorFallback';

export default function App() {
  const { styles, colors, isDark } = useTheme();
  const phase = useAppStore(state => state.phase);
  const startupError = useAppStore(state => state.startupError);
  const initialize = useAppStore(state => state.initialize);
  useEffect(() => { void initialize(); }, [initialize]);
  useSyncLifecycle();
  return <SafeAreaProvider>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {phase === 'ready' ? <Navigation /> : <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          {phase === 'loading' ? <><ActivityIndicator color={colors.primary} /><AppText>Opening your workspace…</AppText></>
            : <><AppText variant="title">Could not open workspace</AppText><AppText>{startupError}</AppText>
              <Button label="Try again" onPress={initialize} /></>}
        </View>
      </SafeAreaView>}
    </ErrorBoundary>
  </SafeAreaProvider>;
}
