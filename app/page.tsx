"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  FileBarChart,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  History,
  Trash2,
  Upload,
  UserCircle,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { cloneSeedData } from "../lib/seed";
import type { AppData, AppUser, Attendance, DailySale, Employee, Entity, Expense, GstBill, GstPayment, InvoiceItem, Payroll, SalaryAdvance, StockMovement, SupplierInvoice } from "../lib/types";

type PageKey = "dashboard" | "daily" | "monthly" | "supplier" | "gstBills" | "gstDetails" | "expenses" | "employees" | "attendance" | "payroll" | "userAuthorization" | "activityLogs" | "stockManagement" | "inventory";
type FormState = Record<string, string | number | boolean>;
type GstSplit = { sgst: number; cgst: number; igst: number };
type NavItem = { key: PageKey; label: string; icon: React.ComponentType<{ size?: number }> } | { label: string; icon: React.ComponentType<{ size?: number }>; children: Array<{ key: PageKey; label: string }> };

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = ["2024", "2025", "2026", "2027"];
const currentUser = "Admin User";
const dataStorageKey = "greenwing-management-data-v1";
const legacyDataStorageKey = "business-management-data";
const activePageStorageKey = "greenwing-active-page";
const sessionUserStorageKey = "greenwing-session-user";

const pageTitle: Record<PageKey, string> = {
  dashboard: "Dashboard",
  daily: "Daily Sale",
  monthly: "Monthly Sale Report",
  supplier: "Supplier Invoice",
  gstBills: "GST Bills",
  gstDetails: "GST Details",
  expenses: "Expenses",
  employees: "Employees",
  attendance: "Attendance",
  payroll: "Payroll",
  userAuthorization: "User Authorization",
  activityLogs: "Activity Logs",
  stockManagement: "Stock Management",
  inventory: "Overall Stock Inventory"
};

const blankForms = {
  expenses: { description: "", value: 0, taxType: "na", taxRate: 0, gst: 0, modeOfPayment: "cash", expenseDate: "2026-05-22" },
  employees: { name: "", aadhaarNumber: "", bankDetail: "", role: "", fullTime: true, partTime: false, salary: 0, joiningDate: "2026-05-22" },
  attendance: { employeeName: "", date: "2026-05-22", inTime: "09:30", outTime: "18:00", totalWorkDuration: "8h 30m" },
  payroll: { date: "2026-05-25", payrollMonth: "May", payrollYear: "2026", employeeName: "", salary: 0, advanceTaken: 0, salaryToBePaid: 0 }
};

const permissionModules = ["Dashboard", "Daily Sale", "Monthly Sale Report", "Supplier Invoice", "GST Bills", "GST Details", "Expenses", "Employees", "Attendance", "Payroll", "Stock Management", "Overall Stock Inventory", "User Authorization", "Activity Logs"];

const pagePermission: Record<PageKey, string> = {
  dashboard: "Dashboard",
  daily: "Daily Sale",
  monthly: "Monthly Sale Report",
  supplier: "Supplier Invoice",
  gstBills: "GST Bills",
  gstDetails: "GST Details",
  expenses: "Expenses",
  employees: "Employees",
  attendance: "Attendance",
  payroll: "Payroll",
  userAuthorization: "User Authorization",
  activityLogs: "Activity Logs",
  stockManagement: "Stock Management",
  inventory: "Overall Stock Inventory"
};

const navItems: NavItem[] = [
  { key: "dashboard" as PageKey, label: "Dashboard", icon: Home },
  { key: "daily" as PageKey, label: "Daily Sale", icon: WalletCards },
  { key: "monthly" as PageKey, label: "Monthly Sale Report", icon: CalendarDays },
  { key: "userAuthorization" as PageKey, label: "User Authorization", icon: ShieldCheck },
  { key: "activityLogs" as PageKey, label: "Activity Logs", icon: History },
  {
    label: "GST / Audit Reports",
    icon: FileBarChart,
    children: [
      { key: "gstBills" as PageKey, label: "GST Bills" },
      { key: "gstDetails" as PageKey, label: "GST Details" },
      { key: "supplier" as PageKey, label: "Supplier Invoice" },
      { key: "expenses" as PageKey, label: "Expenses" }
    ]
  },
  {
    label: "HR",
    icon: Users,
    children: [
      { key: "employees" as PageKey, label: "Employees" },
      { key: "attendance" as PageKey, label: "Attendance" },
      { key: "payroll" as PageKey, label: "Payroll" }
    ]
  },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { key: "stockManagement" as PageKey, label: "Stock Management" },
      { key: "inventory" as PageKey, label: "Overall Stock Inventory" }
    ]
  }
];

export default function App() {
  const [data, setData] = useState<AppData>(normalizeData(cloneSeedData()));
  const [active, setActive] = useState<PageKey>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [sessionUser, setSessionUser] = useState<AppUser | null>(null);
  const [loginError, setLoginError] = useState("");
  const [filters, setFilters] = useState({ month: "May", year: "2026" });
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    window.localStorage.removeItem(legacyDataStorageKey);
    const cached = window.localStorage.getItem(dataStorageKey);
    const session = window.localStorage.getItem("business-management-session");
    const sessionUsername = window.localStorage.getItem(sessionUserStorageKey);
    const savedPage = window.localStorage.getItem(activePageStorageKey) as PageKey | null;
    const normalizedCached = cached ? normalizeData(JSON.parse(cached)) : null;
    if (normalizedCached) setData(normalizedCached);
    if (session === "active") {
      const user = normalizedCached?.appUsers.find((item) => item.username === sessionUsername);
      setSessionUser(user || normalizedCached?.appUsers[0] || cloneSeedData().appUsers[0]);
      setLoggedIn(true);
    }
    if (savedPage && pageTitle[savedPage]) setActive(savedPage);
    fetch("/api/data")
      .then((response) => response.json())
      .then((payload) => {
        if (!cached) setData(normalizeData(payload));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(dataStorageKey, JSON.stringify(data));
    fetch("/api/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => undefined);
  }, [data]);

  useEffect(() => {
    window.localStorage.setItem(activePageStorageKey, active);
  }, [active]);

  const gst = useMemo(() => derivedGst(data), [data]);
  const totals = useMemo(() => {
    const totalSale = data.dailySales.reduce((sum, sale) => sum + sale.cash + sale.upi + sale.card, 0);
    const totalExpense = data.expenses.reduce((sum, item) => sum + item.value + item.gst, 0);
    const monthlySales = data.dailySales
      .filter((sale) => byMonthYear(sale.saleDate, filters.month, filters.year))
      .reduce((sum, sale) => sum + sale.cash + sale.upi + sale.card, 0);
    return { totalSale, totalExpense, monthlySales, inputCredit: gst.input.total, outputGst: gst.output.total, gstPayable: Math.max(gst.output.total - gst.input.total, 0), ...openingBalances(data) };
  }, [data, filters, gst]);

  async function login(formData: FormData) {
    setLoginError("");
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    const localUser = data.appUsers.find((user) => user.username === username && user.password === password);
    if (localUser) {
      window.localStorage.setItem("business-management-session", "active");
      window.localStorage.setItem(sessionUserStorageKey, localUser.username);
      setSessionUser(localUser);
      setLoggedIn(true);
      return;
    }
    const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (response.ok) {
      const adminUser = data.appUsers.find((user) => user.username === username) || cloneSeedData().appUsers[0];
      window.localStorage.setItem("business-management-session", "active");
      window.localStorage.setItem(sessionUserStorageKey, adminUser.username);
      setSessionUser(adminUser);
      setLoggedIn(true);
    } else {
      setLoginError("Use admin / admin123 for the demo login.");
    }
  }

  function logout() {
    window.localStorage.removeItem("business-management-session");
    window.localStorage.removeItem(sessionUserStorageKey);
    setLoggedIn(false);
    setSessionUser(null);
    setProfileOpen(false);
    setPasswordOpen(false);
  }

  function changeOwnPassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordMessage("");
    if (!sessionUser) return;
    if (passwordForm.current !== sessionUser.password) {
      setPasswordMessage("Current password is incorrect.");
      return;
    }
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage("New password and confirm password must match.");
      return;
    }
    const updatedUser = { ...sessionUser, password: passwordForm.next };
    const nextData = { ...data, appUsers: data.appUsers.map((user) => user.id === updatedUser.id ? updatedUser : user) };
    setData(withActivity(data, nextData, "User Profile", "Password Changed", updatedUser.username, "User changed own password"));
    setSessionUser(updatedUser);
    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordMessage("Password updated.");
  }

  const canAccess = (page: PageKey) => !sessionUser || sessionUser.role === "admin" || sessionUser.permissions.includes(pagePermission[page]);

  useEffect(() => {
    if (loggedIn && !canAccess(active)) setActive("dashboard");
  }, [active, loggedIn, sessionUser]);

  const visibleNavItems = navItems
    .map((item) => {
      if ("children" in item) return { ...item, children: item.children.filter((child) => canAccess(child.key)) };
      return canAccess(item.key) ? item : null;
    })
    .filter((item): item is NavItem => {
      if (!item) return false;
      return !("children" in item) || item.children.length > 0;
    });
  const isAdminUser = sessionUser?.role === "admin";

  if (!loggedIn) {
    return (
      <main className="login-screen">
        <form className="login-panel" onSubmit={(event) => { event.preventDefault(); login(new FormData(event.currentTarget)); }}>
          <div>
            <span className="eyebrow">Business Suite</span>
            <h1>Sales, GST, Audit & HR Management System</h1>
            <p>Secure access for daily sales, audit reports and HR records.</p>
          </div>
          <label>Username<input name="username" defaultValue="admin" /></label>
          <PasswordInput label="Password" name="password" defaultValue="admin123" />
          {loginError ? <p className="error">{loginError}</p> : null}
          <button className="primary" type="submit">Login</button>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className={mobileNav ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <button className="icon-button mobile-only" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
          <div className="mark"><img src="/greenwing-logo.jpg" alt="GREENWING logo" /></div>
          <div><strong>GREENWING</strong><span>Audit & HR</span></div>
        </div>
        <nav>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            if ("children" in item) {
              return (
                <div className="nav-group" key={item.label}>
                  <div className="nav-parent"><Icon size={18} />{item.label}<ChevronDown size={15} /></div>
                  {item.children.map((child) => (
                    <button key={`${item.label}-${child.label}`} className={active === child.key ? "nav-child active" : "nav-child"} onClick={() => { setActive(child.key); setMobileNav(false); setProfileOpen(false); }}>{child.label}</button>
                  ))}
                </div>
              );
            }
            return <button key={item.key} className={active === item.key ? "nav-link active" : "nav-link"} onClick={() => { setActive(item.key); setMobileNav(false); setProfileOpen(false); }}><Icon size={18} />{item.label}</button>;
          })}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div><span className="eyebrow">Management Console</span><h1>{pageTitle[active]}</h1></div>
          <div className="header-actions">
            <button className="ghost" onClick={() => exportCsv(active, data)}><Download size={16} />Excel</button>
            <button className="ghost" onClick={() => window.print()}><Printer size={16} />PDF</button>
            <div className="profile-menu">
              <button className="icon-button" onClick={() => setProfileOpen(!profileOpen)} aria-label="User profile"><UserCircle size={22} /></button>
              {profileOpen ? (
                <div className="profile-dropdown">
                  <strong>{sessionUser?.name || currentUser}</strong>
                  <button onClick={() => { setPasswordOpen(!passwordOpen); setPasswordMessage(""); }}><KeyRound size={16} />Change Password</button>
                  {passwordOpen ? (
                    <form className="profile-password-form" onSubmit={changeOwnPassword}>
                      <PasswordInput label="Current Password" value={passwordForm.current} onChange={(value) => setPasswordForm({ ...passwordForm, current: value })} />
                      <PasswordInput label="New Password" value={passwordForm.next} onChange={(value) => setPasswordForm({ ...passwordForm, next: value })} />
                      <PasswordInput label="Confirm Password" value={passwordForm.confirm} onChange={(value) => setPasswordForm({ ...passwordForm, confirm: value })} />
                      {passwordMessage ? <p className={passwordMessage === "Password updated." ? "success" : "error"}>{passwordMessage}</p> : null}
                      <button className="primary" type="submit"><KeyRound size={15} />Update Password</button>
                    </form>
                  ) : null}
                  <button onClick={logout}><LogOut size={16} />Logout</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        {active === "dashboard" && <Dashboard totals={totals} data={data} />}
        {active === "daily" && <DailySalePage data={data} setData={setData} totals={totals} isAdmin={isAdminUser} />}
        {active === "monthly" && <MonthlyReport data={data} filters={filters} setFilters={setFilters} />}
        {active === "supplier" && <SupplierInvoicePage data={data} setData={setData} isAdmin={isAdminUser} />}
        {active === "gstBills" && <GstBillsPage data={data} setData={setData} isAdmin={isAdminUser} />}
        {active === "gstDetails" && <GstDetailsPage data={data} setData={setData} filters={filters} setFilters={setFilters} />}
        {active === "expenses" && <ExpensesPage data={data} setData={setData} />}
        {active === "employees" && <EmployeesPage data={data} setData={setData} />}
        {active === "attendance" && <AttendancePage data={data} setData={setData} />}
        {active === "payroll" && <PayrollPage data={data} setData={setData} />}
        {active === "userAuthorization" && <UserAuthorizationPage data={data} setData={setData} />}
        {active === "activityLogs" && <ActivityLogsPage data={data} />}
        {active === "stockManagement" && <StockManagementPage data={data} setData={setData} isAdmin={isAdminUser} />}
        {active === "inventory" && <OverallStockInventoryPage data={data} />}
      </main>
    </div>
  );
}

