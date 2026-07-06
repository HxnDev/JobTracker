// The sheet stores dates as text in mixed formats: "21.04.26" and "30.04.2026".
// Some cells could also be real serial-number dates. Handle all of them.

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Google Sheets serial date epoch is 1899-12-30.
const SHEETS_EPOCH = Date.UTC(1899, 11, 30);

/** @param {string|number|Date|null|undefined} value @returns {Date|null} */
export function parseSheetDate(value) {
  if (value === null || value === undefined || value === '') return null;

  // Numeric serial date (e.g. 46123) -> JS date.
  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())) {
    const serial = Number(value);
    if (serial > 59 && serial < 100000) {
      return new Date(SHEETS_EPOCH + Math.round(serial) * MS_PER_DAY);
    }
  }

  const str = String(value).trim();

  // dd.mm.yy or dd.mm.yyyy (also accepts / or - separators).
  const m = str.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
  if (m) {
    let [, dd, mm, yy] = m;
    let year = Number(yy);
    if (yy.length === 2) year += 2000;
    const d = new Date(year, Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/** @param {string|number|Date|null|undefined} value @returns {string} dd.mm.yyyy */
export function formatDate(value) {
  const d = value instanceof Date ? value : parseSheetDate(value);
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

// Value we write back to the sheet for dates: dd.mm.yyyy (canonical).
export function toSheetDate(value) {
  return formatDate(value);
}

// Converts an <input type="date"> value (yyyy-mm-dd) into a Date.
export function fromInputDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Converts a Date into <input type="date"> value (yyyy-mm-dd).
export function toInputDate(value) {
  const d = value instanceof Date ? value : parseSheetDate(value);
  if (!d) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Whole days since the given date, never negative. @returns {number|null} */
export function daysSince(value) {
  const d = parseSheetDate(value);
  if (!d) return null;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - start) / MS_PER_DAY));
}
