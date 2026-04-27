// src/app/ppdb/page.tsx
import PPDBPage from "./_components/ppdb-page";

export const metadata = {
  title: "PAUD ABA 1 Buduran | PPDB",
  description: "Penerimaan Peserta Didik Baru PAUD ABA 1 Buduran",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function PPDB() {
  return <PPDBPage />;
}