function Dashboard({ totals, data }: { totals: Record<string, number>; data: AppData }) {
  const [period, setPeriod] = useState<"quarter" | "sixMonths" | "twelveMonths">("quarter");
  const [analysis, setAnalysis] = useState({ month: "May", year: "2026" });
  const filteredSales = filterByDashboardPeriod(data.dailySales.map((sale) => ({ date: sale.saleDate, value: sale.cash + sale.upi + sale.card })), period);
  const filteredExpenses = filterByDashboardPeriod(data.expenses.map((expense) => ({ date: expense.expenseDate, value: expense.value + expense.gst })), period);
  const selectedRows = monthlyAnalysisRows(data, analysis.month, analysis.year);
  const selectedSales = selectedRows.reduce((sum, row) => sum + row.sales, 0);
  const selectedExpenses = selectedRows.reduce((sum, row) => sum + row.expenses, 0);
  const selectedProfit = selectedSales - selectedExpenses;
  const selectedMargin = selectedSales > 0 ? Math.round((selectedProfit / selectedSales) * 100) : 0;
  const inflow = filteredSales.reduce((sum, row) => sum + row.value, 0);
  const outflow = filteredExpenses.reduce((sum, row) => sum + row.value, 0);
  const netCash = inflow - outflow;
  return (
    <section>
      <div className="filter-bar dashboard-controls">
        <label>Dashboard Period<select value={period} onChange={(event) => setPeriod(event.target.value as "quarter" | "sixMonths" | "twelveMonths")}><option value="quarter">This Quarter</option><option value="sixMonths">Last 6 Months</option><option value="twelveMonths">Last 12 Months</option></select></label>
        <label>Analysis Month<select value={analysis.month} onChange={(event) => setAnalysis({ ...analysis, month: event.target.value })}>{months.map((month) => <option key={month}>{month}</option>)}</select></label>
        <label>Year<select value={analysis.year} onChange={(event) => setAnalysis({ ...analysis, year: event.target.value })}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
      </div>
      <div className="dashboard-grid">
        <SummaryCard title="Total Sale" value={currency.format(totals.totalSale)} icon={<Banknote />} />
        <SummaryCard title="Total Expense" value={currency.format(totals.totalExpense)} icon={<ClipboardList />} />
        <SummaryCard title="Monthly Sales" value={currency.format(totals.monthlySales)} icon={<CalendarDays />} />
        <SummaryCard title="Cash Opening Balance" value={currency.format(totals.cashOpeningBalance)} icon={<WalletCards />} />
        <SummaryCard title="Bank Opening Balance" value={currency.format(totals.bankOpeningBalance)} icon={<Banknote />} />
        <SummaryCard title="GST Payable" value={currency.format(totals.gstPayable)} icon={<FileBarChart />} />
        <SummaryCard title="Input Credit" value={currency.format(totals.inputCredit)} icon={<Download />} />
        <SummaryCard title="Output GST" value={currency.format(totals.outputGst)} icon={<FileText />} />
      </div>
      <div className="cash-flow-widget">
        <div><span>Cash In</span><strong>{currency.format(inflow)}</strong></div>
        <div><span>Cash Out</span><strong>{currency.format(outflow)}</strong></div>
        <div><span>Net Cash Flow</span><strong className={netCash < 0 ? "negative" : "positive"}>{currency.format(netCash)}</strong></div>
      </div>
      <div className="analysis-grid">
        <ProfitMarginGraph sales={selectedSales} expenses={selectedExpenses} profit={selectedProfit} margin={selectedMargin} />
        <IncomeExpenseGraph title="Sales Data / Expense Data" subtitle={`${analysis.month} ${analysis.year}`} rows={selectedRows} />
      </div>
    </section>
  );
}

