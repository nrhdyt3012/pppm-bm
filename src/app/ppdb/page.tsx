// src/app/ppdb/page.tsx
import PPDBPage from "./_components/ppdb-page";

export const metadata = {
  title: "KB/TK ABA 1 Buduran | PPDB",
  description: "Penerimaan Peserta Didik Baru KB/TK ABA 1 Buduran",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function PPDB() {
  return <PPDBPage />;
}