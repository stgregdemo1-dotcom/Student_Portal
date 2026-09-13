import "./globals.css";
import ClientLayout from "./clientlayout";

export const metadata = {
  title: "SGCST Students Portal",
  description:
    "centralized digital hub where learners manage their academic lives",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}