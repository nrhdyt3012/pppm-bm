// src/app/info-sekolah/page.tsx
import InfoSekolahPage from "./_components/info-sekolah";

export const metadata = {
  title: "PAUD ABA 1 Buduran | Info Sekolah",
  description: "Informasi Program Pendidikan PAUD ABA 1 Buduran",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function InfoSekolah() {
  return <InfoSekolahPage />;
}