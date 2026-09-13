// components/Header.tsx
export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Welcome, Admin!</span>
        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
      </div>
    </header>
  );
}