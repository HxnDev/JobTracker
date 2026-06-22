// Dropdown options + the canonical display values. The sheet is messy (e.g.
// "Hybird"), so reads are normalized but these are what we write back.

export const STATUS_OPTIONS = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Ghosted',
];

export const WORK_MODE_OPTIONS = ['On-Site', 'Hybrid', 'Remote'];

export const LANGUAGE_OPTIONS = ['English', 'French', 'German', 'Italian'];

export const JOB_SITE_OPTIONS = [
  'Indeed',
  'LinkedIn',
  'Jobs.ch',
  'Company Site',
  'Other',
];

// Visual treatment per status (Tailwind classes for badges).
export const STATUS_STYLES = {
  Applied: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  Screening: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  Interview: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  Offer: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Rejected: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  Ghosted: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
  Unknown: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
};

export const WORK_MODE_STYLES = {
  Remote: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  Hybrid: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/25',
  'On-Site': 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
  Unknown: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/25',
};

// Maps known messy values in the sheet to canonical display values.
export const WORK_MODE_ALIASES = {
  hybird: 'Hybrid',
  hybrid: 'Hybrid',
  'on-site': 'On-Site',
  onsite: 'On-Site',
  'on site': 'On-Site',
  remote: 'Remote',
};

export function normalizeWorkMode(raw) {
  if (!raw) return '';
  const key = String(raw).trim().toLowerCase();
  return WORK_MODE_ALIASES[key] || String(raw).trim();
}