function DailySalePage({ data, setData, totals, isAdmin }: { data: AppData; setData: (data: AppData) => void; totals: Record<string, number>; isAdmin: boolean }) {
  const [form, setForm] = useState<DailySale>({ id: 0, saleDate: "2026-05-22", openingBalance: 0, cash: 0, upi: 0, card: 0, expense: 0, outputGst: 0, submitted: false });
  const [adminEditId, setAdminEditId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const dayExpenses = data.expenses.filter((expense) => expense.category === "daily" && expense.expenseDate === form.saleDate);
  const expenseTotal = dayExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const saleTotal = form.cash + form.upi + form.card;
  const balances = openingBalances(data);
  const submittedForDate = data.dailySales.find((sale) => sale.saleDate === form.saleDate && sale.submitted);
  const locked = Boolean(submittedForDate) && adminEditId !== submittedForDate?.id;

  function submitSale(event: React.FormEvent) {
    event.preventDefault();
    if (submittedForDate && adminEditId !== submittedForDate.id) return;
    const record = { ...form, id: form.id || nextId(data.dailySales), expense: expenseTotal, submitted: true };
    const rows = form.id ? data.dailySales.map((sale) => sale.id === form.id ? record : sale) : [record, ...data.dailySales];
    setData(withActivity(data, { ...data, dailySales: rows }, "Daily Sales", form.id ? "Modified" : "Added", record.saleDate, `Sale total ${currency.format(record.cash + record.upi + record.card)}`));
    setForm(record);
    setAdminEditId(null);
  }

  function addExpense(expense: Expense) {
    if (locked) return;
    const record = { ...expense, expenseDate: form.saleDate };
    setData(withActivity(data, { ...data, expenses: [record, ...data.expenses] }, "Daily Expense", "Added", record.description, `Daily sale date ${record.expenseDate}`));
  }

  function changeSaleDate(saleDate: string) {
    const existing = data.dailySales.find((sale) => sale.saleDate === saleDate && sale.submitted);
    setAdminEditId(null);
    setForm(existing || { id: 0, saleDate, openingBalance: 0, cash: 0, upi: 0, card: 0, expense: 0, outputGst: 0, submitted: false });
  }

  function adminEditSale(row: DailySale) {
    setForm(row);
    setAdminEditId(row.id);
  }

  function updateSaleField(field: "saleDate" | "cash" | "upi" | "card" | "outputGst", value: string) {
    if (field === "saleDate") {
      changeSaleDate(value);
    } else {
      setForm((current) => ({ ...current, [field]: Number(value) }));
    }
  }

  function shareDailySale() {
    const message = [
      `Date: ${form.saleDate}`,
      `Cash Opening Balance: ${currency.format(totals.cashOpeningBalance)}`,
      `Cash: ${currency.format(form.cash)}`,
      `QR: ${currency.format(form.upi)}`,
      `Card: ${currency.format(form.card)}`,
      `Daily Expense: ${currency.format(expenseTotal)}`,
      `Total Sales: ${currency.format(saleTotal)}`,
      `Balance Cash: ${currency.format(form.cash - expenseTotal)}`
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="split-layout">
      <div className="wide-panel">
        <div className="metric-row">
          <SummaryCard title="Cash" value={currency.format(form.cash)} />
          <SummaryCard title="UPI" value={currency.format(form.upi)} />
          <SummaryCard title="Card" value={currency.format(form.card)} />
          <SummaryCard title="Expense" value={currency.format(expenseTotal)} />
          <SummaryCard title="Total" value={currency.format(saleTotal)} />
        </div>
        <form className="form-panel" onSubmit={submitSale}>
          <div className="section-heading">
            <h2>Daily Sale Entry</h2>
            <div className="header-actions">
              <button className="ghost" type="button" onClick={shareDailySale}><MessageCircle size={16} />WhatsApp</button>
              <button className="primary" type="submit" disabled={locked}><Plus size={16} />Submit</button>
            </div>
          </div>
          <div className="form-grid">
            {(["saleDate", "cash", "upi", "card", "outputGst"] as const).map((field) => (
              <label key={field}>{labelize(field)}
                <input disabled={field !== "saleDate" && locked} type={field === "saleDate" ? "date" : "number"} value={String(form[field])} onInput={(event) => updateSaleField(field, event.currentTarget.value)} onChange={(event) => updateSaleField(field, event.currentTarget.value)} />
              </label>
            ))}
          </div>
          {locked ? <p className="status-note">This date is already submitted. Daily Sales and Expense Breakup are locked until Admin Edit is used.</p> : null}
          {adminEditId ? <p className="status-note">Admin edit mode is active. Submit again to save and lock this record.</p> : null}
        </form>
        <ExpenseBreakup saleDate={form.saleDate} onAdd={addExpense} locked={locked} balances={balances} />
        <DataTable rows={dayExpenses} columns={[["id", "S.No"], ["description", "Description"], ["value", "Amount"], ["gst", "GST"], ["modeOfPayment", "Mode of Payment"]]} />
        <DateRangeFilter filters={dateRange} setFilters={setDateRange} />
        <DataTable rows={uniqueDailySales(data.dailySales).filter((sale) => inDateRange(sale.saleDate, dateRange.from, dateRange.to)).map((sale) => ({ ...sale, total: sale.cash + sale.upi + sale.card, status: sale.submitted ? "Submitted" : "Draft" }))} columns={[["saleDate", "Date"], ["cash", "Cash"], ["upi", "UPI"], ["card", "Card"], ["total", "Total"], ["expense", "Expense"], ["outputGst", "Output GST"], ["status", "Status"]]} actions={isAdmin ? (row) => <button className="ghost" onClick={() => adminEditSale(row as DailySale)}><Edit3 size={15} />Admin Edit</button> : undefined} />
      </div>
      <aside className="side-panel">
        <h2>GST</h2>
        <SummaryCard title="Input Credit" value={currency.format(totals.inputCredit)} />
        <SummaryCard title="Output GST" value={currency.format(totals.outputGst)} />
      </aside>
    </section>
  );
}

function ExpenseBreakup({ saleDate, onAdd, locked, balances }: { saleDate: string; onAdd: (expense: Expense) => void; locked: boolean; balances: { cashOpeningBalance: number; bankOpeningBalance: number } }) {
  const [form, setForm] = useState({ description: "", value: 0, gst: 0, modeOfPayment: "cash" as "cash" | "bank" });
  const selectedBalance = form.modeOfPayment === "cash" ? balances.cashOpeningBalance : balances.bankOpeningBalance;
  const projectedBalance = selectedBalance - form.value - form.gst;
  return (
    <form className="form-panel" onSubmit={(event) => {
      event.preventDefault();
      if (locked) return;
      onAdd({ id: Date.now(), expenseDate: saleDate, category: "daily", taxType: "sgst_cgst", ...form });
      setForm({ description: "", value: 0, gst: 0, modeOfPayment: "cash" });
    }}>
      <div className="section-heading"><h2>Expense Breakup</h2><button className="primary" type="submit" disabled={locked}><Plus size={16} />Add Expense</button></div>
      <div className="form-grid">
        <label className="wide">Description<input disabled={locked} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label>Value<input disabled={locked} type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} /></label>
        <label>GST<input disabled={locked} type="number" value={form.gst} onChange={(event) => setForm({ ...form, gst: Number(event.target.value) })} /></label>
        <label>Mode of Payment<select disabled={locked} required value={form.modeOfPayment} onChange={(event) => setForm({ ...form, modeOfPayment: event.target.value as "cash" | "bank" })}><option value="cash">Cash</option><option value="bank">Bank</option></select></label>
      </div>
      <p className="status-note">{locked ? "Expense Breakup is locked for this submitted date." : `Showing expenses only for ${saleDate}. ${form.modeOfPayment === "cash" ? "Cash" : "Bank"} balance after this expense: ${currency.format(projectedBalance)}.`}</p>
    </form>
  );
}

function MonthlyReport({ data, filters, setFilters }: { data: AppData; filters: { month: string; year: string }; setFilters: (filters: { month: string; year: string }) => void }) {
  const rows = data.dailySales.filter((sale) => byMonthYear(sale.saleDate, filters.month, filters.year));
  return (
    <section>
      <FilterBar filters={filters} setFilters={setFilters} />
      <DataTable rows={rows.map((sale) => ({ ...sale, total: sale.cash + sale.upi + sale.card, gst: sale.outputGst }))} columns={[["saleDate", "Date"], ["cash", "Cash"], ["upi", "UPI"], ["card", "Card"], ["total", "Total"], ["expense", "Expense"], ["gst", "GST"]]} />
    </section>
  );
}

function SupplierInvoicePage({ data, setData, isAdmin }: CrudProps & { isAdmin: boolean }) {
  return <InvoiceBuilder mode="supplier" data={data} setData={setData} isAdmin={isAdmin} />;
}

function GstBillsPage({ data, setData, isAdmin }: CrudProps & { isAdmin: boolean }) {
  return <InvoiceBuilder mode="gstBill" data={data} setData={setData} isAdmin={isAdmin} />;
}

function InvoiceBuilder({ mode, data, setData, isAdmin }: CrudProps & { mode: "supplier" | "gstBill"; isAdmin: boolean }) {
  const isSupplier = mode === "supplier";
  const [editingId, setEditingId] = useState<number | null>(null);
  const [header, setHeader] = useState({ partyName: "", invoiceNumber: "", gstNumber: "", date: "2026-05-22" });
  const [item, setItem] = useState({ description: "", basic: 0, taxType: "sgst_cgst" as "sgst_cgst" | "igst", taxRate: 5 });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [filters, setFilters] = useState({ from: "", to: "", party: "" });
  const savedRows = isSupplier ? data.supplierInvoices : data.gstBills;
  const locked = Boolean(editingId) && Boolean(savedRows.find((row) => row.id === editingId)?.submitted) && !isAdmin;

  function addItem() {
    if (!item.description || item.basic <= 0) return;
    setItems([...items, buildItem({ ...item, id: nextId(items as unknown as Array<Record<string, unknown>>) })]);
    setItem({ description: "", basic: 0, taxType: "sgst_cgst", taxRate: 5 });
  }

  function submitInvoice(event: React.FormEvent) {
    event.preventDefault();
    if (!items.length) return;
    const id = editingId || nextId(savedRows as unknown as Array<Record<string, unknown>>);
    if (isSupplier) {
      const record: SupplierInvoice = { id, supplierName: header.partyName, supplierBillNumber: header.invoiceNumber, supplierGstNumber: header.gstNumber, invoiceDate: header.date, submitted: true, items };
      setData(withActivity(data, { ...data, supplierInvoices: editingId ? data.supplierInvoices.map((invoice) => invoice.id === id ? record : invoice) : [record, ...data.supplierInvoices] }, "Supplier Invoices", editingId ? "Modified" : "Added", record.supplierBillNumber, `${record.items.length} product(s)`));
    } else {
      const record: GstBill = { id, customerName: header.partyName, invoiceNumber: header.invoiceNumber, billDate: header.date, submitted: true, items };
      setData(withActivity(data, { ...data, gstBills: editingId ? data.gstBills.map((bill) => bill.id === id ? record : bill) : [record, ...data.gstBills] }, "GST Bills", editingId ? "Modified" : "Added", record.invoiceNumber, `${record.items.length} product(s)`));
    }
    setEditingId(null);
    setHeader({ partyName: "", invoiceNumber: "", gstNumber: "", date: "2026-05-22" });
    setItems([]);
  }

  function loadInvoice(row: SupplierInvoice | GstBill) {
    setEditingId(row.id);
    setHeader(isSupplier
      ? { partyName: (row as SupplierInvoice).supplierName, invoiceNumber: (row as SupplierInvoice).supplierBillNumber, gstNumber: (row as SupplierInvoice).supplierGstNumber, date: (row as SupplierInvoice).invoiceDate }
      : { partyName: (row as GstBill).customerName, invoiceNumber: (row as GstBill).invoiceNumber, gstNumber: "", date: (row as GstBill).billDate });
    setItems(row.items);
  }

  const filteredRows = savedRows
    .filter((invoice) => inDateRange(isSupplier ? (invoice as SupplierInvoice).invoiceDate : (invoice as GstBill).billDate, filters.from, filters.to))
    .filter((invoice) => !filters.party || (isSupplier ? (invoice as SupplierInvoice).supplierName : (invoice as GstBill).customerName).toLowerCase().includes(filters.party.toLowerCase()));

  const flatRows = filteredRows.flatMap((invoice) => invoice.items.map((line, index) => ({
    id: `${invoice.id}-${line.id}`,
    invoiceId: invoice.id,
    sNo: index + 1,
    invoiceNumber: isSupplier ? (invoice as SupplierInvoice).supplierBillNumber : (invoice as GstBill).invoiceNumber,
    partyName: isSupplier ? (invoice as SupplierInvoice).supplierName : (invoice as GstBill).customerName,
    description: line.description,
    basic: line.basic,
    taxType: line.taxType === "igst" ? "IGST" : "SGST + CGST",
    taxRate: `${line.taxRate}%`,
    tax: line.tax,
    total: line.total,
    status: invoice.submitted ? "Submitted" : "Draft",
    source: invoice
  })));

  return (
    <section>
      <form className="form-panel" onSubmit={submitInvoice}>
        <div className="section-heading"><h2>{isSupplier ? "Supplier Details" : "GST Bill Details"}</h2><button className="primary" type="submit"><Plus size={16} />Submit Invoice</button></div>
        <div className="form-grid">
          <label>{isSupplier ? "Supplier Name" : "Customer Name"}<input disabled={locked} value={header.partyName} onChange={(event) => setHeader({ ...header, partyName: event.target.value })} /></label>
          <label>{isSupplier ? "Supplier Bill Number" : "Invoice Number"}<input disabled={locked} value={header.invoiceNumber} onChange={(event) => setHeader({ ...header, invoiceNumber: event.target.value })} /></label>
          {isSupplier ? <label>Supplier GST Number<input disabled={locked} value={header.gstNumber} onChange={(event) => setHeader({ ...header, gstNumber: event.target.value })} /></label> : null}
          <label>Date<input disabled={locked} type="date" value={header.date} onChange={(event) => setHeader({ ...header, date: event.target.value })} /></label>
        </div>
        <div className="line-item-editor">
          <label className="wide">Description<input disabled={locked} value={item.description} onChange={(event) => setItem({ ...item, description: event.target.value })} /></label>
          <label>Basic<input disabled={locked} type="number" value={item.basic} onChange={(event) => setItem({ ...item, basic: Number(event.target.value) })} /></label>
          <label>Tax Type<select disabled={locked} value={item.taxType} onChange={(event) => setItem({ ...item, taxType: event.target.value as "sgst_cgst" | "igst", taxRate: event.target.value === "igst" ? 5 : 5 })}><option value="sgst_cgst">SGST + CGST</option><option value="igst">IGST</option></select></label>
          <label>Tax %<select disabled={locked} value={item.taxRate} onChange={(event) => setItem({ ...item, taxRate: Number(event.target.value) })}>{taxOptions(item.taxType).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <button className="ghost" type="button" onClick={addItem} disabled={locked}><Plus size={16} />Add Product</button>
        </div>
        <DataTable rows={items} columns={[["id", "S.No"], ["description", "Description"], ["basic", "Basic"], ["taxType", "Tax Type"], ["taxRate", "Tax %"], ["tax", "Tax"], ["total", "Total"]]} actions={(row) => !locked ? <button className="danger" type="button" onClick={() => setItems(items.filter((line) => line.id !== row.id))}><Trash2 size={15} />Remove</button> : null} />
      </form>
      <div className="filter-bar record-search">
        <label>From Date<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
        <label>To Date<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
        <label>Customer / Supplier Filter<input placeholder={isSupplier ? "Search supplier" : "Search customer"} value={filters.party} onChange={(event) => setFilters({ ...filters, party: event.target.value })} /></label>
        <button className="ghost" onClick={() => setFilters({ from: "", to: "", party: "" })}><X size={16} />Clear</button>
      </div>
      <DataTable rows={flatRows} columns={[["invoiceNumber", "Invoice No"], ["partyName", isSupplier ? "Supplier" : "Customer"], ["description", "Description"], ["basic", "Basic"], ["taxType", "Tax"], ["taxRate", "Rate"], ["total", "Total"], ["status", "Status"]]} actions={isAdmin ? (row) => <button className="ghost" onClick={() => loadInvoice(row.source as SupplierInvoice | GstBill)}><Edit3 size={15} />Admin Edit</button> : undefined} />
    </section>
  );
}

function GstDetailsPage({ data, setData, filters, setFilters }: CrudProps & { filters: { month: string; year: string }; setFilters: (filters: { month: string; year: string }) => void }) {
  const [payment, setPayment] = useState({ date: "2026-05-23", transactionId: "", amountPaid: 0 });
  const supplierInvoices = data.supplierInvoices.filter((invoice) => byMonthYear(invoice.invoiceDate, filters.month, filters.year));
  const salesInvoices = data.gstBills.filter((bill) => byMonthYear(bill.billDate, filters.month, filters.year));
  const input = sumInvoiceGst(supplierInvoices);
  const output = sumInvoiceGst(salesInvoices);
  const grossPayable = Math.max(output.total - input.total, 0);
  const totalPaid = data.gstPayments.reduce((sum, row) => sum + row.amountPaid, 0);
  const remainingPayable = Math.max(grossPayable - totalPaid, 0);

  function addGstPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!payment.transactionId || payment.amountPaid <= 0 || payment.amountPaid > remainingPayable) return;
    const gstPayment: GstPayment = { id: Date.now(), ...payment };
    const expense: Expense = { id: Date.now() + 1, description: `GST Payment - ${payment.transactionId}`, value: payment.amountPaid, category: "other", taxType: "na", gst: 0, modeOfPayment: "bank", expenseDate: payment.date };
    const nextData = { ...data, gstPayments: [gstPayment, ...data.gstPayments], expenses: [expense, ...data.expenses] };
    setData(withActivity(data, nextData, "GST Details", "GST Payment Made", payment.transactionId, `Paid ${currency.format(payment.amountPaid)}`));
    setPayment({ date: "2026-05-23", transactionId: "", amountPaid: 0 });
  }

  return (
    <section>
      <FilterBar filters={filters} setFilters={setFilters} compact />
      <div className="gst-detail-grid">
        <GstBox title="Input Credit" sgst={input.sgst} cgst={input.cgst} igst={input.igst} />
        <GstBox title="Output GST" sgst={output.sgst} cgst={output.cgst} igst={output.igst} />
        <SummaryCard title="GST Payable" value={currency.format(remainingPayable)} />
        <SummaryCard title="GST Payment Made" value={currency.format(totalPaid)} />
      </div>
      <form className="form-panel" onSubmit={addGstPayment}>
        <div className="section-heading"><h2>GST Payment Made</h2><button className="primary" type="submit" disabled={payment.amountPaid > remainingPayable}><Plus size={16} />Add Payment</button></div>
        <div className="form-grid">
          <label>Date<input type="date" value={payment.date} onChange={(event) => setPayment({ ...payment, date: event.target.value })} /></label>
          <label>Transaction ID<input value={payment.transactionId} onChange={(event) => setPayment({ ...payment, transactionId: event.target.value })} /></label>
          <label>Amount Paid<input type="number" value={payment.amountPaid} onChange={(event) => setPayment({ ...payment, amountPaid: Number(event.target.value) })} /></label>
          <label>Remaining GST Payable<input value={currency.format(remainingPayable)} readOnly /></label>
        </div>
        {payment.amountPaid > remainingPayable ? <p className="error">Payment amount cannot be greater than remaining GST Payable.</p> : null}
      </form>
      <DataTable rows={data.gstPayments.map((row) => ({ ...row, remainingAfterPayment: Math.max(grossPayable - data.gstPayments.filter((paymentRow) => paymentRow.id >= row.id).reduce((sum, paymentRow) => sum + paymentRow.amountPaid, 0), 0) }))} columns={[["date", "Date"], ["transactionId", "Transaction ID"], ["amountPaid", "Amount Paid"], ["remainingAfterPayment", "Remaining Balance"]]} />
    </section>
  );
}

