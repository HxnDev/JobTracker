import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
  createEmptyJob,
  toInputDate,
  fromInputDate,
} from '@jobtracker/shared';

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

export function JobFormDialog({ open, onOpenChange, job, onSave, saving }) {
  const isEdit = Boolean(job?.rowNumber);
  const [form, setForm] = useState(() => buildState(job));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildState(job));
      setErrors({});
    }
  }, [open, job]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
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

    try {
      await onSave(payload);
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Job Title</Label>
              <Input
                value={form.jobTitle}
                onChange={setInput('jobTitle')}
                placeholder="e.g. Senior Full Stack Developer"
                aria-invalid={Boolean(errors.jobTitle)}
              />
              {errors.jobTitle && (
                <p className="text-xs text-destructive">{errors.jobTitle}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={setInput('company')}
                placeholder="e.g. Proton Mail"
                aria-invalid={Boolean(errors.company)}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={setInput('location')}
                placeholder="e.g. Geneva"
              />
            </div>

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

          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Add application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
