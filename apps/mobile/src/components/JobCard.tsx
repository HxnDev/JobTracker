import type { Job } from '@jobtracker/shared';
import { formatDate } from '@jobtracker/shared';
import { ExternalLink } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusPill, WorkModePill } from '@/components/StatusPill';
import { colors, fonts, radius, sp } from '@/lib/theme';

interface Props {
  job: Job;
  index: number;
  onPress?: (job: Job) => void;
}

export function JobCard({ job, index, onPress }: Props) {
  const rejected = job.status === 'Rejected';
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 12) * 40).duration(320)}>
      <Pressable
        onPress={() => onPress?.(job)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text
              numberOfLines={1}
              style={[styles.title, rejected && { color: colors.danger }]}
            >
              {job.jobTitle || '—'}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {job.company}
              {job.location ? ` · ${job.location}` : ''}
            </Text>
          </View>
          <StatusPill status={job.status} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaMono}>{job.jobId}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{formatDate(job.dateApplied)}</Text>
          {job.daysSinceApplied != null && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.meta}>{job.daysSinceApplied}d ago</Text>
            </>
          )}
          <View style={styles.spacer} />
          <WorkModePill mode={job.workMode} />
          {Boolean(job.jobUrl) && (
            <Pressable
              onPress={() => Linking.openURL(job.jobUrl)}
              hitSlop={10}
              style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
            >
              <ExternalLink color={colors.primary} size={15} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: sp(4),
    gap: sp(3),
  },
  pressed: {
    backgroundColor: colors.cardSolid,
    transform: [{ scale: 0.985 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sp(3),
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(1.5),
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  metaMono: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  metaDot: {
    color: colors.textFaint,
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  linkButton: {
    marginLeft: sp(2),
    padding: 2,
  },
});
