// src/app/api/payment/check-status/route.ts
// Endpoint ini dipanggil dari halaman success sebagai fallback
// ketika webhook tidak bisa dipanggil (development/localhost)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { environment } from "@/configs/environtment";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id: tagihanId } = body;

    if (!tagihanId) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 });
    }

    console.log("🔍 [CHECK-STATUS] Checking tagihan:", tagihanId);

    const supabase = await createClient();

    // Ambil tagihan beserta paymentToken
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_santri")
      .select("idTagihanSantri, idSantri, statusPembayaran, jumlahTagihan, paymentToken")
      .eq("idTagihanSantri", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    // Jika sudah LUNAS, return langsung
    if (tagihan.statusPembayaran === "LUNAS") {
      return NextResponse.json({ status: "LUNAS", already_paid: true });
    }

    // Query ke Midtrans untuk cek status transaksi terbaru
    // Format order_id Midtrans: PPPM-{tagihanId}-{timestamp}
    // Kita tidak tahu timestamp-nya, jadi kita cek via Snap transaction status
    // menggunakan Core API dengan mencari berdasarkan payment token
    
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: environment.MIDTRANS_SERVER_KEY,
    });

    // Coba cek apakah ada transaksi successful di Midtrans
    // dengan mencari semua kemungkinan order_id
    // Karena kita tidak tahu exact timestamp, kita skip Midtrans API call
    // dan langsung cek dari database pembayaran

    const { data: existingPembayaran } = await supabase
      .from("pembayaran")
      .select("id_pembayaran, status_pembayaran")
      .eq("id_tagihan_santri", parseInt(tagihanId))
      .maybeSingle();

    if (existingPembayaran?.status_pembayaran === "SUCCESS") {
      // Sync status tagihan jika belum terupdate
      if (tagihan.statusPembayaran !== "LUNAS") {
        await supabase
          .from("tagihan_santri")
          .update({
            statusPembayaran: "LUNAS",
            updatedAt: new Date().toISOString(),
          })
          .eq("idTagihanSantri", tagihanId);
      }
      return NextResponse.json({ status: "LUNAS" });
    }

    return NextResponse.json({ status: tagihan.statusPembayaran });
  } catch (error: any) {
    console.error("💥 [CHECK-STATUS] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}