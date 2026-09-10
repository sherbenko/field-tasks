import type { TextProps } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '../../theme/theme';

interface AppTextProps extends TextProps {
  variant?: 'text' | 'small' | 'caption' | 'title' | 'heading' | 'display' | 'label';
}

export function AppText({ variant = 'text', style, ...props }: AppTextProps) {
  const { styles } = useTheme();
  return <Text {...props} style={[styles[variant], style]} />;
}
