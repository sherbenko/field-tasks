import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigationTypes';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../types/task';
import { useTheme } from '../theme/theme';
import { AppText } from '../components/common/AppText';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/feature/TaskCard';
import { TaskMap } from '../components/feature/TaskMap';

const keyExtractor = (task: Task) => task.id;

export default function MapScreen() {
  const { styles } = useTheme();
  const allTasks = useAppStore(state => state.tasks);
  const tasks = allTasks.filter(task => !task.deletedAt);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const openTask = (taskId: string) => navigation.navigate('TaskDetails', { taskId });
  const renderTask = ({ item }: { item: Task }) => <TaskCard task={item} onOpen={openTask} />;
  return <View style={styles.screen}>
    <FlatList data={tasks} keyExtractor={keyExtractor} renderItem={renderTask} contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.listHeader}>
        <AppText variant="heading">Your work, on the map.</AppText>
        <AppText variant="small">Tap a numbered marker, then Open task. Map tiles need internet; task locations are stored offline.</AppText>
        <TaskMap tasks={tasks} onOpen={openTask} />
        <AppText variant="title">Locations · {tasks.length}</AppText>
      </View>} ListEmptyComponent={<EmptyState title="No locations yet" description="Create a task with a saved site or manual coordinates to place it on the map." />} />
  </View>;
}
