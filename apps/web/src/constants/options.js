// Web-only visual treatment (Tailwind classes). The option lists themselves
// live in @jobtracker/shared.

export const STATUS_STYLES = {
  Applied: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Screening: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  Interview: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  Offer: 'bg-purple-500/15 text-purple-300 ring-purple-500/30',
  Rejected: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  Ghosted: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
  Unknown: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
};

export const WORK_MODE_STYLES = {
  Remote: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  Hybrid: 'bg-slate-500/15 text-slate-300 ring-slate-500/25',
  'On-Site': 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
  Unknown: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/25',
};