function ExpensesPage({ data, setData }: CrudProps) {
  const [form, setForm] = useState({ expenseDate: "2026-05-22", description: "", value: 0, taxType: "na" as "sgst_cgst" | "igst" | "na", taxRate: 0, modeOfPayment: "cash" as "cash" | "bank" });
  const [breakup, setBreakup] = useState<{ date: string; category?: "daily" | "other" } | null>(null);
  const [filters, setFilters] = useState({ from: "", to: "", party: "" });
  const filteredExpenses = data.expenses
    .filter((expense) => inDateRange(expense.expenseDate, filters.from, filters.to))
    .filter((expense) => !filters.party || expense.description.toLowerCase().includes(filters.party.toLowerCase()));
  const rows = expenseDetailRows(filteredExpenses);
  const taxValue = form.taxType === "na" ? 0 : Math.round(form.value * form.taxRate) / 100;
  const balances = openingBalances(data);
  const selectedBalance = form.modeOfPayment === "cash" ? balances.cashOpeningBalance : balances.bankOpeningBalance;
  const projectedBalance = selectedBalance - form.value - taxValue;
  const breakupRows = breakup ? filteredExpenses.filter((expense) => expense.expenseDate === breakup.date && (!breakup.category || expense.category === breakup.category)) : [];

  function addOtherExpense(event: React.FormEvent) {
    event.preventDefault();
    const record: Expense = { id: Date.now(), category: "other", gst: taxValue, ...form };
    setData(withActivity(data, { ...data, expenses: [record, ...data.expenses] }, "Expenses", "Added", record.description, `Other expense ${currency.format(record.value)}`));
    setForm({ expenseDate: "2026-05-22", description: "", value: 0, taxType: "na", taxRate: 0, modeOfPayment: "cash" });
  }

  return (
    <section>
      <form className="form-panel" onSubmit={addOtherExpense}>
        <div className="section-heading"><h2>Add Other Expense</h2><button className="primary" type="submit"><Plus size={16} />Add Expense</button></div>
        <div className="form-grid">
          <label>Date<input type="date" value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} /></label>
          <label className="wide">Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label>Other Expenses<input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} /></label>
          <label>Mode of Payment<select required value={form.modeOfPayment} onChange={(event) => setForm({ ...form, modeOfPayment: event.target.value as "cash" | "bank" })}><option value="cash">Cash</option><option value="bank">Bank</option></select></label>
          <label>Tax Type<select value={form.taxType} onChange={(event) => {
            const taxType = event.target.value as "sgst_cgst" | "igst" | "na";
            setForm({ ...form, taxType, taxRate: taxType === "na" ? 0 : 5 });
          }}><option value="na">NA</option><option value="sgst_cgst">SGST + CGST</option><option value="igst">IGST</option></select></label>
          <label>Tax %<select value={form.taxRate} disabled={form.taxType === "na"} onChange={(event) => setForm({ ...form, taxRate: Number(event.target.value) })}>{expenseTaxOptions(form.taxType).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>Tax<input type="number" value={taxValue} readOnly /></label>
        </div>
        <p className="status-note">Daily expenses are fetched from Daily Sale Expense Breakup. Use this section for salary payments and vendor payments. {form.modeOfPayment === "cash" ? "Cash" : "Bank"} balance after this expense: {currency.format(projectedBalance)}.</p>
      </form>
      <div className="filter-bar record-search">
        <label>From Date<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
        <label>To Date<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
        <label>Customer / Supplier Filter<input placeholder="Search expense description" value={filters.party} onChange={(event) => setFilters({ ...filters, party: event.target.value })} /></label>
        <button className="ghost" onClick={() => { setFilters({ from: "", to: "", party: "" }); setBreakup(null); }}><X size={16} />Clear</button>
      </div>
      <DataTable
        rows={rows}
        columns={[["expenseDate", "Date"], ["dailyExpense", "Daily Expense"], ["otherExpense", "Other Expenses"], ["tax", "Tax"], ["total", "Total"]]}
        actions={(row) => <button className="ghost" onClick={() => setBreakup({ date: String(row.expenseDate) })}><Search size={15} />Breakup</button>}
        cellActions={{
          expenseDate: (row) => setBreakup({ date: String(row.expenseDate) }),
          dailyExpense: (row) => setBreakup({ date: String(row.expenseDate), category: "daily" }),
          otherExpense: (row) => setBreakup({ date: String(row.expenseDate), category: "other" })
        }}
      />
      {breakup ? (
        <div className="form-panel">
          <div className="section-heading">
            <h2>Expense Breakup - {breakup.date}</h2>
            <button className="ghost" onClick={() => setBreakup(null)}><X size={16} />Close</button>
          </div>
          <DataTable rows={breakupRows.map((expense) => ({ ...expense, category: expense.category === "daily" ? "Daily Expense" : "Other Expense", total: expense.value + expense.gst }))} columns={[["expenseDate", "Date"], ["category", "Type"], ["description", "Description"], ["value", "Value"], ["taxType", "Tax Type"], ["gst", "Tax"], ["modeOfPayment", "Mode of Payment"], ["total", "Total"]]} />
        </div>
      ) : null}
    </section>
  );
}

function EmployeesPage({ data, setData }: CrudProps) {
  const blankEmployee: Employee = { id: 0, name: "", aadhaarNumber: "", bankDetail: "", role: "", fullTime: true, partTime: false, salary: 0, joiningDate: "2026-05-22" };
  const [form, setForm] = useState<Employee>(blankEmployee);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedEmployee = selected ? data.employees.find((employee) => employee.name === selected) : null;
  const salaryHistory = selected ? data.payroll.filter((row) => row.employeeName === selected).sort((a, b) => b.date.localeCompare(a.date)) : [];

  function saveEmployee(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name) return;
    const record = { ...form, id: form.id || nextId(data.employees as unknown as Array<Record<string, unknown>>) };
    const rows = form.id ? data.employees.map((employee) => employee.id === form.id ? record : employee) : [record, ...data.employees];
    setData(withActivity(data, { ...data, employees: rows }, "Employees", form.id ? "Modified" : "Added", record.name, "Employee profile saved"));
    setForm(blankEmployee);
  }

  function deleteEmployee(row: Record<string, unknown>) {
    const nextRows = data.employees.filter((employee) => employee.id !== row.id);
    setData(withActivity(data, { ...data, employees: nextRows }, "Employees", "Deleted", String(row.name || row.id), "Employee profile deleted"));
  }

  return (
    <section>
      <form className="form-panel" onSubmit={saveEmployee}>
        <div className="section-heading">
          <h2>Employee Details</h2>
          <div className="mini-actions">
            {form.id ? <button type="button" onClick={() => setForm(blankEmployee)}><X size={16} />Cancel</button> : null}
            <button type="submit" className="primary"><Plus size={16} />{form.id ? "Update Employee" : "Add Employee"}</button>
          </div>
        </div>
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Aadhaar Number<input value={form.aadhaarNumber} onChange={(event) => setForm({ ...form, aadhaarNumber: event.target.value })} /></label>
          <label className="wide">Bank Detail<input value={form.bankDetail} onChange={(event) => setForm({ ...form, bankDetail: event.target.value })} /></label>
          <label>Role<input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label>
          <label>Full Time<input type="checkbox" checked={form.fullTime} onChange={(event) => setForm({ ...form, fullTime: event.target.checked })} /></label>
          <label>Part Time<input type="checkbox" checked={form.partTime} onChange={(event) => setForm({ ...form, partTime: event.target.checked })} /></label>
          <label>Salary<input type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: Number(event.target.value) })} /></label>
          <label>Joining Date<input type="date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} /></label>
        </div>
      </form>
      <DataTable
        rows={data.employees}
        columns={[["name", "Name"], ["aadhaarNumber", "Aadhaar Number"], ["bankDetail", "Bank Detail"], ["role", "Role"], ["salary", "Salary"], ["joiningDate", "Joining Date"]]}
        actions={(row) => <div className="mini-actions"><button className="ghost" onClick={() => setForm(row as unknown as Employee)}><Edit3 size={15} />Edit</button><button className="danger" onClick={() => deleteEmployee(row)}><Trash2 size={15} />Delete</button></div>}
        cellActions={{ name: (row) => setSelected(String(row.name)) }}
      />
      {selectedEmployee ? (
        <div className="form-panel">
          <div className="section-heading">
            <h2>{selectedEmployee.name} Profile</h2>
            <button className="ghost" onClick={() => setSelected(null)}><X size={16} />Close</button>
          </div>
          <div className="profile-summary">
            <SummaryCard title="Role" value={selectedEmployee.role || "Not set"} />
            <SummaryCard title="Salary" value={currency.format(selectedEmployee.salary)} />
            <SummaryCard title="Joining Date" value={selectedEmployee.joiningDate} />
          </div>
          <DataTable rows={salaryHistory} columns={[["date", "Date"], ["payrollMonth", "Salary Month"], ["payrollYear", "Salary Year"], ["employeeName", "Employee Name"], ["salary", "Salary"], ["advanceTaken", "Advance Deduction"], ["salaryToBePaid", "Salary to be Paid"]]} />
        </div>
      ) : null}
    </section>
  );
}

