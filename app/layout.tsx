import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales, GST, Audit & HR Management System",
  description: "Business management app for sales, GST, audit and HR records"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
