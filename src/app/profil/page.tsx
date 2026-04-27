// src/app/profil/page.tsx
import ProfilPage from "./_components/profil";

export const metadata = {
  title: "PAUD ABA 1 Buduran | Profil",
  description: "Profil PAUD ABA 1 Buduran",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function Profil() {
  return <ProfilPage />;
}