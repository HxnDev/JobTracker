import type { Job } from '@jobtracker/shared';
import { daysSince } from '@jobtracker/shared';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, sp } from '@/lib/theme';

const IN_PROCESS = new Set(['Screening', 'Interview', 'Offer']);

function computeStats(jobs: Job[]) {
  let applied = 0;
  let inProcess = 0;
  let closed = 0;
  let thisWeek = 0;
  for (const job of jobs) {
    const s = job.status;
    if (s === 'Applied') applied += 1;
    if (IN_PROCESS.has(s)) inProcess += 1;
    if (s === 'Rejected' || s === 'Ghosted') closed += 1;
    const d = daysSince(job.dateApplied);
    if (d !== null && d <= 7) thisWeek += 1;
  }
  return { total: jobs.length, applied, inProcess, closed, thisWeek };
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function SummaryBar({ jobs }: { jobs: Job[] }) {
  const stats = useMemo(() => computeStats(jobs), [jobs]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Stat label="Total" value={stats.total} color={colors.text} />
      <Stat label="Applied" value={stats.applied} color="#38bdf8" />
      <Stat label="In process" value={stats.inProcess} color="#a78bfa" />
      <Stat label="Rejected" value={stats.closed} color="#fb7185" />
      <Stat label="This week" value={stats.thisWeek} color="#34d399" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: sp(2),
    paddingHorizontal: sp(4),
  },
  stat: {
    minWidth: 86,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: sp(3),
    paddingVertical: sp(2.5),
    gap: 1,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
