import { View } from 'react-native';
import { useTheme } from '../../theme/theme';
import { AppText } from './AppText';

export function ErrorFallback() {
  const { styles } = useTheme();
  return <View style={[styles.screen, styles.center]}>
    <AppText variant="title">Something went wrong</AppText>
    <AppText>Please close and reopen Field Tasks. Your saved tasks are stored on this device.</AppText>
  </View>;
}
