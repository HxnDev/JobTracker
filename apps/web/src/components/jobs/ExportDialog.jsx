import { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Table2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportJobsAsCsv, exportJobsAsExcel } from '@/lib/exportJobs';

function ExportOption({
  icon: Icon,
  title,
  description,
  badge,
  busy,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-4 rounded-xl border border-border bg-secondary/25 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{title}</span>
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <Download className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
    </button>
  );
}

export function ExportDialog({ open, onOpenChange, jobs }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      if (format === 'xlsx') await exportJobsAsExcel(jobs);
      else exportJobsAsCsv(jobs);
      toast.success('Export downloaded', {
        description: `${jobs.length} applications exported as ${format.toUpperCase()}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Could not export applications', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export applications</DialogTitle>
          <DialogDescription>
            Download all {jobs.length} applications currently synced from Google Sheets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-2">
          <ExportOption
            icon={FileSpreadsheet}
            title="Excel workbook"
            badge=".xlsx"
            description="Best for Excel, with typed dates, filters, column sizing, and clickable job links."
            busy={exporting === 'xlsx'}
            disabled={Boolean(exporting)}
            onClick={() => handleExport('xlsx')}
          />
          <ExportOption
            icon={Table2}
            title="Spreadsheet file"
            badge=".csv"
            description="A lightweight UTF-8 file for Google Sheets, Numbers, Excel, and imports."
            busy={exporting === 'csv'}
            disabled={Boolean(exporting)}
            onClick={() => handleExport('csv')}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
