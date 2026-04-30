"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Update status tagihan siswa
export async function updateTagihanSiswa(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa");
  const statusPembayaran = formData.get("statuspembayaran");

  if (!idTagihan) {
    return { status: "error", errors: { _form: ["ID tagihan tidak valid"] } };
  }

  const supabase = await createClient();

  const updateData: any = {
    statuspembayaran: statusPembayaran,
    updatedat: new Date().toISOString(),
  };

  // Jika LUNAS, update juga jumlahterbayar
  if (statusPembayaran === "LUNAS") {
    // Ambil jumlah tagihan terlebih dahulu
    const { data: tagihan } = await supabase
      .from("tagihan_siswa")
      .select("jumlahtagihan")
      .eq("idtagihansiswa", idTagihan)
      .single();

    if (tagihan) {
      updateData.jumlahterbayar = parseFloat(tagihan.jumlahtagihan);
      updateData.sisa = 0;
    }
  }

  const { error } = await supabase
    .from("tagihan_siswa")
    .update(updateData)
    .eq("idtagihansiswa", idTagihan);

  if (error) {
    return { status: "error", errors: { _form: [`Gagal update: ${error.message}`] } };
  }

  revalidatePath("/admin/tagihan");
  return { status: "success" };
}

// Hapus tagihan siswa
export async function deleteTagihanSiswa(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa");

  if (!idTagihan) {
    return { status: "error", errors: { _form: ["ID tagihan tidak valid"] } };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tagihan_siswa")
    .delete()
    .eq("idtagihansiswa", idTagihan);

  if (error) {
    return { status: "error", errors: { _form: [`Gagal hapus: ${error.message}`] } };
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