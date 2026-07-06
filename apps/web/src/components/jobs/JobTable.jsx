import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Pencil } from 'lucide-react';
import { StatusBadge, WorkModeBadge } from '@/components/jobs/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@jobtracker/shared';
import { cn } from '@/lib/utils';

function SortHeader({ label, sortKey, sort, onSort, className }) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={cn('px-3 py-3 text-left font-medium', className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1.5 transition-colors hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

function JobLink({ url }) {
  if (!url) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
    >
      Open <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export function JobTable({ jobs, sort, onSort, onEdit }) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/70 glass md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/70 bg-secondary/30 text-xs uppercase tracking-wide">
              <tr>
                <SortHeader label="ID" sortKey="jobId" sort={sort} onSort={onSort} />
                <SortHeader
                  label="Date"
                  sortKey="dateApplied"
                  sort={sort}
                  onSort={onSort}
                />
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                  Role
                </th>
                <SortHeader
                  label="Company"
                  sortKey="company"
                  sort={sort}
                  onSort={onSort}
                />
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                  Location
                </th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                  Mode
                </th>
                <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />
                <SortHeader
                  label="Days"
                  sortKey="daysSinceApplied"
                  sort={sort}
                  onSort={onSort}
                  className="text-right"
                />
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                  Link
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const rejected = job.status === 'Rejected';
                return (
                <tr
                  key={job.rowNumber}
                  className="border-b border-border/40 transition-colors last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                    {job.jobId || '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {formatDate(job.dateApplied) || '—'}
                  </td>
                  <td className="max-w-[260px] px-3 py-3">
                    <span
                      className={cn(
                        'line-clamp-2 font-medium',
                        rejected ? 'text-rose-400' : 'text-foreground'
                      )}
                    >
                      {job.jobTitle || '—'}
                    </span>
                  </td>
                  <td className={cn('px-3 py-3', rejected && 'text-rose-400/90')}>
                    {job.company || '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {job.location || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <WorkModeBadge mode={job.workMode} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {job.daysSinceApplied ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    <JobLink url={job.jobUrl} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(job)}
                      aria-label={`Edit ${job.jobId}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {jobs.map((job) => (
          <button
            key={job.rowNumber}
            onClick={() => onEdit(job)}
            className="glass rounded-xl border border-border/70 p-4 text-left transition-colors active:bg-secondary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={cn(
                    'truncate font-semibold',
                    job.status === 'Rejected' ? 'text-rose-400' : 'text-foreground'
                  )}
                >
                  {job.jobTitle || '—'}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {job.company} {job.location ? `· ${job.location}` : ''}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{job.jobId}</span>
              <span>·</span>
              <span>{formatDate(job.dateApplied)}</span>
              {job.daysSinceApplied != null && (
                <>
                  <span>·</span>
                  <span>{job.daysSinceApplied}d ago</span>
                </>
              )}
              <WorkModeBadge mode={job.workMode} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
