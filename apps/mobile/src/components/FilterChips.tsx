import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, sp } from '@/lib/theme';

interface Props {
  options: string[];
  /** Empty string means "All". */
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
}

export function FilterChips({ options, value, onChange, allLabel = 'All' }: Props) {
  const items = ['', ...options];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option || '__all__'}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option || allLabel}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: sp(2),
    paddingHorizontal: sp(4),
  },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingHorizontal: sp(3.5),
    paddingVertical: sp(1.75),
  },
  chipActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  labelActive: {
    color: colors.primary,
  },
});
