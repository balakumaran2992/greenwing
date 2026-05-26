import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { cloneSeedData } from "../../../lib/seed";

let memoryData = cloneSeedData();

const hasDatabase = Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json(memoryData);
  }

  try {
    const [dailySales, expenses, employees, attendance, payroll, gstBills, gstRecords] = await Promise.all([
      sql`SELECT id, sale_date AS "saleDate", cash, upi, card, expense, input_gst AS "inputGst", output_gst AS "outputGst" FROM daily_sales ORDER BY sale_date DESC`,
      sql`SELECT id, description, value, gst, approved_by AS "approvedBy", expense_date AS "expenseDate" FROM expenses ORDER BY id DESC`,
      sql`SELECT id, name, aadhaar_number AS "aadhaarNumber", bank_detail AS "bankDetail", role, full_time AS "fullTime", part_time AS "partTime", salary, joining_date AS "joiningDate" FROM employees ORDER BY id DESC`,
      sql`SELECT id, employee_name AS "employeeName", attendance_date AS date, in_time AS "inTime", out_time AS "outTime", total_work_duration AS "totalWorkDuration" FROM attendance ORDER BY attendance_date DESC`,
      sql`SELECT id, name, basic, hra, bonus, other_allowance AS "otherAllowance", leave_available AS "leaveAvailable" FROM payroll ORDER BY id DESC`,
      sql`SELECT id, description, value, gst, total FROM gst_records ORDER BY id DESC`,
      sql`SELECT id, record_date AS "recordDate", gst_type AS "gstType", sgst, cgst, igst FROM gst_records ORDER BY record_date DESC`
    ]);

    return NextResponse.json({
      ...memoryData,
      dailySales: dailySales.rows,
      expenses: expenses.rows,
      employees: employees.rows,
      attendance: attendance.rows,
      payroll: payroll.rows,
      gstBills: gstBills.rows,
      gstRecords: gstRecords.rows
    });
  } catch {
    return NextResponse.json(memoryData);
  }
}

export async function PUT(request: Request) {
  const nextData = await request.json();
  memoryData = nextData;
  return NextResponse.json(memoryData);
}
