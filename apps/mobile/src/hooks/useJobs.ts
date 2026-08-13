import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Job } from '@jobtracker/shared';
import { sheetsClient } from '@/lib/sheets';

const JOBS_KEY = ['jobs'];

export function useJobs(enabled = true) {
  return useQuery({
    queryKey: JOBS_KEY,
    queryFn: () => sheetsClient.fetchJobs(),
    enabled,
    staleTime: 60_000,
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: Job) =>
      job.rowNumber ? sheetsClient.updateJob(job) : sheetsClient.addJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: Job) => sheetsClient.deleteJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });
}
