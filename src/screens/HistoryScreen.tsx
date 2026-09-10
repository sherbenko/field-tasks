import { FlatList, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import type { HistoryEntry } from '../types/task';
import { useTheme } from '../theme/theme';
import { AppText } from '../components/common/AppText';
import { EmptyState } from '../components/common/EmptyState';
import { HistoryCard } from '../components/feature/HistoryCard';

const keyExtractor = (entry: HistoryEntry) => entry.id;
const renderEntry = ({ item }: { item: HistoryEntry }) => <HistoryCard entry={item} />;

export default function HistoryScreen() {
  const history = useAppStore(state => state.history);
  const { styles } = useTheme();
  return <View style={styles.screen}>
    <FlatList data={history} keyExtractor={keyExtractor} renderItem={renderEntry} contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.listHeader}>
        <AppText variant="heading">Every action, recorded.</AppText>
        <AppText variant="small">A persistent timeline of your tasks, changes and synchronization.</AppText>
      </View>}
      ListEmptyComponent={<EmptyState title="Your story starts here" description="Create a task to see its activity. History remains available after tasks are deleted." />} />
  </View>;
}
