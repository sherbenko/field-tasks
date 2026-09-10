import { useState } from 'react';
import { Image, View } from 'react-native';
import type { Attachment } from '../../types/task';
import { useTheme } from '../../theme/theme';
import { AppText } from '../common/AppText';
import { Button } from '../common/Button';

interface AttachmentPreviewProps { attachment: Attachment; onRemove?: (id: string) => void }

export function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
  const { styles } = useTheme();
  const [hasError, setHasError] = useState(false);
  const handleError = () => setHasError(true);
  const handleRemove = () => onRemove?.(attachment.id);
  return <View style={styles.card}>
    {hasError ? <View style={styles.banner}><AppText style={styles.bannerText}>
      Image unavailable. The original may have been removed or belongs to another device.
    </AppText></View> : <Image source={{ uri: attachment.uri }} style={styles.image}
      resizeMode="contain" onError={handleError} accessibilityLabel={`Attachment: ${attachment.name}`} />}
    <AppText variant="small" numberOfLines={2}>{attachment.name}</AppText>
    {onRemove && <Button label="Remove image" variant="secondary" onPress={handleRemove} />}
  </View>;
}
