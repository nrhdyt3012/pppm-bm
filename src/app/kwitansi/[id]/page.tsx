import { getPembayaranDetail } from "@/app/(dashboard)/siswa/payment/actions";
import KwitansiPublic from "./_components/kwitansi-public";
import { notFound } from "next/navigation";

export const metadata = {
  title: "PAUD BA 1 Buduran | Kwitansi Pembayaran",
  icons: { icon: "/favicon.ico" },
};

export default async function KwitansiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idPembayaran = parseInt(id);

  if (isNaN(idPembayaran)) notFound();

  const result = await getPembayaranDetail(idPembayaran);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  return <KwitansiPublic data={result.data} />;
}