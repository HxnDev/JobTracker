// Add/edit application form — one shared screen, mirroring the web dialog.
// Writes straight back to the Google Sheet via the shared client.

import type { Job } from '@jobtracker/shared';
import {
  createEmptyJob,
  formatDate,
  getNextJobId,
  JOB_SITE_OPTIONS,
  LANGUAGE_OPTIONS,
  LOCATION_SUGGESTIONS,
  parseSheetDate,
  STATUS_OPTIONS,
  WORK_MODE_OPTIONS,
} from '@jobtracker/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJobs, useSaveJob } from '@/hooks/useJobs';
import { colors, fonts, radius, sp } from '@/lib/theme';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function OptionPills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.pillWrap}>
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(active ? '' : option)}
            style={({ pressed }) => [
              styles.pill,
              active && styles.pillActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function JobForm() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ row?: string }>();
  const { data } = useJobs(false);
  const save = useSaveJob();

  const jobs = useMemo(() => data ?? [], [data]);
  const editing = useMemo(() => {
    const row = Number(params.row);
    return row ? jobs.find((j) => j.rowNumber === row) : undefined;
  }, [jobs, params.row]);

  const [form, setForm] = useState<Job>(() =>
    editing
      ? { ...editing, dateApplied: formatDate(editing.dateApplied) }
      : {
          ...createEmptyJob(),
          jobId: getNextJobId(jobs),
          status: 'Applied',
          dateApplied: formatDate(new Date()),
        }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof Job) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Required';
    if (!form.company.trim()) nextErrors.company = 'Required';
    if (form.dateApplied && !parseSheetDate(form.dateApplied)) {
      nextErrors.dateApplied = 'Use dd.mm.yyyy';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await save.mutateAsync(form);
      ToastAndroid.show(
        editing ? 'Application updated' : 'Application added',
        ToastAndroid.SHORT
      );
      router.back();
    } catch (err) {
      ToastAndroid.show(
        err instanceof Error ? err.message : 'Could not save to Google Sheets',
        ToastAndroid.LONG
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + sp(3) }]}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {editing ? 'Edit application' : 'Add application'}
          </Text>
          <Text style={styles.subtitle}>
            {editing
              ? `${form.jobId} — changes are written straight to your sheet.`
              : `New row with ID ${form.jobId}.`}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <X color={colors.textMuted} size={20} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Job Title" error={errors.jobTitle}>
          <TextInput
            value={form.jobTitle}
            onChangeText={set('jobTitle')}
            placeholder="e.g. Senior Full Stack Developer"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, errors.jobTitle && styles.inputError]}
          />
        </Field>

        <Field label="Company" error={errors.company}>
          <TextInput
            value={form.company}
            onChangeText={set('company')}
            placeholder="e.g. Proton Mail"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, errors.company && styles.inputError]}
          />
        </Field>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field label="Location">
              <TextInput
                value={form.location}
                onChangeText={set('location')}
                placeholder="e.g. Geneva"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
              <View style={styles.pillWrap}>
                {LOCATION_SUGGESTIONS.map((city) => {
                  const active = form.location === city;
                  return (
                    <Pressable
                      key={city}
                      onPress={() => set('location')(city)}
                      style={({ pressed }) => [
                        styles.pill,
                        active && styles.pillActive,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text
                        style={[styles.pillLabel, active && styles.pillLabelActive]}
                      >
                        {city}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          </View>
          <View style={styles.rowItem}>
            <Field label="Date Applied" error={errors.dateApplied}>
              <TextInput
                value={String(form.dateApplied)}
                onChangeText={set('dateApplied')}
                placeholder="dd.mm.yyyy"
                placeholderTextColor={colors.textFaint}
                keyboardType="numbers-and-punctuation"
                style={[styles.input, errors.dateApplied && styles.inputError]}
              />
            </Field>
          </View>
        </View>

        <Field label="Status">
          <OptionPills
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={set('status')}
          />
        </Field>

        <Field label="Work Mode">
          <OptionPills
            options={WORK_MODE_OPTIONS}
            value={form.workMode}
            onChange={set('workMode')}
          />
        </Field>

        <Field label="Language">
          <OptionPills
            options={LANGUAGE_OPTIONS}
            value={form.language}
            onChange={set('language')}
          />
        </Field>

        <Field label="Job Site">
          <OptionPills
            options={JOB_SITE_OPTIONS}
            value={form.jobSite}
            onChange={set('jobSite')}
          />
        </Field>

        <Field label="Job URL">
          <TextInput
            value={form.jobUrl}
            onChangeText={set('jobUrl')}
            placeholder="https://..."
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.input}
          />
        </Field>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + sp(3) }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={save.isPending}
          style={({ pressed }) => [
            styles.saveBtn,
            (pressed || save.isPending) && { opacity: 0.8 },
          ]}
        >
          {save.isPending ? (
            <ActivityIndicator color={colors.onPrimary} size="small" />
          ) : (
            <Text style={styles.saveLabel}>
              {editing ? 'Save changes' : 'Add application'}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: sp(5),
    paddingBottom: sp(3),
    gap: sp(3),
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  close: {
    padding: sp(1),
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: sp(5),
    paddingBottom: sp(6),
    gap: sp(4),
  },
  field: {
    gap: sp(1.5),
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  fieldError: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: sp(3),
    paddingVertical: sp(2.75),
  },
  inputError: {
    borderColor: colors.danger,
  },
  row: {
    flexDirection: 'row',
    gap: sp(3),
  },
  rowItem: {
    flex: 1,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sp(2),
  },
  pill: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingHorizontal: sp(3),
    paddingVertical: sp(1.75),
  },
  pillActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  pillLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  pillLabelActive: {
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: sp(3),
    paddingHorizontal: sp(5),
    paddingTop: sp(3),
    borderTopColor: colors.cardBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: sp(5),
    minHeight: 48,
  },
  cancelLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 48,
  },
  saveLabel: {
    color: colors.onPrimary,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
