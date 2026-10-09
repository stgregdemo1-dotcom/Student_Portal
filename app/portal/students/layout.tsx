import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "./clientlayout";

export const metadata: Metadata = {
  title: "SGCST Students Portal",
  description:
    "centralized digital hub where learners manage their academic lives",
};

// 🚀 Explicitly configure viewport settings for mobile responsiveness
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}