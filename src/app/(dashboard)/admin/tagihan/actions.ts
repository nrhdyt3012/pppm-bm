"use server";

import { createClient } from "@/lib/supabase/server";
import { writeChangelog } from "@/lib/changelog";
import { revalidatePath } from "next/cache";

const first = (v: any) => (Array.isArray(v) ? v[0] : v);

// ─── Helper permission ────────────────────────────────────────────────────────
async function getTagihanPermission(supabase: any, idTagihan: string) {
  const { data: tagihan, error } = await supabase
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

  if (error || !tagihan) {
    console.error("[getTagihanPermission] error:", error);
    return { ok: false, reason: "Tagihan tidak ditemukan", tagihan: null };
  }

  // Pastikan pembayaranList selalu array
  const pembayaranList: any[] = Array.isArray(tagihan.pembayaran)
    ? tagihan.pembayaran
    : tagihan.pembayaran
    ? [tagihan.pembayaran]
    : [];

  const hasSuccessPayment = pembayaranList.some(
    (p: any) => p.statuspembayaran === "SUCCESS"
  );

  const hasMidtransPayment = pembayaranList.some(
    (p: any) =>
      p.statuspembayaran === "SUCCESS" && p.metodepembayaran !== "cash"
  );

  // Semua ID pembayaran yang bukan SUCCESS (PENDING, FAILED, EXPIRED)
  const nonSuccessIds = pembayaranList
    .filter((p: any) => p.statuspembayaran !== "SUCCESS")
    .map((p: any) => p.idpembayaran);

  // Semua ID pembayaran (untuk hapus gateway log)
  const allPembayaranIds = pembayaranList.map((p: any) => p.idpembayaran);

  return {
    ok: true,
    tagihan,
    hasSuccessPayment,
    hasMidtransPayment,
    canBayarManual:
      !hasMidtransPayment && tagihan.statuspembayaran !== "LUNAS",
    canDelete: !hasSuccessPayment,
    nonSuccessIds,
    allPembayaranIds,
  };
}