function AttendancePage({ data, setData }: CrudProps) {
  const [filters, setFilters] = useState({ month: "May", year: "2026" });
  const rows = data.attendance.filter((row) => byMonthYear(row.date, filters.month, filters.year));

  async function uploadAttendance(file: File) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer());
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const matrix = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "" });
    const [headers, ...rows] = matrix;
    const lower = headers.map((header) => String(header).toLowerCase());
    const nameIndex = lower.findIndex((header) => header.includes("employee") || header.includes("name"));
    const inIndex = lower.findIndex((header) => header.includes("in"));
    const outIndex = lower.findIndex((header) => header.includes("out"));
    const dateIndex = lower.findIndex((header) => header.includes("date"));
    const mapped = rows
      .filter((row) => row[nameIndex])
      .map((row, index) => {
        const inTime = excelTime(row[inIndex]);
        const outTime = excelTime(row[outIndex]);
        return { id: Date.now() + index, employeeName: String(row[nameIndex]), date: dateIndex >= 0 ? excelDate(row[dateIndex]) : "2026-05-22", inTime, outTime, totalWorkDuration: duration(inTime, outTime) };
      });
    setData(withActivity(data, { ...data, attendance: [...mapped, ...data.attendance] }, "Attendance", "Uploaded", file.name, `${mapped.length} attendance row(s)`));
  }

  return (
    <section>
      <div className="form-panel">
        <div className="section-heading"><h2>Attendance Upload</h2><label className="upload-button"><Upload size={16} />Upload Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => event.target.files?.[0] && uploadAttendance(event.target.files[0])} /></label></div>
        <p className="status-note">The upload maps Employee Name, In Time and Out Time from the punching-machine sheet.</p>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} compact />
      <DataTable rows={rows} columns={[["employeeName", "Employee Name"], ["date", "Date"], ["inTime", "In Time"], ["outTime", "Out Time"], ["totalWorkDuration", "Total Work Duration"]]} entity="attendance" data={data} setData={setData} />
    </section>
  );
}

function PayrollPage({ data, setData }: CrudProps) {
  const [form, setForm] = useState<Payroll>({ id: 0, date: "2026-05-25", payrollMonth: "May", payrollYear: "2026", employeeName: "", salary: 0, advanceTaken: 0, salaryToBePaid: 0 });
  const [advanceForm, setAdvanceForm] = useState({ date: "2026-05-25", employeeName: "", amount: 0, months: 1 });
  const [payslip, setPayslip] = useState<Payroll | null>(null);
  const [filters, setFilters] = useState({ month: "May", year: "2026" });
  const rows = data.payroll.filter((row) => byMonthYear(row.date, filters.month, filters.year));
  const selectedEmployee = data.employees.find((employee) => employee.name === form.employeeName);
  const attendanceBasedSalary = selectedEmployee ? attendanceSalary(selectedEmployee.name, selectedEmployee.salary, form.date, data.attendance) : 0;
  const salary = form.salary || attendanceBasedSalary;
  const activeAdvanceDeduction = form.employeeName ? advanceDeductionForEmployee(data.salaryAdvances, data.payroll, form.employeeName) : 0;
  const salaryToBePaid = Math.max(salary - activeAdvanceDeduction, 0);

  function addAdvance(event: React.FormEvent) {
    event.preventDefault();
    if (!advanceForm.employeeName || advanceForm.amount <= 0 || advanceForm.months <= 0) return;
    const record: SalaryAdvance = { id: Date.now(), ...advanceForm, deductionPerMonth: Math.ceil(advanceForm.amount / advanceForm.months) };
    const expense: Expense = { id: Date.now() + 1, description: `Salary Advance - ${record.employeeName}`, value: record.amount, category: "other", taxType: "na", gst: 0, modeOfPayment: "bank", expenseDate: record.date };
    const nextData = { ...data, salaryAdvances: [record, ...data.salaryAdvances], expenses: [expense, ...data.expenses] };
    setData(withActivity(data, nextData, "Payroll", "Advance Added", record.employeeName, `${currency.format(record.amount)} over ${record.months} month(s)`));
    setAdvanceForm({ date: "2026-05-25", employeeName: "", amount: 0, months: 1 });
  }

  function processSalary(event: React.FormEvent) {
    event.preventDefault();
    if (!form.employeeName || salary <= 0) return;
    const record: Payroll = { ...form, id: Date.now(), salary, advanceTaken: activeAdvanceDeduction, salaryToBePaid };
    const expenses: Expense[] = [
      { id: Date.now() + 1, description: `Salary Payment - ${record.employeeName}`, value: record.salaryToBePaid, category: "other", taxType: "na", gst: 0, modeOfPayment: "bank", expenseDate: record.date }
    ];
    const nextData = { ...data, payroll: [record, ...data.payroll], expenses: [...expenses, ...data.expenses] };
    setData(withActivity(data, nextData, "Payroll", "Salary Processed", record.employeeName, `${record.payrollMonth} ${record.payrollYear}, paid ${currency.format(record.salaryToBePaid)}${record.advanceTaken ? `, advance deduction ${currency.format(record.advanceTaken)}` : ""}`));
    setPayslip(record);
    setForm({ id: 0, date: "2026-05-25", payrollMonth: "May", payrollYear: "2026", employeeName: "", salary: 0, advanceTaken: 0, salaryToBePaid: 0 });
  }

  return (
    <section>
      <form className="form-panel" onSubmit={addAdvance}>
        <div className="section-heading"><h2>Employee Advance</h2><button className="primary" type="submit"><Plus size={16} />Add Advance</button></div>
        <div className="form-grid">
          <label>Date<input type="date" value={advanceForm.date} onChange={(event) => setAdvanceForm({ ...advanceForm, date: event.target.value })} /></label>
          <label>Employee Name<select value={advanceForm.employeeName} onChange={(event) => setAdvanceForm({ ...advanceForm, employeeName: event.target.value })}><option value="">Select employee</option>{data.employees.map((employee) => <option key={employee.id} value={employee.name}>{employee.name}</option>)}</select></label>
          <label>Advance Amount<input type="number" value={advanceForm.amount} onChange={(event) => setAdvanceForm({ ...advanceForm, amount: Number(event.target.value) })} /></label>
          <label>Deduct For Months<input type="number" min="1" value={advanceForm.months} onChange={(event) => setAdvanceForm({ ...advanceForm, months: Number(event.target.value) })} /></label>
          <label>Monthly Deduction<input value={currency.format(advanceForm.months > 0 ? Math.ceil(advanceForm.amount / advanceForm.months) : 0)} readOnly /></label>
        </div>
      </form>
      <form className="form-panel" onSubmit={processSalary}>
        <div className="section-heading"><h2>Process Salary Payment</h2><button className="primary" type="submit"><Plus size={16} />Process Salary</button></div>
        <div className="form-grid">
          <label>Date<input type="date" value={form.date} onChange={(event) => {
            const nextDate = event.target.value;
            const employee = data.employees.find((row) => row.name === form.employeeName);
            setForm({ ...form, date: nextDate, salary: employee ? attendanceSalary(employee.name, employee.salary, nextDate, data.attendance) : form.salary });
          }} /></label>
          <label>Employee Name<select value={form.employeeName} onChange={(event) => {
            const employee = data.employees.find((row) => row.name === event.target.value);
            setForm({ ...form, employeeName: event.target.value, salary: employee ? attendanceSalary(employee.name, employee.salary, form.date, data.attendance) : 0 });
          }}><option value="">Select employee</option>{data.employees.map((employee) => <option key={employee.id} value={employee.name}>{employee.name}</option>)}</select></label>
          <label>Salary Month<select value={form.payrollMonth} onChange={(event) => setForm({ ...form, payrollMonth: event.target.value })}>{months.map((month) => <option key={month}>{month}</option>)}</select></label>
          <label>Salary Year<select value={form.payrollYear} onChange={(event) => setForm({ ...form, payrollYear: event.target.value })}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
          <label>Salary<input type="number" value={salary} onChange={(event) => setForm({ ...form, salary: Number(event.target.value) })} /></label>
          <label>Advance Deduction<input value={currency.format(activeAdvanceDeduction)} readOnly /></label>
          <label>Salary to be Paid<input value={currency.format(salaryToBePaid)} readOnly /></label>
        </div>
        <p className="status-note">Salary payments and advances are automatically recorded in Expenses and mapped to the employee profile.</p>
      </form>
      <FilterBar filters={filters} setFilters={setFilters} compact />
      <DataTable
        rows={rows}
        columns={[["date", "Date"], ["payrollMonth", "Salary Month"], ["payrollYear", "Salary Year"], ["employeeName", "Employee Name"], ["salary", "Salary"], ["advanceTaken", "Advance Deduction"], ["salaryToBePaid", "Salary to be Paid"]]}
        actions={(row) => <button className="ghost" onClick={() => setPayslip(row as Payroll)}><FileText size={15} />Payslip</button>}
      />
      <DataTable rows={data.salaryAdvances} columns={[["date", "Date"], ["employeeName", "Employee Name"], ["amount", "Advance Amount"], ["months", "Deduct Months"], ["deductionPerMonth", "Monthly Deduction"]]} />
      {payslip ? (
        <div className="form-panel payslip-panel">
          <div className="section-heading">
            <h2>Payslip</h2>
            <div className="mini-actions">
              <button onClick={() => window.print()}><Printer size={15} />Print</button>
              <button onClick={() => setPayslip(null)}><X size={15} />Close</button>
            </div>
          </div>
          <div className="payslip">
            <strong>GREENWING</strong>
            <span>Date: {payslip.date}</span>
            <span>Salary Month: {payslip.payrollMonth} {payslip.payrollYear}</span>
            <span>Employee: {payslip.employeeName}</span>
            <span>Salary: {currency.format(payslip.salary)}</span>
            <span>Advance Deduction: {currency.format(payslip.advanceTaken)}</span>
            <span>Salary to be Paid: {currency.format(payslip.salaryToBePaid)}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function UserAuthorizationPage({ data, setData }: CrudProps) {
  const blankUser: AppUser = { id: 0, name: "", username: "", password: "", role: "user", permissions: ["Dashboard"] };
  const [form, setForm] = useState<AppUser>(blankUser);
  const duplicateUsername = data.appUsers.some((user) => user.username === form.username && user.id !== form.id);

  function saveUser(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name || !form.username || !form.password || duplicateUsername) return;
    const record = { ...form, id: form.id || nextId(data.appUsers as unknown as Array<Record<string, unknown>>) };
    setData(withActivity(data, { ...data, appUsers: form.id ? data.appUsers.map((user) => user.id === form.id ? record : user) : [record, ...data.appUsers] }, "User Authorization", form.id ? "Modified" : "Added", record.username, `${record.permissions.length} permission(s)`));
    setForm(blankUser);
  }

  function togglePermission(module: string) {
    const permissions = form.permissions.includes(module) ? form.permissions.filter((item) => item !== module) : [...form.permissions, module];
    setForm({ ...form, permissions });
  }

  return (
    <section>
      <form className="form-panel" onSubmit={saveUser}>
        <div className="section-heading">
          <h2>{form.id ? "Manage User Access" : "Create New User"}</h2>
          <div className="mini-actions">
            {form.id ? <button type="button" onClick={() => setForm(blankUser)}><X size={16} />Cancel</button> : null}
            <button className="primary" type="submit" disabled={duplicateUsername}><ShieldCheck size={16} />{form.id ? "Update User" : "Create User"}</button>
          </div>
        </div>
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Username<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
          <PasswordInput label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
          <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as "admin" | "user" })}><option value="user">User</option><option value="admin">Admin</option></select></label>
        </div>
        {duplicateUsername ? <p className="error">Username already exists. Please use a different username.</p> : null}
        <div className="permission-grid">
          {permissionModules.map((module) => (
            <label key={module} className="permission-option"><input type="checkbox" checked={form.permissions.includes(module)} onChange={() => togglePermission(module)} />{module}</label>
          ))}
        </div>
      </form>
      <DataTable rows={data.appUsers.map((user) => ({ ...user, permissions: user.permissions.join(", ") }))} columns={[["name", "Name"], ["username", "Username"], ["password", "Password"], ["role", "Role"], ["permissions", "Allowed Modules"]]} actions={(row) => <button className="ghost" onClick={() => {
        const selected = data.appUsers.find((user) => user.id === row.id);
        if (selected) setForm(selected);
      }}><Edit3 size={15} />Manage / Reset</button>} />
    </section>
  );
}

