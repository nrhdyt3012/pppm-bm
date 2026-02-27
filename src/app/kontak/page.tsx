// src/app/ppdb/page.tsx
import KontakPage from "./_components/kontak-page";

export const metadata = {
  title: "Kontak | PP Baitul Makmur",
  description: "Informasi Kontak Pondok Pesantren Baitul Makmur",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function Kontak() {
  return <KontakPage />;
}