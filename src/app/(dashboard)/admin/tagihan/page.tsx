// src/app/(dashboard)/admin/tagihan/page.tsx
import DaftarTagihanSantri from "./_components/daftar-tagihan-santri";

export const metadata = {
  title: "PPPM BM | Daftar Tagihan Santri",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function TagihanPage() {
  return <DaftarTagihanSantri />;
}
