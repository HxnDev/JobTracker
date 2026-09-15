import { useMemo, useState } from 'react';
import { Loader2, Inbox, Plus, EyeOff, Eye, Grid2X2, List } from 'lucide-react';
import { SummaryBar } from '@/components/jobs/SummaryBar';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobTable } from '@/components/jobs/JobTable';
import { Button } from '@/components/ui/button';
import { parseSheetDate } from '@jobtracker/shared';
import { cn } from '@/lib/utils';

const INITIAL_FILTERS = { status: '', workMode: '', location: '', jobSite: '' };

function compare(a, b, key) {
  if (key === 'dateApplied') {
    const da = parseSheetDate(a.dateApplied)?.getTime() ?? 0;
    const db = parseSheetDate(b.dateApplied)?.getTime() ?? 0;
    return da - db;
  }
  if (key === 'daysSinceApplied') {
    return (a.daysSinceApplied ?? 1e9) - (b.daysSinceApplied ?? 1e9);
  }
  return String(a[key] || '').localeCompare(String(b[key] || ''), undefined, {
    numeric: true,
  });
}

export function Jobs({ jobs, loading, error, onEdit, onAdd, onRetry }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sort, setSort] = useState({ key: 'dateApplied', dir: 'desc' });
  const [showRejected, setShowRejected] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  const locations = useMemo(
    () =>
      [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [jobs]
  );
  const jobSites = useMemo(
    () =>
      [...new Set(jobs.map((j) => j.jobSite).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [jobs]
  );

  const rejectedCount = useMemo(
    () => jobs.filter((j) => j.status === 'Rejected').length,
    [jobs]
  );

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Only hide rejected when the user isn't explicitly filtering for them.
    const hideRejected = !showRejected && filters.status !== 'Rejected';

    const filtered = jobs.filter((job) => {
      if (hideRejected && job.status === 'Rejected') return false;
      if (filters.status && job.status !== filters.status) return false;
      if (filters.workMode && job.workMode !== filters.workMode) return false;
      if (filters.location && job.location !== filters.location) return false;
      if (filters.jobSite && job.jobSite !== filters.jobSite) return false;
      if (q) {
        const hay =
          `${job.jobTitle} ${job.company} ${job.location} ${job.jobId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => compare(a, b, sort.key));
    return sort.dir === 'asc' ? sorted : sorted.reverse();
  }, [jobs, query, filters, sort, showRejected]);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setQuery('');
    setFilters(INITIAL_FILTERS);
  };

  const handleSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Applications</h2>
        <p className="mt-1 text-sm text-muted-foreground">Track, manage and never miss an opportunity.</p>
      </div>
      <SummaryBar jobs={jobs} />

      <div className="space-y-4">
        <JobFilters
          query={query}
          setQuery={setQuery}
          filters={filters}
          setFilter={setFilter}
          locations={locations}
          jobSites={jobSites}
          onClear={clearFilters}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {visibleJobs.length} of {jobs.length} applications
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {rejectedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowRejected((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1 transition-colors hover:text-foreground',
                  showRejected && 'bg-secondary/40 text-foreground'
                )}
              >
                {showRejected ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                {showRejected ? 'Hide' : 'Show'} rejected ({rejectedCount})
              </button>
            )}
            <label className="ml-1 hidden items-center gap-2 sm:flex">
              <span>Sort by</span>
              <select
                value={`${sort.key}:${sort.dir}`}
                onChange={(event) => {
                  const [key, dir] = event.target.value.split(':');
                  setSort({ key, dir });
                }}
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="dateApplied:desc">Date (newest)</option>
                <option value="dateApplied:asc">Date (oldest)</option>
                <option value="jobTitle:asc">Job title</option>
                <option value="company:asc">Company</option>
              </select>
            </label>
            <div className="hidden items-center rounded-lg border border-border bg-card p-0.5 md:flex">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn('rounded-md p-2 transition-colors', viewMode === 'list' ? 'bg-primary/15 text-primary' : 'hover:text-foreground')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn('rounded-md p-2 transition-colors', viewMode === 'grid' ? 'bg-primary/15 text-primary' : 'hover:text-foreground')}
                aria-label="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your sheet…
          </div>
        ) : error && jobs.length === 0 ? (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 py-20 text-center">
            <p className="font-medium text-destructive">Couldn’t load the sheet</p>
            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-border/70 py-20 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No applications match your filters</p>
            <Button variant="outline" onClick={onAdd}>
              <Plus className="h-4 w-4" />
              Add your first job
            </Button>
          </div>
        ) : (
          <JobTable
            jobs={visibleJobs}
            sort={sort}
            onSort={handleSort}
            onEdit={onEdit}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}
