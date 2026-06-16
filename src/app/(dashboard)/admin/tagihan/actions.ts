"use server";

import { createClient } from "@/lib/supabase/server";
import { writeChangelog } from "@/lib/changelog";
import { revalidatePath } from "next/cache";

const first = (v: any) => (Array.isArray(v) ? v[0] : v);

async function getTagihanPermission(supabase: any, idTagihan: string) {
  const { data: tagihan } = await supabase
    .from("tagihan_siswa")
    .select(`
      idtagihansiswa,
      idsiswa,
      bulan,
      tahun,
      statuspembayaran,
      jumlahtagihan,
      jumlahterbayar,
      siswa:siswa!idsiswa(namasiswa),
      master_tagihan:master_tagihan!idmastertagihan(namatagihan),
      pembayaran (
        idpembayaran,
        statuspembayaran,
        metodepembayaran
      )
    `)
    .eq("idtagihansiswa", idTagihan)
    .single();

  if (!tagihan) {
    return { ok: false, reason: "Tagihan tidak ditemukan", tagihan: null };
  }

  const pembayaranList = tagihan.pembayaran ?? [];

  const hasSuccessPayment = pembayaranList.some(
    (p: any) => p.statuspembayaran === "SUCCESS"
  );

  const hasMidtransPayment = pembayaranList.some(
    (p: any) => p.statuspembayaran === "SUCCESS" && p.metodepembayaran !== "cash"
  );

  return {
    ok: true,
    tagihan,
    hasSuccessPayment,
    hasMidtransPayment,
    canBayarManual: !hasMidtransPayment && tagihan.statuspembayaran !== "LUNAS",
    canDelete: !hasSuccessPayment,
  };
}

