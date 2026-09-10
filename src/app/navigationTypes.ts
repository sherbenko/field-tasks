import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = { Tasks: undefined; Map: undefined; History: undefined; Settings: undefined };
export type RootStackParamList = {
  Home: NavigatorScreenParams<TabParamList> | undefined;
  TaskDetails: { taskId: string };
  TaskForm: { taskId?: string } | undefined;
};
