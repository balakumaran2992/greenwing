CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL,
  cash NUMERIC(12, 2) DEFAULT 0,
  upi NUMERIC(12, 2) DEFAULT 0,
  card NUMERIC(12, 2) DEFAULT 0,
  expense NUMERIC(12, 2) DEFAULT 0,
  output_gst NUMERIC(12, 2) DEFAULT 0,
  submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_payments (
  id SERIAL PRIMARY KEY,
  daily_sale_id INTEGER REFERENCES daily_sales(id) ON DELETE CASCADE,
  payment_type VARCHAR(20) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  category VARCHAR(20) CHECK (category IN ('daily', 'other')) DEFAULT 'daily',
  tax_type VARCHAR(20) CHECK (tax_type IN ('sgst_cgst', 'igst', 'na')) DEFAULT 'na',
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  gst NUMERIC(12, 2) DEFAULT 0,
  mode_of_payment VARCHAR(20) CHECK (mode_of_payment IN ('cash', 'bank')) DEFAULT 'cash',
  expense_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  supplier_name VARCHAR(160) NOT NULL,
  gst_number VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_invoices (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  supplier_bill_number VARCHAR(80) NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  submitted BOOLEAN DEFAULT false,
  total_basic NUMERIC(12, 2) DEFAULT 0,
  total_tax NUMERIC(12, 2) DEFAULT 0,
  grand_total NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE supplier_invoice_items (
  id SERIAL PRIMARY KEY,
  supplier_invoice_id INTEGER REFERENCES supplier_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  basic NUMERIC(12, 2) DEFAULT 0,
  tax_type VARCHAR(20) CHECK (tax_type IN ('sgst_cgst', 'igst')) DEFAULT 'sgst_cgst',
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  sgst NUMERIC(12, 2) DEFAULT 0,
  cgst NUMERIC(12, 2) DEFAULT 0,
  igst NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE gst_bills (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(80) NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  bill_date DATE DEFAULT CURRENT_DATE,
  submitted BOOLEAN DEFAULT false,
  total_basic NUMERIC(12, 2) DEFAULT 0,
  total_tax NUMERIC(12, 2) DEFAULT 0,
  grand_total NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE gst_bill_items (
  id SERIAL PRIMARY KEY,
  gst_bill_id INTEGER REFERENCES gst_bills(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  basic NUMERIC(12, 2) DEFAULT 0,
  tax_type VARCHAR(20) CHECK (tax_type IN ('sgst_cgst', 'igst')) DEFAULT 'sgst_cgst',
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  sgst NUMERIC(12, 2) DEFAULT 0,
  cgst NUMERIC(12, 2) DEFAULT 0,
  igst NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE gst_records (
  id SERIAL PRIMARY KEY,
  record_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  value NUMERIC(12, 2) DEFAULT 0,
  gst NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  gst_type VARCHAR(20) CHECK (gst_type IN ('input', 'output')) NOT NULL,
  sgst NUMERIC(12, 2) DEFAULT 0,
  cgst NUMERIC(12, 2) DEFAULT 0,
  igst NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  aadhaar_number VARCHAR(20),
  bank_detail TEXT,
  role VARCHAR(80),
  full_time BOOLEAN DEFAULT false,
  part_time BOOLEAN DEFAULT false,
  salary NUMERIC(12, 2) DEFAULT 0,
  joining_date DATE
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  employee_name VARCHAR(140) NOT NULL,
  attendance_date DATE NOT NULL,
  in_time TIME,
  out_time TIME,
  total_work_duration VARCHAR(40)
);

CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  payroll_date DATE NOT NULL,
  payroll_month VARCHAR(20),
  payroll_year VARCHAR(10),
  employee_name VARCHAR(140) NOT NULL,
  salary NUMERIC(12, 2) DEFAULT 0,
  advance_taken NUMERIC(12, 2) DEFAULT 0,
  salary_to_be_paid NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE salary_advances (
  id SERIAL PRIMARY KEY,
  advance_date DATE NOT NULL,
  employee_id INTEGER REFERENCES employees(id),
  employee_name VARCHAR(140) NOT NULL,
  amount NUMERIC(12, 2) DEFAULT 0,
  months INTEGER DEFAULT 1,
  deduction_per_month NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE app_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  password VARCHAR(140) NOT NULL,
  role VARCHAR(40) DEFAULT 'user',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  movement_date DATE NOT NULL,
  description TEXT NOT NULL,
  stock_in NUMERIC(12, 2) DEFAULT 0,
  stock_out NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock availability is calculated as SUM(stock_in - stock_out) by description.
-- Validate available quantity before inserting stock_out rows in the application layer.

CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_name VARCHAR(140) NOT NULL,
  module VARCHAR(120) NOT NULL,
  action VARCHAR(80) NOT NULL,
  record_label TEXT,
  details TEXT
);

CREATE TABLE gst_payments (
  id SERIAL PRIMARY KEY,
  payment_date DATE NOT NULL,
  transaction_id VARCHAR(140) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash, role)
VALUES ('admin', 'admin123', 'admin');
