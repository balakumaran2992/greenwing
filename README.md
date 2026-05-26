# GREENWING Management System

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

The app is MySQL-ready for Railway. Set `MYSQL_URL` on the app service, or set `DATABASE_URL` to a MySQL connection string. During deploy, Railway runs `npm run db:setup` from `railway.json`, which creates the MySQL tables from `db/mysql-schema.sql` and seeds the default admin user when the database is empty.

When no database environment variable is configured, the app uses seeded in-memory data so the interface still works during local preview.

Railway deployment:

- Add a MySQL service to the Railway project.
- Add `MYSQL_URL=${{MySQL.MYSQL_URL}}` to the app service variables.
- Deploy the app. The pre-deploy database setup runs automatically.

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
