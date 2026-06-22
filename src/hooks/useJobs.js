import { useCallback, useEffect, useState } from 'react';
import { fetchJobs, addJob, updateJob } from '@/services/googleSheets';

export function useJobs(enabled) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs();
      setJobs(data);
      setLastSync(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load jobs.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) load().catch(() => {});
  }, [enabled, load]);

  const saveJob = useCallback(async (job) => {
    setSaving(true);
    try {
      if (job.rowNumber) {
        const saved = await updateJob(job);
        setJobs((prev) =>
          prev.map((j) => (j.rowNumber === saved.rowNumber ? { ...j, ...saved } : j))
        );
        return saved;
      }
      const saved = await addJob(job);
      setJobs((prev) =>
        [...prev, saved].sort((a, b) => (a.rowNumber || 0) - (b.rowNumber || 0))
      );
      return saved;
    } finally {
      setSaving(false);
    }
  }, []);

  return { jobs, loading, saving, error, lastSync, refresh: load, saveJob };
}
