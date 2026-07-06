import { StyleSheet, Text, View } from 'react-native';
import { chipColors, fonts, radius, statusColors, workModeColors } from '@/lib/theme';

export function StatusPill({ status }: { status: string }) {
  const hex = statusColors[status] ?? statusColors.Unknown;
  const chip = chipColors(hex);
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: chip.backgroundColor, borderColor: chip.borderColor },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: hex }]} />
      <Text style={[styles.label, { color: hex }]}>{status || '—'}</Text>
    </View>
  );
}

export function WorkModePill({ mode }: { mode: string }) {
  if (!mode) return null;
  const hex = workModeColors[mode] ?? workModeColors.Unknown;
  const chip = chipColors(hex);
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: chip.backgroundColor, borderColor: chip.borderColor },
      ]}
    >
      <Text style={[styles.label, { color: hex }]}>{mode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
