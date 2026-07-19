import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { AppFlowProvider } from "@/lib/flow-context";

import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HirePilot AI — Your AI Career Copilot",
  description:
    "Upload your resume, paste a job description, get an ATS score, and optimize instantly.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <AppFlowProvider>{children}</AppFlowProvider>
      </body>
    </html>
  );
}
