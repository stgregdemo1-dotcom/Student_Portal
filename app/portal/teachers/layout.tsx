import "./globals.css";
import TeacherClientLayout from "./clientlayout";
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SGCST - Teacher Portal",
  description: "Advanced Dashboard for Teachers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <TeacherClientLayout>{children}</TeacherClientLayout>
      </body>
    </html>
  );
}
