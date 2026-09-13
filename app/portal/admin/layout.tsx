import './globals.css';
import Header from '../../-components/aheader';
import Footer from '../../-components/afooter';
import Sidebar from '../../-components/asidebar';    

export const metadata = {
  title: 'SGCST Admin',
  description: 'Manage your academic life',
};

const events = {
  5: [{ title: "Meeting", color: "bg-blue-500" }],
  10: [{ title: "Exam", color: "bg-red-500" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900">
        <div className="flex min-h-screen">
          {/* Sidebar - Positioned fixed in its own component */}
          <Sidebar />

          {/* ADDED 'ml-64' HERE:
              This pushes the entire content area to the right so it 
              doesn't sit underneath the fixed sidebar.
          */}
          <div className="flex-1 ml-64 flex flex-col bg-slate-50 min-h-screen">
            <Header />
            
            <main className="flex-1 p-6">
              {children}
            </main>

            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}