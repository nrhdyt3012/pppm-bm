"use client";

import Receipt from "@/app/(dashboard)/siswa/payment/success/_components/receipt";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const first = (v: any) => (Array.isArray(v) ? v[0] : v);

export default function KwitansiPublic({ data }: { data: any }) {
  const tagihanSiswa = first(data.tagihan_siswa);
  const siswa = first(tagihanSiswa?.siswa);
  const masterTagihan = first(tagihanSiswa?.master_tagihan);

  const nominalTotal = parseFloat(tagihanSiswa?.jumlahtagihan || "0");
  const sudahBayar = parseFloat(tagihanSiswa?.jumlahterbayar || "0");
  const sisaBaru = Math.max(0, nominalTotal - sudahBayar);
  const nominalBayar = parseFloat(data.jumlahdibayar || "0");

  const tagihanForReceipt = {
    ...tagihanSiswa,
    siswa,
    master_tagihan: masterTagihan,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto mb-4 px-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
          <Printer className="w-4 h-4 mr-2" />
          Cetak / Simpan PDF
        </Button>
      </div>
      <Receipt
        tagihan={tagihanForReceipt}
        nominalBayar={nominalBayar}
        sisaBaru={sisaBaru}
        nominalTotal={nominalTotal}
      />
    </div>
  );
}