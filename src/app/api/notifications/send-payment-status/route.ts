/**
 * API Endpoint: POST /api/notifications/send-payment-status
 * Mengirim notifikasi status pembayaran ke wali siswa via WhatsApp
 * Dipanggil dari payment webhook setelah pembayaran berhasil/gagal
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWhatsAppNotificationService } from "@/lib/fonnte/whatsapp-sender";

interface SendPaymentStatusRequest {
  idPembayaran: number;
  idTagihan: number;
  status: "SUCCESS" | "FAILED" | "EXPIRED";
}

export async function POST(request: NextRequest) {
  try {
    const body: SendPaymentStatusRequest = await request.json();
    const { idPembayaran, idTagihan, status } = body;

    console.log(
      `[NOTIFICATION-PAYMENT] Processing pembayaran ${idPembayaran}, status: ${status}`
    );

    if (!idPembayaran || !idTagihan || !status) {
      return NextResponse.json(
        {
          error:
            "idPembayaran, idTagihan, dan status harus disediakan",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient({ isAdmin: true });

    // Ambil data pembayaran + tagihan + siswa
    const { data: pembayaran, error: pembayaranError } = await supabase
      .from("pembayaran")
      .select(
        `
        idpembayaran,
        idtagihansiswa,
        idsiswa,
        jumlahdibayar,
        tanggalpembayaran,
        statuspembayaran,
        tagihan_siswa(
          jumlahtagihan,
          master_tagihan(namatagihan)
        ),
        siswa(namasiswa, nowa, namawali)
      `
      )
      .eq("idpembayaran", idPembayaran)
      .single();

    if (pembayaranError || !pembayaran) {
      console.error(
        `[NOTIFICATION-PAYMENT] Pembayaran tidak ditemukan: ${idPembayaran}`
      );
      return NextResponse.json(
        { error: "Pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const siswa = pembayaran.siswa as any;
    const tagihan = pembayaran.tagihan_siswa as any;
    const masterTagihan = tagihan?.master_tagihan as any;

    if (!siswa || !siswa.nowa) {
      console.error(
        `[NOTIFICATION-PAYMENT] Nomor WhatsApp wali tidak ditemukan`
      );
      return NextResponse.json(
        { error: "Nomor WhatsApp wali tidak ditemukan" },
        { status: 400 }
      );
    }

    const whatsAppService = getWhatsAppNotificationService();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let result;

    // FIX: targetId harus idTagihan (FK whatsapp_logs_tagihan_fk merujuk
    // ke tagihan_siswa.idtagihansiswa), BUKAN idPembayaran.
    if (status === "SUCCESS") {
      // Send payment success notification
      const linkKwitansi = `${appUrl}/kwitansi/${idPembayaran}`;
      result = await whatsAppService.sendNotification({
        recipientPhone: siswa.nowa,
        messageType: "PAYMENT_SUCCESS",
        targetId: idTagihan,
        recipientName: siswa.namawali || "Wali Murid",
        studentName: siswa.namasiswa,
        data: {
          namaTagihan: masterTagihan?.namatagihan || "Tagihan",
          nominalBayar: Math.floor(pembayaran.jumlahdibayar),
          tanggalPembayaran: new Date(
            pembayaran.tanggalpembayaran
          ).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          linkKwitansi,
        },
      });
    } else if (status === "FAILED") {
      // Send payment failed notification
      result = await whatsAppService.sendNotification({
        recipientPhone: siswa.nowa,
        messageType: "PAYMENT_FAILED",
        targetId: idTagihan,
        recipientName: siswa.namawali || "Wali Murid",
        studentName: siswa.namasiswa,
        data: {
          namaTagihan: masterTagihan?.namatagihan || "Tagihan",
          nominalBayar: Math.floor(pembayaran.jumlahdibayar),
          alasan: "Pembayaran ditolak, silakan coba metode pembayaran lain",
          nomorAdmin: process.env.NEXT_PUBLIC_ADMIN_PHONE || "085711675058",
        },
      });
    } else if (status === "EXPIRED") {
      // Send payment expired notification
      result = await whatsAppService.sendNotification({
        recipientPhone: siswa.nowa,
        messageType: "PAYMENT_FAILED",
        targetId: idTagihan,
        recipientName: siswa.namawali || "Wali Murid",
        studentName: siswa.namasiswa,
        data: {
          namaTagihan: masterTagihan?.namatagihan || "Tagihan",
          nominalBayar: Math.floor(pembayaran.jumlahdibayar),
          alasan: "Waktu pembayaran telah kadaluarsa, silakan lakukan pembayaran baru",
          nomorAdmin: process.env.NEXT_PUBLIC_ADMIN_PHONE || "085711675058",
        },
      });
    } else {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    if (!result.success) {
      console.error(
        `[NOTIFICATION-PAYMENT] Gagal mengirim notifikasi: ${result.error}`
      );
      return NextResponse.json(
        { error: result.error || "Gagal mengirim notifikasi" },
        { status: 500 }
      );
    }

    // Update pembayaran dengan timestamp notifikasi
    const { error: updateError } = await supabase
      .from("pembayaran")
      .update({
        whatsapp_status_notified_at: new Date().toISOString(),
      })
      .eq("idpembayaran", idPembayaran);

    if (updateError) {
      console.warn(
        `[NOTIFICATION-PAYMENT] Gagal update timestamp notifikasi:`,
        updateError
      );
    }

    console.log(
      `✅ [NOTIFICATION-PAYMENT] Notifikasi terkirim untuk pembayaran ${idPembayaran}, status: ${status}, message_id: ${result.messageId}`
    );

    return NextResponse.json({
      success: true,
      message: "Notifikasi status pembayaran berhasil dikirim",
      messageId: result.messageId,
      pembayaran: {
        id: idPembayaran,
        siswa: siswa.namasiswa,
        wali: siswa.namawali,
        nominal: pembayaran.jumlahdibayar,
        status,
      },
    });
  } catch (error: any) {
    console.error("[NOTIFICATION-PAYMENT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}