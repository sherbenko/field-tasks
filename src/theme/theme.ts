import { StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const spacing = { tiny: 4, small: 8, medium: 12, large: 16, page: 24, section: 32, hero: 40 };
export const typography = { caption: 12, small: 14, body: 16, title: 20, heading: 28, display: 36 };
export const sizes = { tap: 48, icon: 22, smallIcon: 16, radius: 16, pill: 100, image: 180, map: 340 };
const light = {
  background: '#F3F5F4', surface: '#FFFFFF', text: '#162D27', muted: '#64736D', border: '#DCE4DF',
  primary: '#176348', onPrimary: '#FFFFFF', soft: '#E3F0E8', danger: '#B32F3D', dangerSoft: '#FBE8EA',
  warning: '#875400', warningSoft: '#FFF1D7', blue: '#245DC1', blueSoft: '#E7EEFC',
};
const dark: typeof light = {
  background: '#101B18', surface: '#1B2B25', text: '#EDF5EF', muted: '#A5B8AC', border: '#34483D',
  primary: '#92DBB5', onPrimary: '#112A1E', soft: '#254836', danger: '#FFA4AB', dangerSoft: '#472A30',
  warning: '#F6CB77', warningSoft: '#423820', blue: '#A4C2FF', blueSoft: '#283A55',
};

function createStyles(colors: typeof light) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.page, gap: spacing.large, paddingBottom: spacing.section },
    section: { gap: spacing.large },
    tight: { gap: spacing.small },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.medium },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.small, alignItems: 'center' },
    spread: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.medium },
    grow: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.page, gap: spacing.large },
    card: { backgroundColor: colors.surface, borderRadius: sizes.radius, padding: spacing.large, gap: spacing.medium, borderWidth: 1, borderColor: colors.border },
    hero: { backgroundColor: colors.primary, borderRadius: sizes.radius, padding: spacing.page, gap: spacing.medium },
    heroText: { color: colors.onPrimary },
    text: { fontSize: typography.body, lineHeight: typography.body * 1.5, color: colors.text },
    small: { fontSize: typography.small, lineHeight: typography.small * 1.5, color: colors.muted },
    caption: { fontSize: typography.caption, lineHeight: typography.caption * 1.5, color: colors.muted },
    title: { fontSize: typography.title, lineHeight: typography.title * 1.3, color: colors.text, fontWeight: '700' },
    heading: { fontSize: typography.heading, lineHeight: typography.heading * 1.2, color: colors.text, fontWeight: '700', letterSpacing: -0.5 },
    display: { fontSize: typography.display, color: colors.text, fontWeight: '700' },
    label: { fontSize: typography.small, color: colors.text, fontWeight: '600' },
    input: { minHeight: sizes.tap, borderRadius: spacing.medium, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, padding: spacing.medium, fontSize: typography.body },
    multiline: { minHeight: sizes.tap * 2.3, textAlignVertical: 'top' },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger },
    success: { color: colors.primary },
    button: { minHeight: sizes.tap, paddingHorizontal: spacing.large, paddingVertical: spacing.medium, borderRadius: spacing.medium, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.small, backgroundColor: colors.primary },
    secondaryButton: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
    dangerButton: { backgroundColor: colors.dangerSoft },
    buttonText: { fontSize: typography.body, fontWeight: '600', color: colors.onPrimary },
    secondaryButtonText: { color: colors.text },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.75 },
    chip: { minHeight: sizes.tap, paddingHorizontal: spacing.medium, paddingVertical: spacing.small, borderRadius: sizes.pill, justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    selectedChip: { backgroundColor: colors.soft, borderColor: colors.primary },
    badge: { alignSelf: 'flex-start', borderRadius: sizes.pill, paddingHorizontal: spacing.medium, paddingVertical: spacing.tiny, backgroundColor: colors.soft },
    badgeText: { fontSize: typography.caption, fontWeight: '700', color: colors.primary },
    progressBadge: { backgroundColor: colors.blueSoft },
    progressText: { color: colors.blue },
    cancelledBadge: { backgroundColor: colors.dangerSoft },
    banner: { borderRadius: spacing.medium, padding: spacing.medium, backgroundColor: colors.warningSoft, gap: spacing.small },
    bannerText: { color: colors.warning, fontSize: typography.small, lineHeight: typography.small * 1.5 },
    image: { width: '100%', height: sizes.image, borderRadius: spacing.medium, backgroundColor: colors.soft },
    map: { height: sizes.map, borderRadius: sizes.radius, overflow: 'hidden', backgroundColor: colors.soft },
    mapView: { flex: 1, backgroundColor: colors.soft },
    divider: { height: 1, backgroundColor: colors.border },
    list: { paddingHorizontal: spacing.page, paddingBottom: spacing.section, gap: spacing.medium },
    listHeader: { gap: spacing.large, paddingTop: spacing.page, paddingBottom: spacing.large },
    bottomBar: { padding: spacing.large, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
    tabBar: { backgroundColor: colors.surface, borderTopColor: colors.border },
    navigationHeader: { backgroundColor: colors.background },
    emptyIcon: { backgroundColor: colors.soft, borderRadius: sizes.pill, padding: spacing.page, alignSelf: 'center' },
    centeredText: { textAlign: 'center' },
  });
}

const lightStyles = createStyles(light);
const darkStyles = createStyles(dark);

export function useTheme() {
  const isDark = useAppStore(state => state.isDark);
  return { isDark, colors: isDark ? dark : light, styles: isDark ? darkStyles : lightStyles };
}