function StockManagementPage({ data, setData, isAdmin }: CrudProps & { isAdmin: boolean }) {
  const [stockInForm, setStockInForm] = useState({ date: "2026-05-22", description: "", stockIn: 0 });
  const [stockOutForm, setStockOutForm] = useState({ date: "2026-05-22", description: "", stockOut: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const availableStock = stockAvailable(data.stockMovements, stockOutForm.description);
  const stockOutBlocked = Boolean(stockOutForm.description) && stockOutForm.stockOut > availableStock;

  function addStockIn(event: React.FormEvent) {
    event.preventDefault();
    if (!stockInForm.description || stockInForm.stockIn <= 0) return;
    const record: StockMovement = { id: editingId || Date.now(), ...stockInForm, stockOut: 0 };
    const rows = editingId ? data.stockMovements.map((row) => row.id === editingId ? record : row) : [record, ...data.stockMovements];
    setData(withActivity(data, { ...data, stockMovements: rows }, "Stock", editingId ? "Modified" : "Added", record.description, `Stock In ${record.stockIn}, Stock Out ${record.stockOut}`));
    setStockInForm({ date: "2026-05-22", description: "", stockIn: 0 });
    setEditingId(null);
  }

  function addStockOut(event: React.FormEvent) {
    event.preventDefault();
    if (!stockOutForm.description || stockOutForm.stockOut <= 0 || stockOutBlocked) return;
    const record: StockMovement = { id: editingId || Date.now(), date: stockOutForm.date, description: stockOutForm.description, stockIn: 0, stockOut: stockOutForm.stockOut };
    const rows = editingId ? data.stockMovements.map((row) => row.id === editingId ? record : row) : [record, ...data.stockMovements];
    setData(withActivity(data, { ...data, stockMovements: rows }, "Stock", editingId ? "Modified" : "Added", record.description, `Stock Out ${record.stockOut}`));
    setStockOutForm({ date: "2026-05-22", description: "", stockOut: 0 });
    setEditingId(null);
  }

  function editStock(row: StockMovement) {
    setEditingId(row.id);
    if (row.stockIn > 0) {
      setStockInForm({ date: row.date, description: row.description, stockIn: row.stockIn });
      setStockOutForm({ date: "2026-05-22", description: "", stockOut: 0 });
    } else {
      setStockOutForm({ date: row.date, description: row.description, stockOut: row.stockOut });
      setStockInForm({ date: "2026-05-22", description: "", stockIn: 0 });
    }
  }

  return (
    <section>
      <form className="form-panel" onSubmit={addStockIn}>
        <div className="section-heading"><h2>Stock In</h2><button className="primary" type="submit"><Plus size={16} />{editingId && stockInForm.description ? "Update Stock In" : "Add Stock In"}</button></div>
        <div className="form-grid">
          <label>Date<input type="date" value={stockInForm.date} onChange={(event) => setStockInForm({ ...stockInForm, date: event.target.value })} /></label>
          <label className="wide">Description<input value={stockInForm.description} onChange={(event) => setStockInForm({ ...stockInForm, description: event.target.value })} /></label>
          <label>Stock In<input type="number" value={stockInForm.stockIn} onChange={(event) => setStockInForm({ ...stockInForm, stockIn: Number(event.target.value) })} /></label>
        </div>
      </form>
      <form className="form-panel" onSubmit={addStockOut}>
        <div className="section-heading"><h2>Stock Out</h2><button className="primary" type="submit" disabled={stockOutBlocked}><Plus size={16} />{editingId && stockOutForm.description ? "Update Stock Out" : "Process Stock Out"}</button></div>
        <div className="form-grid">
          <label>Date<input type="date" value={stockOutForm.date} onChange={(event) => setStockOutForm({ ...stockOutForm, date: event.target.value })} /></label>
          <label className="wide">Description<input list="stock-products" value={stockOutForm.description} onChange={(event) => setStockOutForm({ ...stockOutForm, description: event.target.value })} /></label>
          <datalist id="stock-products">{stockInventoryRows(data.stockMovements).map((row) => <option key={row.description} value={row.description} />)}</datalist>
          <label>Stock Available<input value={stockOutForm.description ? String(availableStock) : ""} readOnly /></label>
          <label>Stock Out Quantity<input type="number" value={stockOutForm.stockOut} onChange={(event) => setStockOutForm({ ...stockOutForm, stockOut: Number(event.target.value) })} /></label>
        </div>
        {stockOutBlocked ? <p className="error">Sufficient stock is not available. Current available stock is {availableStock}.</p> : null}
      </form>
      <DataTable rows={data.stockMovements} columns={[["date", "Date"], ["description", "Description"], ["stockIn", "Stock In"], ["stockOut", "Stock Out"]]} actions={isAdmin ? (row) => <button className="ghost" onClick={() => editStock(row as StockMovement)}><Edit3 size={15} />Edit</button> : undefined} />
    </section>
  );
}

function OverallStockInventoryPage({ data }: { data: AppData }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filters, setFilters] = useState({ month: "May", year: "2026" });
  const filteredMovements = data.stockMovements.filter((row) => byMonthYear(row.date, filters.month, filters.year));
  const rows = stockInventoryRows(filteredMovements);
  const history = selected ? filteredMovements.filter((row) => row.description === selected).sort((a, b) => b.date.localeCompare(a.date)) : [];

  return (
    <section>
      <div className="form-panel">
        <h2>Overall Stock Inventory</h2>
        <p className="status-note">View-only stock summary. Click a product description to inspect movement history.</p>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} compact />
      <DataTable rows={rows} columns={[["description", "Description of Goods"], ["available", "Total Quantity Available"]]} cellActions={{ description: (row) => setSelected(String(row.description)) }} />
      {selected ? (
        <div className="form-panel">
          <div className="section-heading"><h2>Stock History - {selected}</h2><button className="ghost" onClick={() => setSelected(null)}><X size={16} />Close</button></div>
          <DataTable rows={history.map((row) => ({ ...row, movement: row.stockIn ? "Stock In" : "Stock Out", quantity: row.stockIn || row.stockOut }))} columns={[["date", "Date"], ["movement", "Movement"], ["quantity", "Quantity"], ["stockIn", "Stock In"], ["stockOut", "Stock Out"]]} />
        </div>
      ) : null}
    </section>
  );
}

function ActivityLogsPage({ data }: { data: AppData }) {
  const [filters, setFilters] = useState({ from: "", to: "", user: "" });
  const users = Array.from(new Set(data.activityLogs.map((log) => log.user))).filter(Boolean);
  const rows = data.activityLogs
    .filter((log) => inDateRange(log.timestamp.slice(0, 10), filters.from, filters.to))
    .filter((log) => !filters.user || log.user === filters.user)
    .map((log) => ({ ...log, timestamp: new Date(log.timestamp).toLocaleString() }));

  return (
    <section>
      <div className="form-panel">
        <h2>User Activity History</h2>
        <p className="status-note">Admin tracking for records added, modified, uploaded or deleted across modules.</p>
        <div className="filter-bar inline-filter">
          <label>From Date<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
          <label>To Date<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
          <label>User Filter<select value={filters.user} onChange={(event) => setFilters({ ...filters, user: event.target.value })}><option value="">All Users</option>{users.map((user) => <option key={user}>{user}</option>)}</select></label>
          <button className="ghost" onClick={() => setFilters({ from: "", to: "", user: "" })}>Clear</button>
        </div>
      </div>
      <DataTable rows={rows} columns={[["timestamp", "Date & Time"], ["user", "User"], ["module", "Module"], ["action", "Action"], ["record", "Record"], ["details", "Details"]]} />
    </section>
  );
}

type CrudProps = { data: AppData; setData: (data: AppData) => void };

function CrudForm({ title, entity, data, setData, fields, buttonLabel }: CrudProps & { title: string; entity: Extract<Entity, "employees" | "attendance" | "payroll">; fields: string[]; buttonLabel?: string }) {
  const [form, setForm] = useState<FormState>(blankForms[entity] as FormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const rows = data[entity] as Array<Record<string, unknown>>;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const id = editingId || nextId(rows);
    const record: Record<string, string | number | boolean> = { ...form, id };
    const updatedRows = editingId ? rows.map((row) => row.id === editingId ? record : row) : [record, ...rows];
    setData(withActivity(data, { ...data, [entity]: updatedRows } as AppData, labelize(entity), editingId ? "Modified" : "Added", String(record.name || record.employeeName || record.id), "Record saved"));
    setForm(blankForms[entity] as FormState);
    setEditingId(null);
  }

  return (
    <form className="form-panel" onSubmit={submit}>
      <div className="section-heading"><h2>{title}</h2><button type="submit" className="primary"><Plus size={16} />{editingId ? "Update" : buttonLabel || "Add"}</button></div>
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field} className={field === "bankDetail" ? "wide" : ""}>{labelize(field)}
            {typeof (blankForms[entity] as FormState)[field] === "boolean"
              ? <input type="checkbox" checked={Boolean(form[field])} onChange={(event) => setForm({ ...form, [field]: event.target.checked })} />
              : <input type={dateFields.has(field) ? "date" : timeFields.has(field) ? "time" : numberFields.has(field) ? "number" : "text"} value={String(form[field] ?? "")} onChange={(event) => setForm({ ...form, [field]: numberFields.has(field) ? Number(event.target.value) : event.target.value })} />}
          </label>
        ))}
      </div>
      {rows.length > 0 ? <div className="mini-actions"><button type="button" onClick={() => { const first = rows[0]; setEditingId(Number(first.id)); setForm({ ...first } as FormState); }}><Edit3 size={15} />Edit latest</button></div> : null}
    </form>
  );
}

