import type { AppData } from "./types";

export const seedData: AppData = {
  dailySales: [],
  expenses: [],
  supplierInvoices: [],
  gstBills: [],
  gstRecords: [],
  employees: [],
  attendance: [],
  payroll: [],
  salaryAdvances: [],
  appUsers: [
    {
      id: 1,
      name: "Main Admin",
      username: "admin",
      password: "admin123",
      role: "admin",
      permissions: [
        "Dashboard",
        "Daily Sale",
        "Monthly Sale Report",
        "Supplier Invoice",
        "GST Bills",
        "GST Details",
        "Expenses",
        "Employees",
        "Attendance",
        "Payroll",
        "Stock Management",
        "Overall Stock Inventory",
        "User Authorization",
        "Activity Logs"
      ]
    }
  ],
  stockMovements: [],
  activityLogs: [],
  gstPayments: []
};

export const cloneSeedData = (): AppData => JSON.parse(JSON.stringify(seedData));
