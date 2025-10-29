export const metadata = {
  title: "PPPM BM | Riwayat Pembayaran",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default function RiwayatPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
        <p className="text-muted-foreground">
          Riwayat pembayaran SPP yang telah dilakukan
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          Halaman Riwayat Pembayaran - Dalam Pengembangan
        </p>
      </div>
    </div>
  );
}
