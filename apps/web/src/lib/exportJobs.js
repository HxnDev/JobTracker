import { formatDate, parseSheetDate } from '@jobtracker/shared';

const COLUMNS = [
  { label: 'Job ID', value: (job) => job.jobId },
  { label: 'Date Applied', value: (job) => parseSheetDate(job.dateApplied) || '' },
  { label: 'Job Title', value: (job) => job.jobTitle },
  { label: 'Company', value: (job) => job.company },
  { label: 'Location', value: (job) => job.location },
  { label: 'Language', value: (job) => job.language },
  { label: 'Job Site', value: (job) => job.jobSite },
  { label: 'Status', value: (job) => job.status },
  { label: 'Days Since Applied', value: (job) => job.daysSinceApplied ?? '' },
  { label: 'Job URL', value: (job) => job.jobUrl },
  { label: 'Rejection Reason', value: (job) => job.rejectionReason },
];

function exportFilename(extension) {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  return `job-applications-${date}.${extension}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function csvCell(value) {
  let text = value instanceof Date ? formatDate(value) : String(value ?? '');
  // Prevent spreadsheet programs from evaluating user-entered cells as formulas.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportJobsAsCsv(jobs) {
  const rows = [
    COLUMNS.map((column) => column.label),
    ...jobs.map((job) =>
      COLUMNS.map((column) => {
        const value = column.value(job);
        return value instanceof Date ? formatDate(value) : value;
      })
    ),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  downloadBlob(
    new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }),
    exportFilename('csv')
  );
}

export async function exportJobsAsExcel(jobs) {
  const module = await import('exceljs');
  const ExcelJS = module.default || module;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Job Tracker';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Applications', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  const widths = [12, 14, 36, 28, 18, 14, 18, 14, 20, 48, 42];
  worksheet.columns = COLUMNS.map((column, index) => ({
    header: column.label,
    key: `column-${index}`,
    width: widths[index],
  }));

  jobs.forEach((job) => {
    const row = worksheet.addRow(COLUMNS.map((column) => column.value(job)));
    const linkCell = row.getCell(10);
    if (job.jobUrl) {
      linkCell.value = { text: job.jobUrl, hyperlink: job.jobUrl };
      linkCell.font = { color: { argb: 'FF4D9F7B' }, underline: true };
    }
  });

  const header = worksheet.getRow(1);
  header.height = 24;
  header.font = { bold: true, color: { argb: 'FF092019' } };
  header.alignment = { vertical: 'middle' };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF75C9A4' },
  };
  worksheet.getColumn(2).numFmt = 'dd.mm.yyyy';
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(jobs.length + 1, 1), column: COLUMNS.length },
  };

  for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.alignment = { vertical: 'top', wrapText: true };
    if (rowIndex % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F7F4' },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    exportFilename('xlsx')
  );
}
