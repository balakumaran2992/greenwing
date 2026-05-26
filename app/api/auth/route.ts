import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === "admin" && password === "admin123") {
    return NextResponse.json({ ok: true, user: { username, role: "admin" } });
  }

  return NextResponse.json({ ok: false, message: "Invalid username or password" }, { status: 401 });
}
