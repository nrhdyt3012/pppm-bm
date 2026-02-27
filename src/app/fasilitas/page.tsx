// src/app/fasilitas/page.tsx
import FasilitasPage from "./_components/fasilitas";

export const metadata = {
  title: "Fasilitas | PP Baitul Makmur",
  description: "Fasilitas Pondok Pesantren Baitul Makmur",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function Fasilitas() {
  return <FasilitasPage />;
}