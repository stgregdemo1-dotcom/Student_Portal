// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="p-4 border-t text-center text-sm text-gray-500 bg-gray-50">
      &copy; {new Date().getFullYear()} Student Portal System. All rights reserved.
    </footer>
  );
}