export type Entity =
  | "dailySales"
  | "expenses"
  | "supplierInvoices"
  | "gstBills"
  | "gstRecords"
  | "employees"
  | "attendance"
  | "payroll"
  | "appUsers"
  | "stockMovements"
  | "activityLogs"
  | "gstPayments"
  | "salaryAdvances";

export type DailySale = {
  id: number;
  saleDate: string;
  openingBalance: number;
  cash: number;
  upi: number;
  card: number;
  expense: number;
  outputGst: number;
  submitted: boolean;
};

export type Expense = {
  id: number;
  description: string;
  value: number;
  category: "daily" | "other";
  taxType: "sgst_cgst" | "igst" | "na";
  gst: number;
  approvedBy?: string;
  expenseDate: string;
};

export type SupplierInvoice = {
  id: number;
  supplierName: string;
  supplierBillNumber: string;
  supplierGstNumber: string;
  invoiceDate: string;
  submitted: boolean;
  items: InvoiceItem[];
};

export type InvoiceItem = {
  id: number;
  description: string;
  basic: number;
  taxType: "sgst_cgst" | "igst";
  taxRate: number;
  sgst: number;
  cgst: number;
  igst: number;
  tax: number;
  total: number;
};

export type GstBill = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  billDate: string;
  submitted: boolean;
  items: InvoiceItem[];
};

export type GstRecord = {
  id: number;
  recordDate: string;
  gstType: "input" | "output";
  sgst: number;
  cgst: number;
  igst: number;
};

export type Employee = {
  id: number;
  name: string;
  aadhaarNumber: string;
  bankDetail: string;
  role: string;
  fullTime: boolean;
  partTime: boolean;
  salary: number;
  joiningDate: string;
};

export type Attendance = {
  id: number;
  employeeName: string;
  date: string;
  inTime: string;
  outTime: string;
  totalWorkDuration: string;
};

export type Payroll = {
  id: number;
  date: string;
  payrollMonth: string;
  payrollYear: string;
  employeeName: string;
  salary: number;
  advanceTaken: number;
  salaryToBePaid: number;
};

export type SalaryAdvance = {
  id: number;
  date: string;
  employeeName: string;
  amount: number;
  months: number;
  deductionPerMonth: number;
};

export type AppUser = {
  id: number;
  name: string;
  username: string;
  password: string;
  role: "admin" | "user";
  permissions: string[];
};

export type StockMovement = {
  id: number;
  date: string;
  description: string;
  stockIn: number;
  stockOut: number;
};

export type ActivityLog = {
  id: number;
  timestamp: string;
  user: string;
  module: string;
  action: string;
  record: string;
  details: string;
};

export type GstPayment = {
  id: number;
  date: string;
  transactionId: string;
  amountPaid: number;
};

export type AppData = {
  dailySales: DailySale[];
  expenses: Expense[];
  supplierInvoices: SupplierInvoice[];
  gstBills: GstBill[];
  gstRecords: GstRecord[];
  employees: Employee[];
  attendance: Attendance[];
  payroll: Payroll[];
  salaryAdvances: SalaryAdvance[];
  appUsers: AppUser[];
  stockMovements: StockMovement[];
  activityLogs: ActivityLog[];
  gstPayments: GstPayment[];
};
