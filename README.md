# Job Tracker UI

A modern, mobile-friendly interface for my **Switzerland job-application tracker**.
The Google Sheet stays the single source of truth — this app reads it, displays it
beautifully, and writes changes straight back to it. No backend, no database, no
server. Just a static React app on GitHub Pages talking directly to the Google
Sheets API via browser OAuth.

**Live:** https://hxndev.github.io/JobTracker/

## Highlights

- **Google Sheets is the database.** Reads + writes go directly to your sheet.
- **Browser-only OAuth.** Google Identity Services (token model) — no client secret,
  no refresh token, no backend.
- **Real CRUD.** Add / edit applications, change status, open the job link.
- **Search, filter & sort** by status, work mode, city, date, and "days since".
- **Handles the messy sheet** — mixed date formats, the `Hybird` typo, and the
  hidden `=HYPERLINK()` job links are all parsed correctly.
- **Never breaks your formulas.** The "Days Since Applied" formula column is never
  overwritten.

## Tech stack

React 18 · Vite · Tailwind CSS · shadcn-style UI (Radix) · Framer Motion ·
Google Sheets API v4 · GitHub Pages.

## How the sheet is mapped

The `Switzerland` tab has decorative rows (title in row 1, group headers in row 2,
column headers in row 3), so data starts at **row 4**. Columns:

| Col | Field | Notes |
| --- | ----- | ----- |
| A | Job ID | auto-generated `CH-###` for new rows |
| B | Date Applied | parsed from `dd.mm.yy` and `dd.mm.yyyy` |
| C | Job Title | |
| D | Company | |
| E | Location | |
| F | Language | |
| G | Work Mode | `Hybird` normalized to `Hybrid` for display |
| H | Job Site | |
| I | Status | |
| J | Days Since Applied | **read-only formula — never written** |
| K | Job URL | stored as `=HYPERLINK(url,"Open Job")` |

## Local setup

```bash
npm install
cp .env.example .env   # then fill in your Client ID
npm run dev            # http://localhost:5173
```

### Environment variables

| Variable | Public-safe? | Description |
| -------- | ------------ | ----------- |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | OAuth Web Client ID (no secret) |
| `VITE_SPREADSHEET_ID` | ✅ | ID from the sheet URL |
| `VITE_SHEET_NAME` | ✅ | Tab name (`Switzerland`) |

## Google Cloud setup (one-time)

1. Create a project at https://console.cloud.google.com.
2. **APIs & Services → Library →** enable **Google Sheets API**.
3. **OAuth consent screen:** User type *External*, keep status **Testing**, and add
   your own Gmail as a **Test user**. (Testing mode lets you use the sensitive
   `spreadsheets` scope without app verification.)
4. **Credentials → Create credentials → OAuth client ID → Web application.**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://hxndev.github.io`
   - Copy the **Client ID** into `.env` (and as a repo Variable for CI).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages.

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables** → add:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_SPREADSHEET_ID`
   - `VITE_SHEET_NAME`

## Roadmap

- **Done:** Applications table (search / filter / sort, rejected hidden by default
  with a toggle and red highlight) + a **Dashboard** with KPIs and charts
  (applications over time, status breakdown, top locations, work mode, job sites).
- **Next:** Kanban with drag-drop, auto-refresh, conflict detection.

## License

MIT
