// src/app/(dashboard)/admin/tagihan/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Update status tagihan siswa
export async function updateTagihanSiswa(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idTagihanSiswa");
  const idMasterTagihan = formData.get("idMasterTagihan");
  const jumlahTagihan = formData.get("jumlahTagihan");
  const statusPembayaran = formData.get("statusPembayaran");
  const bulan = formData.get("bulan");
  const tahun = formData.get("tahun");

  if (!idTagihan) {
    return { status: "error", errors: { _form: ["ID tagihan tidak valid"] } };
  }

  const supabase = await createClient();

  const updateData: any = {
    statusPembayaran: statusPembayaran,
    updatedAt: new Date().toISOString(),
  };

  if (idMasterTagihan) updateData.idMasterTagihan = parseInt(idMasterTagihan as string);
  if (jumlahTagihan) updateData.jumlahTagihan = parseFloat(jumlahTagihan as string);
  if (bulan) updateData.bulan = parseInt(bulan as string);
  if (tahun) updateData.tahun = parseInt(tahun as string);

  const { error } = await supabase
    .from("tagihan_siswa")
    .update(updateData)
    .eq("idTagihanSiswa", idTagihan);

  if (error) {
    return { status: "error", errors: { _form: [`Gagal update: ${error.message}`] } };
  }

  revalidatePath("/admin/tagihan");
  return { status: "success" };
}

// Hapus tagihan siswa
export async function deleteTagihanSiswa(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idTagihanSiswa");

  if (!idTagihan) {
    return { status: "error", errors: { _form: ["ID tagihan tidak valid"] } };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tagihan_siswa")
    .delete()
    .eq("idTagihanSiswa", idTagihan);

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
    .eq("id_masterTagihan", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return { status: "error", errors: { _form: ["Data master tagihan tidak ditemukan"] } };
  }

  // Cek duplikat (siswa yang sudah punya tagihan di bulan & tahun yang sama)
  const { data: existing } = await supabase
    .from("tagihan_siswa")
    .select("idSiswa, siswa!idSiswa(namaSiswa)")
    .eq("idMasterTagihan", masterTagihanId)
    .eq("bulan", parseInt(bulan as string))
    .eq("tahun", parseInt(tahun as string))
    .in("idSiswa", siswaIds);

  if (existing && existing.length > 0) {
    const names = existing.map((t: any) => t.siswa?.namaSiswa || t.idSiswa).join(", ");
    return {
      status: "error",
      errors: { _form: [`Siswa berikut sudah memiliki tagihan periode ini: ${names}`] },
    };
  }

  // Insert tagihan untuk setiap siswa
  const tagihanToInsert = siswaIds.map((siswaId: string) => ({
    idSiswa: siswaId,
    idMasterTagihan: parseInt(masterTagihanId as string),
    bulan: parseInt(bulan as string),
    tahun: parseInt(tahun as string),
    jumlahTagihan: masterTagihan.nominal,
    jumlahTerbayar: 0,
    statusPembayaran: "BELUM BAYAR",
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