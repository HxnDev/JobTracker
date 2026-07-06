import { parseSheetDate, daysSince, formatDate } from './dates.js';
import {
  STATUS_OPTIONS,
  WORK_MODE_OPTIONS,
  LANGUAGE_OPTIONS,
} from './options.js';

const IN_PROCESS = new Set(['Screening', 'Interview', 'Offer']);
const RESPONSE = new Set(['Screening', 'Interview', 'Offer', 'Rejected']);

function countBy(jobs, key, order) {
  const map = new Map();
  for (const job of jobs) {
    const value = (job[key] || 'Unknown').trim() || 'Unknown';
    map.set(value, (map.get(value) || 0) + 1);
  }
  let entries = [...map.entries()].map(([name, value]) => ({ name, value }));
  if (order) {
    entries = entries.sort(
      (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
    );
  } else {
    entries = entries.sort((a, b) => b.value - a.value);
  }
  return entries;
}

// Monday-based week start.
function weekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d;
}

function shortLabel(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function buildTimeline(jobs) {
  const buckets = new Map();
  for (const job of jobs) {
    const d = parseSheetDate(job.dateApplied);
    if (!d) continue;
    const ws = weekStart(d);
    const key = ws.getTime();
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0]);
  let cumulative = 0;
  return sorted.map(([ts, count]) => {
    cumulative += count;
    return { week: shortLabel(new Date(ts)), count, cumulative };
  });
}

/** @param {import('./schema.js').Job[]} jobs */
export function computeAnalytics(jobs) {
  const total = jobs.length;
  let applied = 0;
  let inProcess = 0;
  let offers = 0;
  let rejected = 0;
  let ghosted = 0;
  let responses = 0;
  let thisWeek = 0;
  let daysSum = 0;
  let daysCount = 0;
  let latest = null;
  let oldestOpen = null;

  for (const job of jobs) {
    const s = job.status;
    if (s === 'Applied') applied += 1;
    if (IN_PROCESS.has(s)) inProcess += 1;
    if (s === 'Offer') offers += 1;
    if (s === 'Rejected') rejected += 1;
    if (s === 'Ghosted') ghosted += 1;
    if (RESPONSE.has(s)) responses += 1;

    const date = parseSheetDate(job.dateApplied);
    if (date) {
      if (!latest || date > latest) latest = date;
      const open = s !== 'Rejected' && s !== 'Ghosted';
      if (open && (!oldestOpen || date < oldestOpen.date)) {
        oldestOpen = { date, job };
      }
    }

    const d = daysSince(job.dateApplied);
    if (d !== null) {
      if (d <= 7) thisWeek += 1;
      daysSum += d;
      daysCount += 1;
    }
  }

  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const byLocation = countBy(jobs, 'location');
  const byJobSite = countBy(jobs, 'jobSite');
  const timeline = buildTimeline(jobs);
  const busiestWeek = timeline.reduce(
    (best, w) => (w.count > (best?.count || 0) ? w : best),
    null
  );

  const funnel = [
    { stage: 'Applied', value: total },
    { stage: 'Responded', value: responses },
    { stage: 'In process', value: inProcess },
    { stage: 'Offers', value: offers },
  ];

  const facts = {
    topLocation: byLocation[0] || null,
    topSite: byJobSite[0] || null,
    busiestWeek,
    latest: latest ? formatDate(latest) : '—',
    oldestOpen: oldestOpen
      ? {
          label: `${oldestOpen.job.company || oldestOpen.job.jobTitle}`,
          days: daysSince(oldestOpen.job.dateApplied),
        }
      : null,
    activeShare: pct(total - rejected - ghosted),
  };

  return {
    total,
    applied,
    inProcess,
    offers,
    rejected,
    ghosted,
    thisWeek,
    responseRate: pct(responses),
    interviewRate: pct(inProcess),
    avgDays: daysCount ? Math.round(daysSum / daysCount) : 0,
    byStatus: countBy(jobs, 'status', STATUS_OPTIONS),
    byWorkMode: countBy(jobs, 'workMode', WORK_MODE_OPTIONS),
    byLanguage: countBy(jobs, 'language', LANGUAGE_OPTIONS),
    byJobSite,
    byLocation: byLocation.slice(0, 8),
    timeline,
    funnel,
    facts,
  };
}

// Chart/badge colors (hex, platform-agnostic — usable in web CSS and RN).
export const STATUS_COLORS = {
  Applied: '#38bdf8',
  Screening: '#fbbf24',
  Interview: '#a78bfa',
  Offer: '#34d399',
  Rejected: '#fb7185',
  Ghosted: '#a1a1aa',
  Unknown: '#71717a',
};

export const WORK_MODE_COLORS = {
  Remote: '#34d399',
  Hybrid: '#818cf8',
  'On-Site': '#fb923c',
  Unknown: '#71717a',
};

export const LANGUAGE_COLORS = {
  English: '#38bdf8',
  French: '#f472b6',
  German: '#facc15',
  Italian: '#4ade80',
  Unknown: '#71717a',
};