export async function bayarTagihanManual(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa") as string;
  const jumlahBayar = parseFloat(formData.get("jumlahbayar") as string);

  if (!idTagihan || !jumlahBayar || jumlahBayar <= 0) {
    return { status: "error", errors: { _form: ["Data pembayaran tidak valid"] } };
  }

  const supabase = await createClient({ isAdmin: true });
  const perm = await getTagihanPermission(supabase, idTagihan);

  if (!perm.ok) {
    return { status: "error", errors: { _form: [perm.reason] } };
  }
  if (!perm.canBayarManual) {
    return {
      status: "error",
      errors: {
        _form: [
          perm.hasMidtransPayment
            ? "Tagihan sudah lunas via Midtrans, tidak dapat ditambah pembayaran cash"
            : "Tagihan sudah lunas",
        ],
      },
    };
  }

  const tagihan = perm.tagihan;
  const totalTagihan = parseFloat(tagihan.jumlahtagihan);
  const sudahBayar = parseFloat(tagihan.jumlahterbayar ?? "0");
  const sisaTagihan = totalTagihan - sudahBayar;

  if (jumlahBayar > sisaTagihan) {
    return { status: "error", errors: { _form: ["Jumlah pembayaran melebihi sisa tagihan"] } };
  }

  const terbayarBaru = sudahBayar + jumlahBayar;
  const statusBaru = terbayarBaru >= totalTagihan ? "LUNAS" : "BELUM BAYAR";

  const { error: updateError } = await supabase
    .from("tagihan_siswa")
    .update({
      jumlahterbayar: terbayarBaru,
      statuspembayaran: statusBaru,
      updatedat: new Date().toISOString(),
    })
    .eq("idtagihansiswa", idTagihan);

  if (updateError) {
    return { status: "error", errors: { _form: [`Gagal update tagihan: ${updateError.message}`] } };
  }

  const { data: pembayaranData, error: insertError } = await supabase
    .from("pembayaran")
    .insert({
      idtagihansiswa: parseInt(idTagihan),
      idsiswa: tagihan.idsiswa,
      jumlahdibayar: jumlahBayar,
      tanggalpembayaran: new Date().toISOString(),
      metodepembayaran: "cash",
      statuspembayaran: "SUCCESS",
    })
    .select("idpembayaran")
    .single();

  if (insertError) {
    console.error("Error insert pembayaran:", insertError);
  }

  const namaSiswa = first(tagihan.siswa)?.namasiswa || "-";
  const namaTagihan = first(tagihan.master_tagihan)?.namatagihan || "-";

  await writeChangelog({
    supabase,
    namamenu: "Tagihan Siswa",
    jenisaksi: "UBAH",
    deskripsi: `Mencatat pembayaran cash sebesar Rp${jumlahBayar.toLocaleString("id-ID")} untuk ${namaSiswa} - ${namaTagihan} (${tagihan.bulan}/${tagihan.tahun})`,
  });

  revalidatePath("/admin/tagihan");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // ============================================================
  // DEBUG LOG #1 — Cek env vars & hasil insert pembayaran
  // Hapus bagian ini setelah masalah ditemukan
  // ============================================================
  console.log("====== DEBUG BAYAR CASH ======");
  console.log("[ENV] FONNTE_API_KEY  :", process.env.FONNTE_API_KEY ? `ADA (${process.env.FONNTE_API_KEY.slice(0, 6)}...)` : "TIDAK ADA ❌");
  console.log("[ENV] NEXT_PUBLIC_APP_URL:", appUrl);
  console.log("[ENV] RESEND_API_KEY  :", process.env.RESEND_API_KEY ? "ADA ✅" : "TIDAK ADA ❌");
  console.log("[DATA] idTagihan      :", idTagihan);
  console.log("[DATA] jumlahBayar    :", jumlahBayar);
  console.log("[DATA] statusBaru     :", statusBaru);
  console.log("[DATA] pembayaranData :", pembayaranData);
  console.log("[DATA] insertError    :", insertError ?? "null (ok)");
  console.log("==============================");

  if (pembayaranData?.idpembayaran) {
    // ─── Kirim email kwitansi ──────────────────────────────────────────────
    try {
      console.log("[EMAIL] Mencoba kirim ke:", `${appUrl}/api/send-receipt`);
      const emailRes = await fetch(`${appUrl}/api/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPembayaran: pembayaranData.idpembayaran,
          idTagihan: parseInt(idTagihan),
          jumlahBayar,
          totalTagihan,
          sisaTagihan: totalTagihan - terbayarBaru,
          statusBaru,
          metodePembayaran: "cash",
        }),
      });
      // DEBUG LOG #2 — Hasil fetch email
      console.log("[EMAIL] Status response:", emailRes.status, emailRes.statusText);
      const emailBody = await emailRes.text();
      console.log("[EMAIL] Response body  :", emailBody);
    } catch (e) {
      console.error("[EMAIL] Fetch GAGAL (kemungkinan URL salah atau server down):", e);
    }

    // ─── Kirim notifikasi WhatsApp pembayaran sukses ──────────────────────
    // DEBUG LOG #3 — Sebelum kirim WA
    console.log("[WA] FONNTE_API_KEY tersedia:", !!process.env.FONNTE_API_KEY);

    if (process.env.FONNTE_API_KEY) {
      try {
        const waUrl = `${appUrl}/api/notifications/send-payment-status`;
        const waPayload = {
          idPembayaran: pembayaranData.idpembayaran,
          idTagihan: parseInt(idTagihan),
          status: "SUCCESS",
        };
        console.log("[WA] Mencoba kirim ke:", waUrl);
        console.log("[WA] Payload         :", JSON.stringify(waPayload));

        const waRes = await fetch(waUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(waPayload),
        });

        // DEBUG LOG #4 — Hasil fetch WA
        console.log("[WA] Status response :", waRes.status, waRes.statusText);
        const waBody = await waRes.text();
        console.log("[WA] Response body   :", waBody);
      } catch (e) {
        console.error("[WA] Fetch GAGAL (kemungkinan URL salah atau server down):", e);
      }
    } else {
      console.warn("[WA] SKIP — FONNTE_API_KEY tidak diset, notifikasi WA tidak dikirim");
    }
  } else {
    console.warn("[SKIP] pembayaranData kosong, email & WA tidak dikirim");
  }

  return {
    status: "success",
    data: {
      idpembayaran: pembayaranData?.idpembayaran,
      jumlahbayar: jumlahBayar,
      sisatagihan: totalTagihan - terbayarBaru,
      statusbaru: statusBaru,
    },
  };
}

export async function deleteTagihanSiswa(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa") as string;

  if (!idTagihan) {
    return { status: "error", errors: { _form: ["ID tagihan tidak valid"] } };
  }

  const supabase = await createClient();
  const perm = await getTagihanPermission(supabase, idTagihan);

  if (!perm.ok) {
    return { status: "error", errors: { _form: [perm.reason] } };
  }

  if (!perm.canDelete) {
    return {
      status: "error",
      errors: {
        _form: [
          "Tidak dapat menghapus tagihan yang sudah memiliki riwayat pembayaran. " +
          "Hubungi developer jika ini adalah kesalahan data.",
        ],
      },
    };
  }

  const tagihan: any = perm.tagihan;
  const namaSiswa = first(tagihan.siswa)?.namasiswa || "-";
  const namaTagihan = first(tagihan.master_tagihan)?.namatagihan || "-";

  const { error } = await supabase
    .from("tagihan_siswa")
    .delete()
    .eq("idtagihansiswa", idTagihan);

  if (error) {
    return { status: "error", errors: { _form: [error.message] } };
  }

  await writeChangelog({
    supabase,
    namamenu: "Tagihan Siswa",
    jenisaksi: "HAPUS",
    deskripsi: `Menghapus tagihan #${idTagihan} — ${namaSiswa}: ${namaTagihan} (${tagihan.bulan}/${tagihan.tahun})`,
  });

  revalidatePath("/admin/tagihan");
  return { status: "success" };
}

export async function createTagihanBatch(prevState: any, formData: FormData | null) {
  if (!formData) {
    return { status: "error", errors: { _form: ["Data tidak valid"] } };
  }

  const siswaIdsStr = formData.get("siswa_ids");
  const masterTagihanId = formData.get("master_tagihan_id");
  const bulan = formData.get("bulan");
  const tahun = formData.get("tahun");

  if (!siswaIdsStr || !masterTagihanId || !bulan || !tahun) {
    return { status: "error", errors: { _form: ["Semua field wajib diisi"] } };
  }

  let siswaIds: string[];
  try {
    siswaIds = JSON.parse(siswaIdsStr as string) as string[];
  } catch {
    return { status: "error", errors: { _form: ["Format data siswa tidak valid"] } };
  }

  if (!siswaIds || siswaIds.length === 0) {
    return { status: "error", errors: { _form: ["Pilih minimal 1 siswa"] } };
  }

  const supabase = await createClient();

  const { data: masterTagihan, error: masterError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id_mastertagihan", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return { status: "error", errors: { _form: ["Data master tagihan tidak ditemukan"] } };
  }

  const { data: existing } = await supabase
    .from("tagihan_siswa")
    .select("idsiswa, siswa!idsiswa(namasiswa)")
    .eq("idmastertagihan", masterTagihanId)
    .eq("bulan", parseInt(bulan as string))
    .eq("tahun", parseInt(tahun as string))
    .in("idsiswa", siswaIds);

  if (existing && existing.length > 0) {
    const names = existing.map((t: any) => first(t.siswa)?.namasiswa || t.idsiswa).join(", ");
    return {
      status: "error",
      errors: { _form: [`Siswa berikut sudah memiliki tagihan periode ini: ${names}`] },
    };
  }

  const tagihanToInsert = siswaIds.map((siswaId: string) => ({
    idsiswa: siswaId,
    idmastertagihan: parseInt(masterTagihanId as string),
    bulan: parseInt(bulan as string),
    tahun: parseInt(tahun as string),
    jumlahtagihan: masterTagihan.nominal,
    jumlahterbayar: 0,
    statuspembayaran: "BELUM BAYAR",
  }));

  const { data: insertedTagihan, error: insertError } = await supabase
    .from("tagihan_siswa")
    .insert(tagihanToInsert)
    .select("idtagihansiswa");

  if (insertError) {
    return { status: "error", errors: { _form: [`Gagal membuat tagihan: ${insertError.message}`] } };
  }

  await writeChangelog({
    supabase,
    namamenu: "Tagihan Siswa",
    jenisaksi: "TAMBAH",
    deskripsi: `Membuat ${siswaIds.length} tagihan "${masterTagihan.namatagihan}" untuk periode ${bulan}/${tahun}`,
  });

  revalidatePath("/admin/tagihan");

  // ============================================================
  // DEBUG LOG #5 — Cek env vars sebelum kirim WA notif tagihan baru
  // Hapus bagian ini setelah masalah ditemukan
  // ============================================================
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  console.log("====== DEBUG BUAT TAGIHAN BATCH ======");
  console.log("[ENV] FONNTE_API_KEY  :", process.env.FONNTE_API_KEY ? `ADA (${process.env.FONNTE_API_KEY.slice(0, 6)}...)` : "TIDAK ADA ❌");
  console.log("[ENV] NEXT_PUBLIC_APP_URL:", appUrl);
  console.log("[DATA] insertedTagihan :", insertedTagihan);
  console.log("======================================");

  if (process.env.FONNTE_API_KEY && insertedTagihan?.length) {
    console.log(`[WA] Mencoba kirim ${insertedTagihan.length} notifikasi tagihan baru...`);
    const results = await Promise.allSettled(
      insertedTagihan.map(async (t: any) => {
        const waUrl = `${appUrl}/api/notifications/send-bill`;
        console.log(`[WA] Kirim ke: ${waUrl} — idTagihan: ${t.idtagihansiswa}`);
        const res = await fetch(waUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idTagihan: t.idtagihansiswa }),
        });
        // DEBUG LOG #6 — Hasil tiap notif tagihan
        const body = await res.text();
        console.log(`[WA] idTagihan ${t.idtagihansiswa} → status: ${res.status}, body: ${body}`);
        return { id: t.idtagihansiswa, status: res.status };
      })
    );
    console.log("[WA] Semua hasil:", JSON.stringify(results));
  } else {
    console.warn("[WA] SKIP — FONNTE_API_KEY tidak ada atau tidak ada tagihan yang dibuat");
  }

  return { status: "success" };
}