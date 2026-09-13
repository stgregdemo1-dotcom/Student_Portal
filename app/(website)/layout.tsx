import type { Metadata } from "next";
import Footer from '../-components/Pfooter';
import Header from '../-components/pheader';
import "./globals.css";

export const metadata: Metadata = {
  title: "Saint Gregory College",
  description: "Science and Technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-col gap-16">
          <main className="flex-grow">
            {children}
          </main>
        </div>
        <div className="h-12 w-full"></div>
        <Footer />
      </body>
    </html>
  );
}