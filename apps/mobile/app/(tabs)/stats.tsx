// Stats dashboard — mirrors the web app's Dashboard, computed by the shared
// computeAnalytics and rendered with lightweight native charts.

import {
  computeAnalytics,
  LANGUAGE_COLORS,
  STATUS_COLORS,
  WORK_MODE_COLORS,
} from '@jobtracker/shared';
import {
  Activity,
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  Flame,
  Hourglass,
  MapPin,
  MessageSquareReply,
  Timer,
  TrendingUp,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartCard, Donut, HBars, Legend, VBars } from '@/components/charts';
import { Screen } from '@/components/Screen';
import { useJobs } from '@/hooks/useJobs';
import { colors, fonts, radius, sp } from '@/lib/theme';

const FUNNEL_COLORS = ['#6366f1', '#38bdf8', '#a78bfa', '#34d399'];

interface IconProps {
  color: string;
  size: number;
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: ComponentType<IconProps>;
  label: string;
  value: string | number;
  sub?: string;
  tint: string;
}) {
  return (
    <View style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: `${tint}26` }]}>
        <Icon color={tint} size={17} />
      </View>
      <View style={styles.kpiText}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
        {sub ? (
          <Text style={styles.kpiSub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<IconProps>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.factRow}>
      <View style={styles.factLabelWrap}>
        <Icon color={colors.primary} size={14} />
        <Text style={styles.factLabel}>{label}</Text>
      </View>
      <Text style={styles.factValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function Stats() {
  const insets = useSafeAreaInsets();
  const { data, isPending, isRefetching, refetch } = useJobs();
  const jobs = data ?? [];

  const a = useMemo(() => computeAnalytics(jobs), [jobs]);

  const statusSegments = a.byStatus.map((s) => ({
    ...s,
    color: STATUS_COLORS[s.name] ?? STATUS_COLORS.Unknown,
  }));
  const workModeSegments = a.byWorkMode.map((s) => ({
    ...s,
    color: WORK_MODE_COLORS[s.name] ?? WORK_MODE_COLORS.Unknown,
  }));
  const languageSegments = a.byLanguage.map((s) => ({
    ...s,
    color: LANGUAGE_COLORS[s.name] ?? LANGUAGE_COLORS.Unknown,
  }));

  return (
    <Screen>
      <View style={[styles.titleRow, { paddingTop: insets.top + sp(4) }]}>
        <Text style={styles.title}>Stats</Text>
      </View>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.centerText}>
            Nothing to analyze yet — add applications first.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + sp(6) },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.cardSolid}
            />
          }
        >
          <View style={styles.kpiGrid}>
            <Kpi
              icon={Briefcase}
              label="Total"
              value={a.total}
              sub={`${a.applied} awaiting reply`}
              tint={colors.primary}
            />
            <Kpi
              icon={MessageSquareReply}
              label="Response rate"
              value={`${a.responseRate}%`}
              sub={`${a.rejected} rejected`}
              tint="#38bdf8"
            />
            <Kpi
              icon={TrendingUp}
              label="Interview rate"
              value={`${a.interviewRate}%`}
              sub={`${a.inProcess} in process`}
              tint="#a78bfa"
            />
            <Kpi
              icon={Award}
              label="Offers"
              value={a.offers}
              sub={`${a.facts.activeShare}% still active`}
              tint="#e879f9"
            />
            <Kpi
              icon={CalendarClock}
              label="This week"
              value={a.thisWeek}
              sub="last 7 days"
              tint="#34d399"
            />
            <Kpi
              icon={Timer}
              label="Avg age"
              value={`${a.avgDays}d`}
              sub="since applying"
              tint="#fbbf24"
            />
          </View>

          <ChartCard title="Applications over time" subtitle="Per week">
            <VBars
              data={a.timeline.slice(-12).map((t) => ({
                label: t.week,
                value: t.count,
              }))}
            />
          </ChartCard>

          <ChartCard title="Status breakdown" subtitle="Where things stand">
            <View style={styles.donutWrap}>
              <Donut
                segments={statusSegments}
                centerLabel={String(a.total)}
                centerSub="total"
              />
            </View>
            <Legend segments={statusSegments} />
          </ChartCard>

          <ChartCard title="Top locations" subtitle="Where you're applying">
            <HBars
              data={a.byLocation.slice(0, 6).map((l) => ({
                label: l.name,
                value: l.value,
                color: '#38bdf8',
              }))}
            />
          </ChartCard>

          <ChartCard title="Work mode" subtitle="Remote vs hybrid vs on-site">
            <View style={styles.donutWrap}>
              <Donut segments={workModeSegments} size={130} strokeWidth={20} />
            </View>
            <Legend segments={workModeSegments} />
          </ChartCard>

          <ChartCard title="By job site" subtitle="Where you find roles">
            <HBars
              data={a.byJobSite.slice(0, 6).map((s) => ({
                label: s.name,
                value: s.value,
                color: '#a78bfa',
              }))}
            />
          </ChartCard>

          <ChartCard title="Application pipeline" subtitle="From applied to offer">
            <HBars
              data={a.funnel.map((f, i) => ({
                label: f.stage,
                value: f.value,
                color: FUNNEL_COLORS[i],
              }))}
            />
          </ChartCard>

          <ChartCard title="Language" subtitle="Role language">
            <View style={styles.donutWrap}>
              <Donut segments={languageSegments} size={130} strokeWidth={20} />
            </View>
            <Legend segments={languageSegments} />
          </ChartCard>

          <ChartCard title="Quick facts" subtitle="At a glance">
            <View>
              <Fact
                icon={MapPin}
                label="Top location"
                value={
                  a.facts.topLocation
                    ? `${a.facts.topLocation.name} (${a.facts.topLocation.value})`
                    : '—'
                }
              />
              <Fact
                icon={Building2}
                label="Top job site"
                value={
                  a.facts.topSite
                    ? `${a.facts.topSite.name} (${a.facts.topSite.value})`
                    : '—'
                }
              />
              <Fact
                icon={Flame}
                label="Busiest week"
                value={
                  a.facts.busiestWeek
                    ? `${a.facts.busiestWeek.week} (${a.facts.busiestWeek.count})`
                    : '—'
                }
              />
              <Fact icon={Activity} label="Last applied" value={a.facts.latest} />
              <Fact
                icon={Hourglass}
                label="Longest open"
                value={
                  a.facts.oldestOpen
                    ? `${a.facts.oldestOpen.label} · ${a.facts.oldestOpen.days}d`
                    : '—'
                }
              />
            </View>
          </ChartCard>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    paddingHorizontal: sp(5),
    paddingBottom: sp(3),
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  scroll: {
    paddingHorizontal: sp(4),
    gap: sp(3),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sp(8),
  },
  centerText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sp(3),
  },
  kpi: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(2.5),
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: sp(3),
  },
  kpiIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  kpiText: {
    flex: 1,
    gap: 0,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 19,
    fontVariant: ['tabular-nums'],
  },
  kpiSub: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  donutWrap: {
    alignItems: 'center',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sp(3),
    paddingVertical: sp(2.5),
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  factLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(2),
  },
  factLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
  factValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
});
