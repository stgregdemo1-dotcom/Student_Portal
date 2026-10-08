// app/layout.tsx
import React from "react";
import "./globals.css"; // Ensure your global styles or Tailwind import is here

export const metadata = {
  title: "Teacher Portal",
  description: "Account Initialization and Password Setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}