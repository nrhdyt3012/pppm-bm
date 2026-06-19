// src/app/info-sekolah/page.tsx
import InfoSekolahPage from "./_components/info-sekolah";

export const metadata = {
  title: "KB/TK ABA 1 Buduran | Info Sekolah",
  description: "Informasi Program Pendidikan KB/TK ABA 1 Buduran",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function InfoSekolah() {
  return <InfoSekolahPage />;
}