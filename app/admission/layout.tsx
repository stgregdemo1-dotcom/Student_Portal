import type { Metadata } from "next";
import Footer from '../-components/Pfooter';
import Header from '../-components/pheader';
import NavigationLoader from "../-components/NavigationLoader";
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
        <NavigationLoader />
        <Header />
        <div className="flex flex-1 flex-col">
          <main className="flex-grow">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
