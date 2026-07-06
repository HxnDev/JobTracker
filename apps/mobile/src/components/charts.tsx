// Lightweight chart primitives: an SVG donut plus view-based bar charts.

import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, radius, sp } from '@/lib/theme';

export interface Segment {
  name: string;
  value: number;
  color: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Donut({
  segments,
  size = 150,
  strokeWidth = 24,
  centerLabel,
  centerSub,
}: {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = segments.length > 1 ? 3 : 0;

  let acc = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total;
      const len = Math.max(frac * circumference - gap, 1);
      const offset = -acc * circumference;
      acc += frac;
      return { ...s, len, offset };
    });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {arcs.map((arc) => (
          <Circle
            key={arc.name}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.len} ${circumference - arc.len}`}
            strokeDashoffset={arc.offset}
            fill="none"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        ))}
      </Svg>
      <View style={styles.donutCenter}>
        {centerLabel ? <Text style={styles.donutValue}>{centerLabel}</Text> : null}
        {centerSub ? <Text style={styles.donutSub}>{centerSub}</Text> : null}
      </View>
    </View>
  );
}

export function Legend({ segments }: { segments: Segment[] }) {
  return (
    <View style={styles.legend}>
      {segments.map((s) => (
        <View key={s.name} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: s.color }]} />
          <Text style={styles.legendLabel}>
            {s.name} <Text style={styles.legendValue}>({s.value})</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Vertical bars, e.g. applications per week. */
export function VBars({
  data,
  height = 120,
  color = colors.primary,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const showEvery = data.length > 7 ? 2 : 1;
  return (
    <View style={[styles.vbars, { height: height + 26 }]}>
      {data.map((d, i) => (
        <View key={`${d.label}-${i}`} style={styles.vbarCol}>
          <Text style={styles.vbarValue}>{d.value > 0 ? d.value : ''}</Text>
          <View
            style={[
              styles.vbar,
              {
                height: Math.max((d.value / max) * height, 3),
                backgroundColor: color,
              },
            ]}
          />
          <Text style={styles.vbarLabel} numberOfLines={1}>
            {i % showEvery === 0 ? d.label : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Horizontal bars, e.g. top locations / funnel. */
export function HBars({
  data,
}: {
  data: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.hbars}>
      {data.map((d, i) => (
        <View key={`${d.label}-${i}`} style={styles.hbarRow}>
          <Text style={styles.hbarLabel} numberOfLines={1}>
            {d.label}
          </Text>
          <View style={styles.hbarTrack}>
            <View
              style={[
                styles.hbarFill,
                {
                  width: `${Math.max((d.value / max) * 100, 2)}%`,
                  backgroundColor: d.color ?? colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.hbarValue}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: sp(4),
    gap: sp(4),
  },
  cardHeader: {
    gap: 1,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    fontVariant: ['tabular-nums'],
  },
  donutSub: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: sp(3.5),
    rowGap: sp(1.5),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(1.5),
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  legendValue: {
    color: colors.textMuted,
  },
  vbars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sp(1),
  },
  vbarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  vbar: {
    alignSelf: 'stretch',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  vbarValue: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 9,
    marginBottom: 2,
  },
  vbarLabel: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    marginTop: 3,
  },
  hbars: {
    gap: sp(2.5),
  },
  hbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(2),
  },
  hbarLabel: {
    width: 92,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  hbarTrack: {
    flex: 1,
    height: 14,
    backgroundColor: colors.cardSolid,
    borderRadius: 7,
    overflow: 'hidden',
  },
  hbarFill: {
    height: '100%',
    borderRadius: 7,
  },
  hbarValue: {
    minWidth: 22,
    textAlign: 'right',
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontVariant: ['tabular-nums'],
  },
});
