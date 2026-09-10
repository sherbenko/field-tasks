import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../app/navigationTypes';
import { useAppStore } from '../store/useAppStore';
import type { SortOrder, Task, TaskStatus } from '../types/task';
import { TASK_STATUSES } from '../types/task';
import { selectTasks, STATUS_LABELS } from '../utils/taskSelectors';
import { useTheme } from '../theme/theme';
import { AppText } from '../components/common/AppText';
import { Button } from '../components/common/Button';
import { ChoiceChips } from '../components/common/ChoiceChips';
import { EmptyState } from '../components/common/EmptyState';
import { Field } from '../components/common/Field';
import { TaskCard } from '../components/feature/TaskCard';
import { SyncBanner } from '../components/feature/SyncBanner';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'created', label: 'Date added' }, { value: 'due', label: 'Due date' }, { value: 'status', label: 'Status' },
];
const FILTER_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' }, ...TASK_STATUSES.map(value => ({ value, label: STATUS_LABELS[value] })),
];
const keyExtractor = (task: Task) => task.id;

export default function TasksScreen() {
  const { styles } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tasks = useAppStore(state => state.tasks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [sort, setSort] = useState<SortOrder>('due');
  const visibleTasks = selectTasks(tasks, search, filter, sort);
  const active = tasks.filter(task => !task.deletedAt && ['new', 'in_progress'].includes(task.status));
  const openTask = (taskId: string) => navigation.navigate('TaskDetails', { taskId });
  const createTask = () => navigation.navigate('TaskForm');
  const renderTask = ({ item }: { item: Task }) => <TaskCard task={item} onOpen={openTask} />;
  return <View style={styles.screen}>
    <FlatList data={visibleTasks} keyExtractor={keyExtractor} renderItem={renderTask}
      keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.listHeader}>
        <View style={styles.hero}>
          <AppText variant="heading" style={styles.heroText}>Ready for the day.</AppText>
          <AppText style={styles.heroText}>{active.length} open {active.length === 1 ? 'task' : 'tasks'} · Every job in one place</AppText>
        </View>
        <SyncBanner />
        <Button label="＋ Create task" onPress={createTask} />
        <Field label="Search tasks" placeholder="Search title or address" value={search} onChangeText={setSearch} />
        <ChoiceChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} isScrollable />
        <AppText variant="label">Sort by</AppText>
        <ChoiceChips options={SORT_OPTIONS} value={sort} onChange={setSort} />
        <AppText variant="title">Your tasks · {visibleTasks.length}</AppText>
      </View>}
      ListEmptyComponent={<EmptyState title={search || filter !== 'all' ? 'No matching tasks' : 'A fresh start'}
        description={search || filter !== 'all' ? 'Try a different search or status filter.' : 'Create your first task. Add a location, a photo and a reminder — even offline.'} />} />
  </View>;
}