function DataTable({ rows, columns, entity, data, setData, actions, cellActions }: { rows: Array<Record<string, unknown>>; columns: [string, string][]; entity?: Entity; data?: AppData; setData?: (data: AppData) => void; actions?: (row: Record<string, unknown>) => React.ReactNode; cellActions?: Record<string, (row: Record<string, unknown>) => void> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}{entity || actions ? <th>Actions</th> : null}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map(([key, label]) => {
                const value = label === "S.No" ? index + 1 : row[key];
                return <td key={key}>{cellActions?.[key] ? <button className="cell-link" onClick={() => cellActions[key](row)}>{formatCell(value, key)}</button> : formatCell(value, key)}</td>;
              })}
              {entity && data && setData ? <td><button className="danger" onClick={() => setData(withActivity(data, { ...data, [entity]: (data[entity] as Array<Record<string, unknown>>).filter((item) => item.id !== row.id) } as AppData, labelize(entity), "Deleted", String(row.name || row.description || row.id), "Record deleted"))}><Trash2 size={15} />Delete</button></td> : actions ? <td>{actions(row)}</td> : null}
            </tr>
          ))}
          {!rows.length ? <tr><td colSpan={columns.length + 1} className="empty">No records found</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
  return <article className="summary-card"><div>{icon}</div><span>{title}</span><strong>{value}</strong></article>;
}

function PasswordInput({ label, value, onChange, name, defaultValue }: { label: string; value?: string; onChange?: (value: string) => void; name?: string; defaultValue?: string }) {
  const [visible, setVisible] = useState(false);

  function revealPassword() {
    setVisible(true);
    window.setTimeout(() => setVisible(false), 5000);
  }

  return (
    <label>{label}
      <span className="password-field">
        <input
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <button type="button" aria-label={`Show ${label} for 5 seconds`} onClick={revealPassword}><Eye size={17} /></button>
      </span>
    </label>
  );
}

function ProfitMarginGraph({ sales, expenses, profit, margin }: { sales: number; expenses: number; profit: number; margin: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clampedMargin = Math.max(0, Math.min(100, margin));
  return (
    <article className="analysis-card">
      <div className="chart-title">
        <h2>Profit Margin Graph</h2>
        <span>Selected month</span>
      </div>
      <div className="margin-visual">
        <svg viewBox="0 0 140 140" role="img" aria-label="Profit margin graph">
          <circle cx="70" cy="70" r={radius} className="margin-track" />
          <circle cx="70" cy="70" r={radius} className={profit < 0 ? "margin-ring negative-ring" : "margin-ring"} strokeDasharray={circumference} strokeDashoffset={circumference - (clampedMargin / 100) * circumference} />
        </svg>
        <div>
          <strong className={profit < 0 ? "negative" : "positive"}>{margin}%</strong>
          <span>Profit Margin</span>
        </div>
      </div>
      <div className="margin-stats">
        <p><span>Sales Data</span><strong>{currency.format(sales)}</strong></p>
        <p><span>Expense Data</span><strong>{currency.format(expenses)}</strong></p>
        <p><span>Profit</span><strong className={profit < 0 ? "negative" : "positive"}>{currency.format(profit)}</strong></p>
      </div>
    </article>
  );
}

function IncomeExpenseGraph({ title, subtitle, rows }: { title: string; subtitle: string; rows: Array<{ label: string; sales: number; expenses: number; profit: number }> }) {
  const width = 720;
  const height = 320;
  const margin = { top: 34, right: 24, bottom: 42, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.sales, row.expenses, Math.max(row.profit, 0)]));
  const y = (value: number) => margin.top + plotHeight - (Math.max(value, 0) / maxValue) * plotHeight;
  const step = rows.length ? plotWidth / rows.length : plotWidth;
  const barWidth = Math.min(26, Math.max(12, step * 0.18));
  const profitPoints = rows.map((row, index) => {
    const x = margin.left + step * index + step / 2;
    return { x, y: y(row.profit), value: row.profit };
  });
  const profitPath = profitPoints.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = Math.round(maxValue * ratio);
    return { value, y: y(value) };
  });

  return (
    <article className="analysis-card income-expense-card">
      <div className="chart-title">
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        <div className="chart-legend"><span className="sales-key">Sales</span><span className="expense-key">Expenses</span><span className="profit-key">Profit</span></div>
      </div>
      {rows.length ? (
        <div className="combo-chart">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title} for ${subtitle}`}>
            {grid.map((line) => (
              <g key={line.value}>
                <line x1={margin.left} x2={width - margin.right} y1={line.y} y2={line.y} className="grid-line" />
                <text x={margin.left - 10} y={line.y + 4} textAnchor="end" className="axis-label">{compactCurrency(line.value)}</text>
              </g>
            ))}
            {rows.map((row, index) => {
              const center = margin.left + step * index + step / 2;
              const salesHeight = plotHeight + margin.top - y(row.sales);
              const expenseHeight = plotHeight + margin.top - y(row.expenses);
              return (
                <g key={row.label}>
                  <rect x={center - barWidth - 3} y={y(row.sales)} width={barWidth} height={salesHeight} className="sales-bar" rx="3" />
                  <rect x={center + 3} y={y(row.expenses)} width={barWidth} height={expenseHeight} className="expense-bar" rx="3" />
                  <text x={center - barWidth / 2 - 3} y={y(row.sales) - 7} textAnchor="middle" className="value-label">{compactCurrency(row.sales)}</text>
                  <text x={center + barWidth / 2 + 3} y={y(row.expenses) - 7} textAnchor="middle" className="value-label">{compactCurrency(row.expenses)}</text>
                  <text x={center} y={height - 14} textAnchor="middle" className="axis-label">{row.label}</text>
                </g>
              );
            })}
            <path d={profitPath} className="profit-line" />
            {profitPoints.map((point, index) => (
              <g key={`${rows[index].label}-profit`}>
                <circle cx={point.x} cy={point.y} r="4" className="profit-dot" />
                <text x={point.x} y={point.y - 10} textAnchor="middle" className="profit-label">{compactCurrency(point.value)}</text>
              </g>
            ))}
          </svg>
        </div>
      ) : <p className="status-note">No chart data available for this month.</p>}
    </article>
  );
}

function BarChart({ title, rows }: { title: string; rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <article className="chart-card">
      <h2>{title}</h2>
      <div className="bar-chart">
        {rows.length ? rows.map((row) => (
          <div className="bar-row" key={`${title}-${row.label}`}>
            <strong>{currency.format(row.value)}</strong>
            <div><i style={{ height: `${Math.max(4, (row.value / max) * 100)}%` }} /></div>
            <span>{row.label}</span>
          </div>
        )) : <p className="status-note">No chart data available.</p>}
      </div>
    </article>
  );
}

function FilterBar({ filters, setFilters, compact }: { filters: { month: string; year: string }; setFilters: (filters: { month: string; year: string }) => void; compact?: boolean }) {
  return (
    <div className={compact ? "filter-bar compact" : "filter-bar"}>
      <select value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}>{months.map((month) => <option key={month}>{month}</option>)}</select>
      <select value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}>{years.map((year) => <option key={year}>{year}</option>)}</select>
      <button className="primary"><Search size={16} />Search</button>
    </div>
  );
}

function DateRangeFilter({ filters, setFilters }: { filters: { from: string; to: string }; setFilters: (filters: { from: string; to: string }) => void }) {
  return (
    <div className="filter-bar record-search">
      <label>From Date<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
      <label>To Date<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
      <button className="ghost" onClick={() => setFilters({ from: "", to: "" })}><X size={16} />Clear</button>
    </div>
  );
}

function GstBox({ title, sgst, cgst, igst }: { title: string; sgst: number; cgst: number; igst: number }) {
  return <article className="gst-box"><h2>{title}</h2><p><span>SGST</span><strong>{currency.format(sgst)}</strong></p><p><span>CGST</span><strong>{currency.format(cgst)}</strong></p><p><span>IGST</span><strong>{currency.format(igst)}</strong></p></article>;
}

const dateFields = new Set(["joiningDate", "date"]);
const timeFields = new Set(["inTime", "outTime"]);
const numberFields = new Set(["salary", "basic", "hra", "pf", "bonus", "otherAllowance", "leaveAvailable", "advanceTaken", "salaryToBePaid"]);

function buildItem(item: { id: number; description: string; basic: number; taxType: "sgst_cgst" | "igst"; taxRate: number }): InvoiceItem {
  const tax = Math.round(item.basic * item.taxRate) / 100;
  return { ...item, ...splitTax(tax, item.taxType), tax, total: item.basic + tax };
}

function taxOptions(type: "sgst_cgst" | "igst") {
  return type === "igst"
    ? [{ value: 5, label: "5%" }, { value: 12, label: "12%" }, { value: 18, label: "18%" }]
    : [{ value: 5, label: "2.5% + 2.5%" }, { value: 12, label: "6% + 6%" }, { value: 18, label: "9% + 9%" }];
}

function expenseTaxOptions(type: "sgst_cgst" | "igst" | "na") {
  if (type === "na") return [{ value: 0, label: "NA" }];
  return taxOptions(type);
}

function splitTax(tax: number, type: "sgst_cgst" | "igst"): GstSplit {
  return type === "igst" ? { sgst: 0, cgst: 0, igst: tax } : { sgst: tax / 2, cgst: tax / 2, igst: 0 };
}

function sumInvoiceGst(invoices: Array<SupplierInvoice | GstBill>): GstSplit & { total: number } {
  const sum = invoices.flatMap((invoice) => invoice.items).reduce((acc, item) => ({ sgst: acc.sgst + item.sgst, cgst: acc.cgst + item.cgst, igst: acc.igst + item.igst }), { sgst: 0, cgst: 0, igst: 0 });
  return { ...sum, total: sum.sgst + sum.cgst + sum.igst };
}

function derivedGst(data: AppData) {
  return { input: sumInvoiceGst(data.supplierInvoices), output: sumInvoiceGst(data.gstBills) };
}

function invoiceRows(invoice: SupplierInvoice | GstBill) {
  const invoiceNumber = "supplierBillNumber" in invoice ? invoice.supplierBillNumber : invoice.invoiceNumber;
  return invoice.items.map((item) => ({ ...item, invoiceNumber }));
}

function normalizeData(input: AppData): AppData {
  return {
    ...input,
    expenses: input.expenses.map((expense) => ({
      ...expense,
      category: expense.category || "daily",
      taxType: expense.taxType || "na",
      modeOfPayment: expense.modeOfPayment || "cash",
      approvedBy: expense.approvedBy || currentUser
    })),
    dailySales: uniqueDailySales(input.dailySales.map((sale) => ({ ...sale, openingBalance: sale.openingBalance || 0, outputGst: sale.outputGst || 0, submitted: sale.submitted ?? true }))),
    supplierInvoices: input.supplierInvoices.map((invoice) => ({
      ...invoice,
      invoiceDate: invoice.invoiceDate || "2026-05-22",
      submitted: invoice.submitted ?? true,
      items: invoice.items.map((item) => normalizeItem(item))
    })),
    gstBills: input.gstBills.map((bill) => {
      if ("items" in bill) return { ...bill, billDate: bill.billDate || "2026-05-22", submitted: bill.submitted ?? true, items: bill.items.map((item) => normalizeItem(item)) };
      const legacy = bill as unknown as { id: number; description: string; value: number; gst: number; total: number };
      return { id: legacy.id, invoiceNumber: `GST-${legacy.id}`, customerName: "Sales Invoice", billDate: "2026-05-22", submitted: true, items: [normalizeItem({ id: 1, description: legacy.description, basic: legacy.value, tax: legacy.gst, total: legacy.total } as InvoiceItem)] };
    }),
    payroll: input.payroll.map((row) => normalizePayroll(row)),
    salaryAdvances: input.salaryAdvances || [],
    appUsers: (input.appUsers || cloneSeedData().appUsers).map((user) => ({ ...user, password: user.password || (user.username === "admin" ? "admin123" : "") })),
    stockMovements: (input.stockMovements || cloneSeedData().stockMovements).map((row) => ({ id: row.id, date: row.date, description: row.description, stockIn: row.stockIn || 0, stockOut: row.stockOut || 0 })),
    activityLogs: input.activityLogs || cloneSeedData().activityLogs,
    gstPayments: input.gstPayments || []
  };
}

function withActivity(data: AppData, nextData: AppData, module: string, action: string, record: string, details: string): AppData {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    user: currentUser,
    module,
    action,
    record,
    details
  };
  return { ...nextData, activityLogs: [log, ...(data.activityLogs || [])] };
}

function uniqueDailySales(sales: DailySale[]) {
  const byDate = new Map<string, DailySale>();
  sales.forEach((sale) => {
    const existing = byDate.get(sale.saleDate);
    if (!existing || sale.id > existing.id) byDate.set(sale.saleDate, sale);
  });
  return Array.from(byDate.values()).sort((a, b) => b.saleDate.localeCompare(a.saleDate) || b.id - a.id);
}

function expenseDetailRows(expenses: Expense[]) {
  const groups = new Map<string, { id: string; expenseDate: string; dailyExpense: number; otherExpense: number; tax: number; total: number }>();
  expenses.forEach((expense) => {
    const current = groups.get(expense.expenseDate) || { id: expense.expenseDate, expenseDate: expense.expenseDate, dailyExpense: 0, otherExpense: 0, tax: 0, total: 0 };
    if (expense.category === "daily") {
      current.dailyExpense += expense.value;
    } else {
      current.otherExpense += expense.value;
    }
    current.tax += expense.gst;
    current.total += expense.value + expense.gst;
    groups.set(expense.expenseDate, current);
  });
  return Array.from(groups.values()).sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
}

function openingBalances(data: AppData) {
  const cashSales = data.dailySales.reduce((sum, sale) => sum + sale.cash, 0);
  const bankSales = data.dailySales.reduce((sum, sale) => sum + sale.upi + sale.card, 0);
  const cashExpenses = data.expenses
    .filter((expense) => expense.modeOfPayment === "cash")
    .reduce((sum, expense) => sum + expense.value + expense.gst, 0);
  const bankExpenses = data.expenses
    .filter((expense) => expense.modeOfPayment === "bank")
    .reduce((sum, expense) => sum + expense.value + expense.gst, 0);
  return {
    cashOpeningBalance: cashSales - cashExpenses,
    bankOpeningBalance: bankSales - bankExpenses
  };
}

function stockInventoryRows(rows: StockMovement[]) {
  const stock = new Map<string, { id: string; description: string; available: number }>();
  rows.forEach((row) => {
    const current = stock.get(row.description) || { id: row.description, description: row.description, available: 0 };
    current.available += row.stockIn - row.stockOut;
    stock.set(row.description, current);
  });
  return Array.from(stock.values()).sort((a, b) => a.description.localeCompare(b.description));
}

function stockAvailable(rows: StockMovement[], description: string) {
  if (!description) return 0;
  return rows
    .filter((row) => row.description.trim().toLowerCase() === description.trim().toLowerCase())
    .reduce((sum, row) => sum + row.stockIn - row.stockOut, 0);
}

function monthlyTotals(rows: Array<{ date: string; value: number }>) {
  const totalsByMonth = new Map<string, number>();
  rows.forEach((row) => {
    const date = new Date(row.date);
    const key = `${months[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
    totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + row.value);
  });
  return Array.from(totalsByMonth.entries()).map(([label, value]) => ({ label, value }));
}

