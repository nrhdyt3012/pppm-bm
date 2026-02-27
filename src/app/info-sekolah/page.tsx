// src/app/info-sekolah/page.tsx
import InfoSekolahPage from "./_components/info-sekolah";

export const metadata = {
  title: "Info Sekolah | PP Baitul Makmur",
  description: "Informasi Program Pendidikan Pondok Pesantren Baitul Makmur",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function InfoSekolah() {
  return <InfoSekolahPage />;
}