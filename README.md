# Sales, GST, Audit & HR Management System

A responsive Next.js business management application based on the supplied hand-drawn layouts. It keeps the fixed left navigation and main content pattern, with dashboard cards, tables, filters, add/edit/delete flows, GST calculations, HR pages, and export actions.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo login:

- Username: `admin`
- Password: `admin123`

## Database

The SQL schema is in `db/schema.sql`. The API routes are PostgreSQL-ready through `@vercel/postgres`; when no database environment variable is configured, the app uses seeded in-memory data so the interface still works during preview.

For Vercel Postgres, set `POSTGRES_URL` or the Vercel Postgres environment variables, then run the schema in your database console.

## Features

- Dashboard totals update from app data
- Daily sale payment cards and expense breakup
- GST input/output calculations
- Monthly report filters by month and year
- Supplier invoice entry with item totals
- GST bills, GST details, expenses, employees, attendance, and payroll pages
- Add, edit, delete record actions
- CSV export and browser print/PDF export
- Mobile responsive sidebar and tables
