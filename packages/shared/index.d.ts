// Hand-maintained type declarations for @jobtracker/shared (plain JS + JSDoc).

// ---------- schema ----------
export const DEFAULT_SPREADSHEET_ID: string;
export const DEFAULT_SHEET_NAME: string;
export const HEADER_ROW: number;
export const DATA_START_ROW: number;
export const LAST_COLUMN: string;

export interface Job {
  rowNumber: number | null;
  jobId: string;
  dateApplied: string | Date;
  jobTitle: string;
  company: string;
  location: string;
  language: string;
  workMode: string;
  jobSite: string;
  status: string;
  jobUrl: string;
  daysSinceApplied?: number | null;
}

export interface ColumnDef {
  key: keyof Job | string;
  label: string;
  col: string;
  index: number;
  computed?: boolean;
  hyperlink?: boolean;
}

export const COLUMNS: ColumnDef[];
export const COLUMN_BY_KEY: Record<string, ColumnDef>;
export const EDITABLE_RANGE_COLUMNS: { start: string; end: string };

// ---------- options ----------
export const STATUS_OPTIONS: string[];
export const WORK_MODE_OPTIONS: string[];
export const LANGUAGE_OPTIONS: string[];
export const JOB_SITE_OPTIONS: string[];
export const WORK_MODE_ALIASES: Record<string, string>;
export function normalizeWorkMode(raw: string | null | undefined): string;

// ---------- dates ----------
export function parseSheetDate(
  value: string | number | Date | null | undefined
): Date | null;
export function formatDate(value: string | number | Date | null | undefined): string;
export function toSheetDate(value: string | number | Date | null | undefined): string;
export function fromInputDate(value: string | null | undefined): Date | null;
export function toInputDate(value: string | number | Date | null | undefined): string;
export function daysSince(
  value: string | number | Date | null | undefined
): number | null;

// ---------- jobs ----------
export function extractUrl(formulaOrText: unknown): string;
export function toHyperlinkFormula(url: string): string;
export function createEmptyJob(): Job;
export function mapRowsToJobs(
  rows: unknown[][],
  urlRows: unknown[][],
  startRow: number
): Job[];
export function jobToEditableRow(job: Job): string[];
export function getNextJobId(jobs: Job[]): string;

// ---------- analytics ----------
export interface CountEntry {
  name: string;
  value: number;
}

export interface TimelinePoint {
  week: string;
  count: number;
  cumulative: number;
}

export interface Analytics {
  total: number;
  applied: number;
  inProcess: number;
  offers: number;
  rejected: number;
  ghosted: number;
  thisWeek: number;
  responseRate: number;
  interviewRate: number;
  avgDays: number;
  byStatus: CountEntry[];
  byWorkMode: CountEntry[];
  byLanguage: CountEntry[];
  byJobSite: CountEntry[];
  byLocation: CountEntry[];
  timeline: TimelinePoint[];
  funnel: { stage: string; value: number }[];
  facts: {
    topLocation: CountEntry | null;
    topSite: CountEntry | null;
    busiestWeek: TimelinePoint | null;
    latest: string;
    oldestOpen: { label: string; days: number | null } | null;
    activeShare: number;
  };
}

export function computeAnalytics(jobs: Job[]): Analytics;
export const STATUS_COLORS: Record<string, string>;
export const WORK_MODE_COLORS: Record<string, string>;
export const LANGUAGE_COLORS: Record<string, string>;

// ---------- sheetsClient ----------
export interface SheetsClientConfig {
  spreadsheetId: string;
  sheetName: string;
  getAccessToken: () => Promise<string>;
  onUnauthorized?: () => Promise<unknown>;
}

export interface SheetsClient {
  fetchJobs(): Promise<Job[]>;
  addJob(job: Job): Promise<Job>;
  updateJob(job: Job): Promise<Job>;
}

export function createSheetsClient(config: SheetsClientConfig): SheetsClient;
