// src/app/profil/page.tsx
import ProfilPage from "./_components/profil";

export const metadata = {
  title: "Profil | PP Baitul Makmur",
  description: "Profil Pondok Pesantren Baitul Makmur",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function Profil() {
  return <ProfilPage />;
}