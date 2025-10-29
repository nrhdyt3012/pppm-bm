// File: src/app/(dashboard)/santri/riwayat/page.tsx
import RiwayatPembayaran from "./_components/riwayat-pembayaran";

export const metadata = {
  title: "PPPM BM | Riwayat Pembayaran",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function RiwayatPage() {
  return <RiwayatPembayaran />;
}
