import { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import type { RootStackParamList, TabParamList } from './navigationTypes';
import { useTheme } from '../theme/theme';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import MapScreen from '../screens/MapScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const ICONS: Record<keyof TabParamList, 'check-square' | 'map' | 'clock' | 'settings'> = {
  Tasks: 'check-square', Map: 'map', History: 'clock', Settings: 'settings',
};

function HomeTabs() {
  const { styles, colors } = useTheme();
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerStyle: styles.navigationHeader, headerTintColor: colors.text, headerShadowVisible: false,
    tabBarStyle: styles.tabBar, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
    tabBarIcon: ({ color, size }) => <Feather name={ICONS[route.name]} size={size} color={color} />,
  })}>
    <Tabs.Screen name="Tasks" component={TasksScreen} options={{ title: 'Field Tasks', tabBarLabel: 'Tasks' }} />
    <Tabs.Screen name="Map" component={MapScreen} />
    <Tabs.Screen name="History" component={HistoryScreen} />
    <Tabs.Screen name="Settings" component={SettingsScreen} />
  </Tabs.Navigator>;
}

export function Navigation() {
  const { isDark, colors, styles } = useTheme();
  const response = Notifications.useLastNotificationResponse();
  const openNotification = () => {
    const taskId: unknown = response?.notification.request.content.data?.taskId;
    if (typeof taskId === 'string' && navigationRef.isReady()) {
      navigationRef.navigate('TaskDetails', { taskId });
      void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    }
  };
  useEffect(openNotification, [response]);
  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  };
  return <NavigationContainer ref={navigationRef} theme={theme} onReady={openNotification}>
    <Stack.Navigator screenOptions={{ headerStyle: styles.navigationHeader, headerTintColor: colors.text, headerShadowVisible: false }}>
      <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: 'Task details' }} />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Task planner' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