// ─── Bayar Manual ─────────────────────────────────────────────────────────────
export async function bayarTagihanManual(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa") as string;
  const jumlahBayar = parseFloat(formData.get("jumlahbayar") as string);

  if (!idTagihan || !jumlahBayar || jumlahBayar <= 0) {
    return {
      status: "error",
      errors: { _form: ["Data pembayaran tidak valid"] },
    };
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
    return {
      status: "error",
      errors: { _form: ["Jumlah pembayaran melebihi sisa tagihan"] },
    };
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
    return {
      status: "error",
      errors: { _form: [`Gagal update tagihan: ${updateError.message}`] },
    };
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
    console.error("[bayarTagihanManual] Error insert pembayaran:", insertError);
  }

  const namaSiswa = first(tagihan.siswa)?.namasiswa || "-";
  const namaTagihan = first(tagihan.master_tagihan)?.namatagihan || "-";

  await writeChangelog({
    supabase,
    namamenu: "Tagihan Siswa",
    jenisaksi: "UBAH",
    deskripsi: `Mencatat pembayaran cash sebesar Rp${jumlahBayar.toLocaleString(
      "id-ID"
    )} untuk ${namaSiswa} - ${namaTagihan} (${tagihan.bulan}/${tagihan.tahun})`,
  });

  revalidatePath("/admin/tagihan");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (pembayaranData?.idpembayaran) {
    if (process.env.FONNTE_API_KEY) {
      try {
        await fetch(`${appUrl}/api/notifications/send-payment-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idPembayaran: pembayaranData.idpembayaran,
            idTagihan: parseInt(idTagihan),
            status: "SUCCESS",
          }),
        });
      } catch (e) {
        console.error("[WA] Gagal kirim notifikasi pembayaran:", e);
      }
    }
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

// ─── Delete Tagihan ───────────────────────────────────────────────────────────
export async function deleteTagihanSiswa(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa") as string;

  if (!idTagihan) {
    return {
      status: "error",
      errors: { _form: ["ID tagihan tidak valid"] },
    };
  }

  const supabase = await createClient({ isAdmin: true });
  const perm = await getTagihanPermission(supabase, idTagihan);

  if (!perm.ok) {
    return { status: "error", errors: { _form: [perm.reason] } };
  }

  if (!perm.canDelete) {
    return {
      status: "error",
      errors: {
        _form: [
          "Tidak dapat menghapus tagihan yang sudah memiliki riwayat pembayaran berhasil.",
        ],
      },
    };
  }

  const tagihan: any = perm.tagihan;
  const namaSiswa = first(tagihan.siswa)?.namasiswa || "-";
  const namaTagihan = first(tagihan.master_tagihan)?.namatagihan || "-";

  // STEP 1: Hapus whatsapp_notification_logs yang FK ke tagihan ini
  await supabase
    .from("whatsapp_notification_logs")
    .delete()
    .eq("target_id", parseInt(idTagihan));

  // STEP 2: Hapus payment_gateway_log yang FK ke pembayaran non-SUCCESS
  if (perm.nonSuccessIds && perm.nonSuccessIds.length > 0) {
    await supabase
      .from("payment_gateway_log")
      .delete()
      .in("idpembayaran", perm.nonSuccessIds);
  }

  // STEP 3: Hapus pembayaran non-SUCCESS (PENDING, FAILED, EXPIRED)
  if (perm.nonSuccessIds && perm.nonSuccessIds.length > 0) {
    const { error: deletePembayaranError } = await supabase
      .from("pembayaran")
      .delete()
      .in("idpembayaran", perm.nonSuccessIds);

    if (deletePembayaranError) {
      console.error(
        "[deleteTagihanSiswa] Gagal hapus pembayaran:",
        deletePembayaranError
      );
      return {
        status: "error",
        errors: {
          _form: [
            `Gagal membersihkan data pembayaran: ${deletePembayaranError.message}`,
          ],
        },
      };
    }
  }

  // STEP 4: Hapus tagihan
  const { error: deleteError } = await supabase
    .from("tagihan_siswa")
    .delete()
    .eq("idtagihansiswa", idTagihan);

  if (deleteError) {
    console.error("[deleteTagihanSiswa] Gagal hapus tagihan:", deleteError);
    return {
      status: "error",
      errors: { _form: [deleteError.message] },
    };
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

// ─── Create Batch ─────────────────────────────────────────────────────────────
export async function createTagihanBatch(
  prevState: any,
  formData: FormData | null
) {
  if (!formData) {
    return { status: "error", errors: { _form: ["Data tidak valid"] } };
  }

  const siswaIdsStr = formData.get("siswa_ids");
  const masterTagihanId = formData.get("master_tagihan_id");
  const bulan = formData.get("bulan");
  const tahun = formData.get("tahun");

  if (!siswaIdsStr || !masterTagihanId || !bulan || !tahun) {
    return {
      status: "error",
      errors: { _form: ["Semua field wajib diisi"] },
    };
  }

  let siswaIds: string[];
  try {
    siswaIds = JSON.parse(siswaIdsStr as string) as string[];
  } catch {
    return {
      status: "error",
      errors: { _form: ["Format data siswa tidak valid"] },
    };
  }

  if (!siswaIds || siswaIds.length === 0) {
    return {
      status: "error",
      errors: { _form: ["Pilih minimal 1 siswa"] },
    };
  }

  const supabase = await createClient({ isAdmin: true });

  const { data: masterTagihan, error: masterError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id_mastertagihan", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return {
      status: "error",
      errors: { _form: ["Data master tagihan tidak ditemukan"] },
    };
  }

  const { data: existing } = await supabase
    .from("tagihan_siswa")
    .select("idsiswa, siswa!idsiswa(namasiswa)")
    .eq("idmastertagihan", masterTagihanId)
    .eq("bulan", parseInt(bulan as string))
    .eq("tahun", parseInt(tahun as string))
    .in("idsiswa", siswaIds);

  if (existing && existing.length > 0) {
    const names = existing
      .map((t: any) => first(t.siswa)?.namasiswa || t.idsiswa)
      .join(", ");
    return {
      status: "error",
      errors: {
        _form: [`Siswa berikut sudah memiliki tagihan periode ini: ${names}`],
      },
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
    return {
      status: "error",
      errors: { _form: [`Gagal membuat tagihan: ${insertError.message}`] },
    };
  }

  await writeChangelog({
    supabase,
    namamenu: "Tagihan Siswa",
    jenisaksi: "TAMBAH",
    deskripsi: `Membuat ${siswaIds.length} tagihan "${masterTagihan.namatagihan}" untuk periode ${bulan}/${tahun}`,
  });

  revalidatePath("/admin/tagihan");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (process.env.FONNTE_API_KEY && insertedTagihan?.length) {
    await Promise.allSettled(
      insertedTagihan.map(async (t: any) => {
        try {
          await fetch(`${appUrl}/api/notifications/send-bill`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTagihan: t.idtagihansiswa }),
          });
        } catch (e) {
          console.error(
            `[WA] Gagal kirim notif tagihan ${t.idtagihansiswa}:`,
            e
          );
        }
      })
    );
  }

  return { status: "success" };
}