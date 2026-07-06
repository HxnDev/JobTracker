// Applications: search, status/work-mode filters, summary bar, hide-rejected
// toggle — parity with the web app's Applications view (edit form is phase 3).

import type { Job } from '@jobtracker/shared';
import {
  parseSheetDate,
  STATUS_OPTIONS,
  WORK_MODE_OPTIONS,
} from '@jobtracker/shared';
import { router } from 'expo-router';
import { Eye, EyeOff, Plus, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterChips } from '@/components/FilterChips';
import { JobCard } from '@/components/JobCard';
import { Screen } from '@/components/Screen';
import { SummaryBar } from '@/components/SummaryBar';
import { useJobs } from '@/hooks/useJobs';
import { colors, fonts, radius, sp } from '@/lib/theme';

function sortByDateDesc(jobs: Job[]) {
  return [...jobs].sort((a, b) => {
    const da = parseSheetDate(a.dateApplied)?.getTime() ?? 0;
    const db = parseSheetDate(b.dateApplied)?.getTime() ?? 0;
    return db - da;
  });
}

export default function Applications() {
  const insets = useSafeAreaInsets();
  const { data, isPending, isRefetching, error, refetch } = useJobs();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [showRejected, setShowRejected] = useState(true);

  const jobs = data ?? [];

  const rejectedCount = useMemo(
    () => jobs.filter((j) => j.status === 'Rejected').length,
    [jobs]
  );

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Only hide rejected when the user isn't explicitly filtering for them.
    const hideRejected = !showRejected && status !== 'Rejected';

    const filtered = jobs.filter((job) => {
      if (hideRejected && job.status === 'Rejected') return false;
      if (status && job.status !== status) return false;
      if (workMode && job.workMode !== workMode) return false;
      if (q) {
        const hay =
          `${job.jobTitle} ${job.company} ${job.location} ${job.jobId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return sortByDateDesc(filtered);
  }, [jobs, query, status, workMode, showRejected]);

  const header = (
    <View style={styles.headerBlock}>
      <SummaryBar jobs={jobs} />

      <View style={styles.searchWrap}>
        <Search color={colors.textFaint} size={16} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search title, company, location…"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <X color={colors.textMuted} size={16} />
          </Pressable>
        )}
      </View>

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <FilterChips
        options={WORK_MODE_OPTIONS}
        value={workMode}
        onChange={setWorkMode}
        allLabel="All modes"
      />

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {visibleJobs.length} of {jobs.length} applications
        </Text>
        {rejectedCount > 0 && (
          <Pressable
            onPress={() => setShowRejected((v) => !v)}
            style={({ pressed }) => [
              styles.rejectedToggle,
              showRejected && styles.rejectedToggleOn,
              pressed && { opacity: 0.7 },
            ]}
          >
            {showRejected ? (
              <Eye color={colors.text} size={13} />
            ) : (
              <EyeOff color={colors.textMuted} size={13} />
            )}
            <Text
              style={[
                styles.rejectedToggleText,
                showRejected && { color: colors.text },
              ]}
            >
              {showRejected ? 'Hide' : 'Show'} rejected ({rejectedCount})
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={[styles.titleRow, { paddingTop: insets.top + sp(4) }]}>
        <Text style={styles.title}>Applications</Text>
      </View>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.centerText}>Loading your sheet…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn’t load the sheet</Text>
          <Text style={styles.centerText}>{error.message}</Text>
          <Pressable onPress={() => refetch()} style={styles.retry}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleJobs}
          keyExtractor={(job) => String(job.rowNumber)}
          renderItem={({ item, index }) => (
            <JobCard
              job={item}
              index={index}
              onPress={(job) =>
                router.push({
                  pathname: '/job-form',
                  params: { row: String(job.rowNumber) },
                })
              }
            />
          )}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.list,
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
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.centerText}>
                No applications match your filters.
              </Text>
            </View>
          }
        />
      )}

      {!isPending && !error && (
        <Pressable
          onPress={() => router.push('/job-form')}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + sp(5) },
            pressed && { transform: [{ scale: 0.94 }] },
          ]}
        >
          <Plus color={colors.onPrimary} size={24} strokeWidth={2.5} />
        </Pressable>
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
  headerBlock: {
    gap: sp(3),
    marginHorizontal: -sp(4), // let horizontal scrollers bleed full-width
    marginBottom: sp(3),
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(2),
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: sp(3),
    marginHorizontal: sp(4),
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: sp(2.5),
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(4),
  },
  countText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  rejectedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(1.5),
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: sp(2.5),
    paddingVertical: sp(1.25),
  },
  rejectedToggleOn: {
    backgroundColor: colors.cardSolid,
  },
  rejectedToggleText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },
  list: {
    paddingHorizontal: sp(4),
    gap: sp(3),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(3),
    paddingVertical: sp(16),
    paddingHorizontal: sp(8),
  },
  centerText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.danger,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  retry: {
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: sp(5),
    paddingVertical: sp(2.5),
    marginTop: sp(2),
  },
  retryLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: sp(5),
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
