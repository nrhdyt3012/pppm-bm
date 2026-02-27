// src/app/ppdb/page.tsx
import PPDBPage from "./_components/ppdb-page";

export const metadata = {
  title: "PPDB 2025/2026 | PP Baitul Makmur",
  description: "Penerimaan Peserta Didik Baru Pondok Pesantren Baitul Makmur",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function PPDB() {
  return <PPDBPage />;
}