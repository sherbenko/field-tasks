import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import type { Attachment } from '../types/task';

export async function pickImage(): Promise<Attachment | undefined> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Allow photo access to attach an image. You can change this in Android settings.');
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: false,
  });
  if (result.canceled) return;
  const asset = result.assets[0];
  const id = Crypto.randomUUID();
  const directory = `${FileSystem.documentDirectory}attachments/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const extension = asset.mimeType === 'image/png' ? 'png' : asset.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const uri = `${directory}${id}.${extension}`;
  await FileSystem.copyAsync({ from: asset.uri, to: uri });
  return { id, uri, name: asset.fileName || `Photo.${extension}`, mimeType: asset.mimeType || 'image/jpeg' };
}
