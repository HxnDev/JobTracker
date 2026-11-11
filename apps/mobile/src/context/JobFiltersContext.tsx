import { createContext, useContext, useMemo, useState } from 'react';

export interface JobFilters {
  status: string;
  month: string;
  location: string;
  jobSite: string;
}

type FilterKey = keyof JobFilters;

interface JobFiltersContextValue {
  filters: JobFilters;
  setFilter: (key: FilterKey, value: string) => void;
  clearFilters: () => void;
}

const EMPTY_FILTERS: JobFilters = {
  status: '',
  month: '',
  location: '',
  jobSite: '',
};

const JobFiltersContext = createContext<JobFiltersContextValue | null>(null);

export function JobFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const value = useMemo(
    () => ({
      filters,
      setFilter: (key: FilterKey, filterValue: string) =>
        setFilters((current) => ({ ...current, [key]: filterValue })),
      clearFilters: () => setFilters(EMPTY_FILTERS),
    }),
    [filters]
  );

  return (
    <JobFiltersContext.Provider value={value}>
      {children}
    </JobFiltersContext.Provider>
  );
}

export function useJobFilters() {
  const context = useContext(JobFiltersContext);
  if (!context) {
    throw new Error('useJobFilters must be used inside JobFiltersProvider');
  }
  return context;
}
