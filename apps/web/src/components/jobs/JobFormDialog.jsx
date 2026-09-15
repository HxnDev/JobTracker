import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  STATUS_OPTIONS,
  WORK_MODE_OPTIONS,
  LANGUAGE_OPTIONS,
  JOB_SITE_OPTIONS,
  LOCATION_SUGGESTIONS,
  buildJobSuggestions,
  createEmptyJob,
  findDuplicateApplication,
  formatDate,
  toInputDate,
  fromInputDate,
} from '@jobtracker/shared';

function SuggestionInput({ label, field, value, onChange, suggestions, error, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    return suggestions
      .filter((item) => !query || item.toLocaleLowerCase().includes(query))
      .filter((item) => item.toLocaleLowerCase() !== query)
      .slice(0, 6);
  }, [suggestions, value]);
  const open = focused && matches.length > 0;

  const choose = (item) => {
    onChange(item);
    setFocused(false);
    setActiveIndex(0);
  };

  const handleKeyDown = (event) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % matches.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(matches[activeIndex]);
    } else if (event.key === 'Tab') {
      onChange(matches[activeIndex]);
    } else if (event.key === 'Escape') {
      setFocused(false);
    }
  };

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor={`job-${field}`}>{label}</Label>
      <div className="relative">
        <Input
          id={`job-${field}`}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-autocomplete="list"
          className="pr-9"
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {open && (
        <div className="absolute z-[70] mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            From your application history
          </p>
          {matches.map((item, index) => (
            <button
              key={item}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(item)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                index === activeIndex
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span className="truncate">{item}</span>
              {index === activeIndex && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
          <p className="px-2.5 pb-1 pt-1.5 text-[10px] text-muted-foreground">
            Use ↑↓ and Enter, or press Tab to accept
          </p>
        </div>
      )}
    </div>
  );
}

function buildState(job) {
  const base = job || createEmptyJob();
  return {
    ...createEmptyJob(),
    ...base,
    dateInput: toInputDate(base.dateApplied) || toInputDate(new Date()),
  };
}

const FieldSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export function JobFormDialog({ open, onOpenChange, job, jobs, onSave, onDelete, saving }) {
  const isEdit = Boolean(job?.rowNumber);
  const [form, setForm] = useState(() => buildState(job));
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const suggestions = useMemo(
    () => ({
      jobTitle: buildJobSuggestions(jobs, 'jobTitle'),
      company: buildJobSuggestions(jobs, 'company'),
      location: buildJobSuggestions(jobs, 'location', LOCATION_SUGGESTIONS),
    }),
    [jobs]
  );

  useEffect(() => {
    if (open) {
      setForm(buildState(job));
      setErrors({});
      setConfirmDelete(false);
      setDuplicate(null);
    }
  }, [open, job]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDuplicate(null);
  };
  const setInput = (key) => (e) => set(key)(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Required';
    if (!form.company.trim()) nextErrors.company = 'Required';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...form,
      dateApplied: form.dateInput ? fromInputDate(form.dateInput) : form.dateApplied,
    };
    delete payload.dateInput;

    if (!isEdit && !duplicate) {
      const match = findDuplicateApplication(jobs, payload);
      if (match) {
        setDuplicate(match);
        return;
      }
    }

    try {
      await onSave(payload);
      onOpenChange(false);
    } catch {
      /* parent surfaces the error toast */
    }
  };

  const handleDelete = async () => {
    if (!job?.rowNumber || !onDelete) return;
    try {
      await onDelete(job);
      onOpenChange(false);
    } catch {
      /* parent surfaces the error toast */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit application' : 'Add application'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Updating ${form.jobId} — changes are written straight to your Google Sheet.`
              : 'A new row is appended to your Switzerland sheet with the next Job ID.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <SuggestionInput label="Job Title" field="title" value={form.jobTitle} onChange={set('jobTitle')} suggestions={suggestions.jobTitle} error={errors.jobTitle} placeholder="e.g. Senior Full Stack Developer" />
            </div>

            <SuggestionInput label="Company" field="company" value={form.company} onChange={set('company')} suggestions={suggestions.company} error={errors.company} placeholder="e.g. Proton Mail" />

            <SuggestionInput label="Location" field="location" value={form.location} onChange={set('location')} suggestions={suggestions.location} placeholder="e.g. Geneva" />

            <div className="space-y-1.5">
              <Label>Date Applied</Label>
              <Input
                type="date"
                value={form.dateInput}
                onChange={setInput('dateInput')}
                className="[color-scheme:dark]"
              />
            </div>

            <FieldSelect
              label="Status"
              value={form.status}
              onChange={set('status')}
              options={STATUS_OPTIONS}
            />

            <FieldSelect
              label="Work Mode"
              value={form.workMode}
              onChange={set('workMode')}
              options={WORK_MODE_OPTIONS}
            />

            <FieldSelect
              label="Language"
              value={form.language}
              onChange={set('language')}
              options={LANGUAGE_OPTIONS}
            />

            <FieldSelect
              label="Job Site"
              value={form.jobSite}
              onChange={set('jobSite')}
              options={JOB_SITE_OPTIONS}
            />

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Job URL</Label>
              <Input
                type="url"
                value={form.jobUrl}
                onChange={setInput('jobUrl')}
                placeholder="https://..."
              />
            </div>
          </div>

          {duplicate && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-100">This application may already exist</p>
                  <p className="text-xs leading-relaxed text-amber-100/70">
                    {duplicate.jobId} was added on {formatDate(duplicate.dateApplied)} for {duplicate.jobTitle} at {duplicate.company}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {confirmDelete ? (
            <div className="mt-2 space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3">
              <p className="text-sm text-foreground">
                Delete {form.jobId || 'this application'} from your Google Sheet? This
                cannot be undone.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep it
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={saving}
                  onClick={handleDelete}
                >
                  {saving && <Loader2 className="animate-spin" />}
                  Delete permanently
                </Button>
              </div>
            </div>
          ) : (
            <DialogFooter
              className={
                isEdit && onDelete
                  ? 'mt-2 sm:justify-between'
                  : 'mt-2'
              }
            >
              {isEdit && onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={saving}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving && <Loader2 className="animate-spin" />}
                  {isEdit ? 'Save changes' : duplicate ? 'Add anyway' : 'Add application'}
                </Button>
              </div>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
