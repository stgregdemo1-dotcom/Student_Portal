import './globals.css';
import Header from '../../-components/aheader';
import Footer from '../../-components/afooter';
import Sidebar from '../../-components/rsidebar';    

export const metadata = { 
  title: 'SGCST Registrar Portal',
  description: 'Manage your academic life',
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
          <Sidebar />

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