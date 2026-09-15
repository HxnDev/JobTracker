import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { daysSince } from '@jobtracker/shared';
import { BarChart3, Clock3, FileText, Send, XCircle } from 'lucide-react';

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

const Stat = ({ icon: Icon, label, value, accent, iconBg }) => (
  <div className="glass flex items-center gap-4 rounded-xl border border-border/80 px-4 py-4">
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
      <Icon className={`h-5 w-5 ${accent}`} />
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
    </span>
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
      <Stat icon={FileText} label="Total" value={stats.total} accent="text-slate-300" iconBg="bg-slate-400/10" />
      <Stat icon={Send} label="Applied" value={stats.applied} accent="text-primary" iconBg="bg-primary/10" />
      <Stat icon={Clock3} label="In Process" value={stats.inProcess} accent="text-amber-300" iconBg="bg-amber-400/10" />
      <Stat icon={XCircle} label="Rejected" value={stats.rejected} accent="text-rose-400" iconBg="bg-rose-400/10" />
      <Stat icon={BarChart3} label="This Week" value={stats.thisWeek} accent="text-emerald-300" iconBg="bg-emerald-400/10" />
    </motion.div>
  );
}
