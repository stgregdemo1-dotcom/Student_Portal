import type { Metadata, Viewport } from "next";
import Footer from '../-components/Pfooter';
import Header from '../-components/pheader';
import NavigationLoader from "../-components/NavigationLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saint Gregory College",
  description: "Science and Technology",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden antialiased">
        <NavigationLoader />
        <Header />
        <div className="flex flex-col flex-grow w-full max-w-full">
          <main className="flex-grow w-full">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
