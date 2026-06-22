import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { daysSince } from '@/utils/dates';

function computeStats(jobs) {
  const interviewing = new Set(['Screening', 'Interview', 'Offer']);
  let applied = 0;
  let inProcess = 0;
  let rejected = 0;
  let thisWeek = 0;
  for (const job of jobs) {
    const s = job.status;
    if (s === 'Applied') applied += 1;
    if (interviewing.has(s)) inProcess += 1;
    if (s === 'Rejected' || s === 'Ghosted') rejected += 1;
    const d = daysSince(job.dateApplied);
    if (d !== null && d <= 7) thisWeek += 1;
  }
  return { total: jobs.length, applied, inProcess, rejected, thisWeek };
}

const Stat = ({ label, value, accent }) => (
  <div className="glass flex flex-col rounded-xl border border-border/70 px-4 py-3">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}</span>
  </div>
);

export function SummaryBar({ jobs }) {
  const stats = useMemo(() => computeStats(jobs), [jobs]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      <Stat label="Total" value={stats.total} accent="text-foreground" />
      <Stat label="Applied" value={stats.applied} accent="text-sky-300" />
      <Stat label="In process" value={stats.inProcess} accent="text-violet-300" />
      <Stat label="Rejected" value={stats.rejected} accent="text-rose-300" />
      <Stat label="This week" value={stats.thisWeek} accent="text-emerald-300" />
    </motion.div>
  );
}
