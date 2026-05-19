"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper: cek permission tagihan berdasarkan riwayat pembayaran
async function getTagihanPermission(supabase: any, idTagihan: string) {
  const { data: tagihan } = await supabase
    .from("tagihan_siswa")
    .select(`
      idtagihansiswa,
      statuspembayaran,
      jumlahtagihan,
      jumlahterbayar,
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

  // Cek apakah ada pembayaran yang berhasil (cash maupun Midtrans)
  const hasSuccessPayment = pembayaranList.some(
    (p: any) => p.statuspembayaran === "SUCCESS"
  );

  const hasMidtransPayment = pembayaranList.some(
    (p: any) =>
      p.statuspembayaran === "SUCCESS" && p.metodepembayaran !== "cash"
  );

  return {
    ok: true,
    tagihan,
    hasSuccessPayment,
    hasMidtransPayment,
    // Boleh bayar manual jika belum ada pembayaran Midtrans dan belum LUNAS
    canBayarManual:
      !hasMidtransPayment && tagihan.statuspembayaran !== "LUNAS",
    // Boleh delete hanya jika belum ada pembayaran sama sekali
    canDelete: !hasSuccessPayment,
  };
}

// Bayar tagihan secara cash/manual oleh admin
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
    return {
      status: "error",
      errors: { _form: ["Jumlah pembayaran melebihi sisa tagihan"] },
    };
  }

  const terbayarBaru = sudahBayar + jumlahBayar;
  // sisa akan auto-dihitung oleh trigger database
  const statusBaru = terbayarBaru >= totalTagihan ? "LUNAS" : "BELUM BAYAR";

  // Update tagihan_siswa
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

  // Insert record pembayaran
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

  revalidatePath("/admin/tagihan");

  // Kirim email kwitansi
  if (pembayaranData?.idpembayaran) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      await fetch(`${appUrl}/api/send-receipt`, {
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
    } catch (e) {
      console.error("Gagal kirim email:", e);
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

// Hapus tagihan — hanya boleh jika belum ada pembayaran
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

  const { error } = await supabase
    .from("tagihan_siswa")
    .delete()
    .eq("idtagihansiswa", idTagihan);

  if (error) {
    return { status: "error", errors: { _form: [error.message] } };
  }

  revalidatePath("/admin/tagihan");
  return { status: "success" };
}

// Buat tagihan batch untuk beberapa siswa
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

  // Ambil data master tagihan
  const { data: masterTagihan, error: masterError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id_mastertagihan", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return { status: "error", errors: { _form: ["Data master tagihan tidak ditemukan"] } };
  }

  // Cek duplikat
  const { data: existing } = await supabase
    .from("tagihan_siswa")
    .select("idsiswa, siswa!idsiswa(namasiswa)")
    .eq("idmastertagihan", masterTagihanId)
    .eq("bulan", parseInt(bulan as string))
    .eq("tahun", parseInt(tahun as string))
    .in("idsiswa", siswaIds);

  if (existing && existing.length > 0) {
    const names = existing.map((t: any) => t.siswa?.namasiswa || t.idsiswa).join(", ");
    return {
      status: "error",
      errors: { _form: [`Siswa berikut sudah memiliki tagihan periode ini: ${names}`] },
    };
  }

  // Insert tagihan untuk setiap siswa
  // CATATAN: sisa akan auto-compute oleh database menggunakan formula DEFAULT
  const tagihanToInsert = siswaIds.map((siswaId: string) => ({
    idsiswa: siswaId,
    idmastertagihan: parseInt(masterTagihanId as string),
    bulan: parseInt(bulan as string),
    tahun: parseInt(tahun as string),
    jumlahtagihan: masterTagihan.nominal,
    jumlahterbayar: 0,
    statuspembayaran: "BELUM BAYAR",
  }));

  const { error: insertError } = await supabase
    .from("tagihan_siswa")
    .insert(tagihanToInsert);

  if (insertError) {
    return { status: "error", errors: { _form: [`Gagal membuat tagihan: ${insertError.message}`] } };
  }

  revalidatePath("/admin/tagihan");
  return { status: "success" };
}