function monthlyAnalysisRows(data: AppData, month: string, year: string) {
  const groups = new Map<string, { label: string; date: string; sales: number; expenses: number; profit: number }>();
  data.dailySales
    .filter((sale) => byMonthYear(sale.saleDate, month, year))
    .forEach((sale) => {
      const current = groups.get(sale.saleDate) || { label: shortDate(sale.saleDate), date: sale.saleDate, sales: 0, expenses: 0, profit: 0 };
      current.sales += sale.cash + sale.upi + sale.card;
      current.profit = current.sales - current.expenses;
      groups.set(sale.saleDate, current);
    });
  data.expenses
    .filter((expense) => byMonthYear(expense.expenseDate, month, year))
    .forEach((expense) => {
      const current = groups.get(expense.expenseDate) || { label: shortDate(expense.expenseDate), date: expense.expenseDate, sales: 0, expenses: 0, profit: 0 };
      current.expenses += expense.value + expense.gst;
      current.profit = current.sales - current.expenses;
      groups.set(expense.expenseDate, current);
    });
  return Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function compactCurrency(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}${currency.format(abs / 10000000).replace(/\.00|₹/, "₹")}Cr`;
  if (abs >= 100000) return `${sign}${currency.format(abs / 100000).replace(/\.00|₹/, "₹")}L`;
  if (abs >= 1000) return `${sign}₹${Math.round(abs / 100) / 10}K`;
  return currency.format(value);
}

function filterByDashboardPeriod(rows: Array<{ date: string; value: number }>, period: "quarter" | "sixMonths" | "twelveMonths") {
  const today = new Date();
  const start = new Date(today);
  if (period === "quarter") {
    start.setMonth(Math.floor(today.getMonth() / 3) * 3, 1);
  } else {
    start.setMonth(today.getMonth() - (period === "sixMonths" ? 5 : 11), 1);
  }
  start.setHours(0, 0, 0, 0);
  return rows.filter((row) => {
    const value = new Date(row.date);
    return value >= start && value <= today;
  });
}

function yearlyTotals(rows: Array<{ date: string; sale: number; expense: number }>) {
  const totalsByYear = new Map<string, { label: string; sale: number; expense: number }>();
  rows.forEach((row) => {
    const label = String(new Date(row.date).getFullYear());
    const current = totalsByYear.get(label) || { label, sale: 0, expense: 0 };
    current.sale += row.sale;
    current.expense += row.expense;
    totalsByYear.set(label, current);
  });
  return Array.from(totalsByYear.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function attendanceSalary(employeeName: string, monthlySalary: number, date: string, attendance: Attendance[]) {
  const selectedDate = new Date(date);
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const attendedDays = new Set(attendance
    .filter((row) => row.employeeName === employeeName)
    .filter((row) => {
      const attendanceDate = new Date(row.date);
      return attendanceDate.getMonth() === month && attendanceDate.getFullYear() === year;
    })
    .map((row) => row.date)).size;
  if (!attendedDays) return monthlySalary;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.round((monthlySalary / daysInMonth) * attendedDays);
}

function advanceDeductionForEmployee(advances: SalaryAdvance[], payroll: Payroll[], employeeName: string) {
  let previouslyDeducted = payroll
    .filter((row) => row.employeeName === employeeName)
    .reduce((sum, row) => sum + row.advanceTaken, 0);
  return advances
    .filter((advance) => advance.employeeName === employeeName)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .reduce((due, advance) => {
      const consumed = Math.min(previouslyDeducted, advance.amount);
      previouslyDeducted -= consumed;
      const remaining = advance.amount - consumed;
      if (remaining <= 0) return due;
      const completedMonths = Math.floor(consumed / Math.max(advance.deductionPerMonth, 1));
      if (completedMonths >= advance.months) return due;
      return due + Math.min(advance.deductionPerMonth, remaining);
    }, 0);
}

function shortDate(date: string) {
  return date.slice(5);
}

function normalizeItem(item: InvoiceItem): InvoiceItem {
  const taxType = item.taxType || (item.igst ? "igst" : "sgst_cgst");
  const tax = item.tax || item.sgst + item.cgst + item.igst;
  return { ...item, taxType, taxRate: item.taxRate || Math.round((tax / Math.max(item.basic, 1)) * 100), ...splitTax(tax, taxType), tax, total: item.total || item.basic + tax };
}

function normalizePayroll(row: Payroll | (Payroll & Record<string, number | string>)): Payroll {
  if (row.employeeName) {
    const salary = Number(row.salary) || 0;
    const advanceTaken = Number(row.advanceTaken) || 0;
    return { id: row.id, date: row.date || "2026-05-25", payrollMonth: row.payrollMonth || months[new Date(row.date || "2026-05-25").getMonth()], payrollYear: row.payrollYear || String(new Date(row.date || "2026-05-25").getFullYear()), employeeName: row.employeeName, salary, advanceTaken, salaryToBePaid: Number(row.salaryToBePaid) || Math.max(salary - advanceTaken, 0) };
  }
  const legacy = row as unknown as { id: number; name: string; basic: number; hra: number; pf: number; bonus: number; otherAllowance: number };
  const salary = (Number(legacy.basic) || 0) + (Number(legacy.hra) || 0) + (Number(legacy.bonus) || 0) + (Number(legacy.otherAllowance) || 0) - (Number(legacy.pf) || 0);
  return { id: legacy.id, date: "2026-05-25", payrollMonth: "May", payrollYear: "2026", employeeName: legacy.name || "", salary, advanceTaken: 0, salaryToBePaid: salary };
}

function nextId(rows: Array<Record<string, unknown>>) {
  return Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1;
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()).replace("Upi", "UPI").replace("Gst", "GST").replace("Hra", "HRA").replace("Pf", "PF");
}

const moneyFields = new Set(["openingBalance", "cash", "upi", "card", "total", "expense", "outputGst", "gst", "tax", "value", "basic", "salary", "hra", "pf", "bonus", "otherAllowance", "dailyExpense", "otherExpense", "inputCredit", "sgst", "cgst", "igst", "amountPaid", "remainingAfterPayment", "advanceTaken", "salaryToBePaid", "amount", "deductionPerMonth"]);

function formatCell(value: unknown, key?: string) {
  if (key === "modeOfPayment" && typeof value === "string") return labelize(value);
  if (typeof value === "number" && key && moneyFields.has(key)) return currency.format(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value ?? "");
}

function byMonthYear(date: string, month: string, year: string) {
  const value = new Date(date);
  return months[value.getMonth()] === month && String(value.getFullYear()) === year;
}

function inDateRange(date: string, from: string, to: string) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function excelTime(value: string | number) {
  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60);
    return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
  }
  return String(value || "");
}

function excelDate(value: string | number) {
  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  return String(value || "2026-05-22");
}

function duration(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return "";
  const minutes = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function exportCsv(page: PageKey, data: AppData) {
  const rows = page === "gstDetails" ? [...data.supplierInvoices.flatMap(invoiceRows), ...data.gstBills.flatMap(invoiceRows)] : page === "monthly" ? data.dailySales : data[pageToEntity(page)] || data.dailySales;
  const flatRows = (rows as Array<Record<string, unknown>>).map((row) => ({ ...row, items: undefined, source: undefined }));
  const csvRows = flatRows.map((row) => Object.values(row).map((value) => JSON.stringify(value)).join(","));
  const header = Object.keys(flatRows[0] || {}).join(",");
  const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${pageTitle[page].replaceAll(" ", "-").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function pageToEntity(page: PageKey): Entity {
  const map: Partial<Record<PageKey, Entity>> = { daily: "dailySales", supplier: "supplierInvoices", gstBills: "gstBills", expenses: "expenses", employees: "employees", attendance: "attendance", payroll: "payroll", userAuthorization: "appUsers", activityLogs: "activityLogs", stockManagement: "stockMovements", inventory: "stockMovements" };
  return map[page] || "dailySales";
}
