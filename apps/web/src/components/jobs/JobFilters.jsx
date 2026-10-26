import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_OPTIONS } from '@jobtracker/shared';

const ALL = '__all__';

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectTrigger className="h-9 w-full text-xs sm:w-[150px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{`All ${label}`}</SelectItem>
        {options.map((opt) => (
          <SelectItem
            key={typeof opt === 'string' ? opt : opt.value}
            value={typeof opt === 'string' ? opt : opt.value}
          >
            {typeof opt === 'string' ? opt : opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function JobFilters({
  query,
  setQuery,
  filters,
  setFilter,
  locations,
  jobSites,
  months,
  onClear,
}) {
  const hasActiveFilters =
    query || filters.status || filters.month || filters.location || filters.jobSite;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, company, location…"
          className="h-9 pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => setFilter('status', v)}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          label="Months"
          value={filters.month}
          onChange={(v) => setFilter('month', v)}
          options={months}
        />
        <FilterSelect
          label="Cities"
          value={filters.location}
          onChange={(v) => setFilter('location', v)}
          options={locations}
        />
        <FilterSelect
          label="Sites"
          value={filters.jobSite}
          onChange={(v) => setFilter('jobSite', v)}
          options={jobSites}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
