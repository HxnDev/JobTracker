import { lazy, Suspense, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Jobs } from '@/pages/Jobs';
import { JobFormDialog } from '@/components/jobs/JobFormDialog';
import { useJobs } from '@/hooks/useJobs';
import { getNextJobId, createEmptyJob } from '@/utils/jobs';

// Charts (recharts) are heavy — only load them when the Dashboard is opened.
const Dashboard = lazy(() =>
  import('@/components/dashboard/Dashboard').then((m) => ({ default: m.Dashboard }))
);

export function AppShell({ onSignOut }) {
  const { jobs, loading, saving, error, lastSync, refresh, saveJob } = useJobs(true);

  const [view, setView] = useState('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing({
      ...createEmptyJob(),
      jobId: getNextJobId(jobs),
      status: 'Applied',
    });
    setDialogOpen(true);
  };

  const openEdit = (job) => {
    setEditing(job);
    setDialogOpen(true);
  };

  const handleSave = async (job) => {
    const isEdit = Boolean(job.rowNumber);
    try {
      await saveJob(job);
      toast.success(isEdit ? 'Application updated' : 'Application added', {
        description: `${job.jobTitle} · ${job.company}`,
      });
    } catch (err) {
      toast.error('Could not save to Google Sheets', { description: err.message });
      throw err;
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Synced with Google Sheets');
    } catch (err) {
      toast.error('Refresh failed', { description: err.message });
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        view={view}
        onViewChange={setView}
        onAdd={openAdd}
        onRefresh={handleRefresh}
        onSignOut={onSignOut}
        loading={loading}
        lastSync={lastSync}
      />

      <main className="container space-y-6 py-6">
        {view === 'dashboard' ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading dashboard…
              </div>
            }
          >
            <Dashboard jobs={jobs} />
          </Suspense>
        ) : (
          <Jobs
            jobs={jobs}
            loading={loading}
            error={error}
            onEdit={openEdit}
            onAdd={openAdd}
            onRetry={handleRefresh}
          />
        )}
      </main>

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        job={editing}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
