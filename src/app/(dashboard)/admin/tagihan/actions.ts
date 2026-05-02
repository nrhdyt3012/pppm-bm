// src/app/(dashboard)/admin/tagihan/actions.ts
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
  // CATATAN: sisa akan auto-compute oleh database dari formula DEFAULT
  if (statusPembayaran === "LUNAS") {
    const { data: tagihan } = await supabase
      .from("tagihan_siswa")
      .select("jumlahtagihan")
      .eq("idtagihansiswa", idTagihan)
      .single();

    if (tagihan) {
      updateData.jumlahterbayar = parseFloat(tagihan.jumlahtagihan);
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

// ============ FITUR BARU: PEMBAYARAN MANUAL (CASH) ============
export async function bayarTagihanManual(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idtagihansiswa");
  const jumlahBayar = parseFloat(formData.get("jumlahbayar") as string);

  if (!idTagihan || !jumlahBayar || jumlahBayar <= 0) {
    return { status: "error", errors: { _form: ["Data pembayaran tidak valid"] } };
  }

  const supabase = await createClient({ isAdmin: true });

  // Ambil data tagihan
  const { data: tagihan, error: fetchError } = await supabase
    .from("tagihan_siswa")
    .select("idtagihansiswa, idsiswa, jumlahtagihan, jumlahterbayar")
    .eq("idtagihansiswa", idTagihan)
    .single();

  if (fetchError || !tagihan) {
    return { status: "error", errors: { _form: ["Tagihan tidak ditemukan"] } };
  }

  const totalTagihan = parseFloat(tagihan.jumlahtagihan || "0");
  const sudahBayar = parseFloat(tagihan.jumlahterbayar || "0");
  const sisaTagihan = totalTagihan - sudahBayar;

  if (jumlahBayar > sisaTagihan) {
    return { status: "error", errors: { _form: ["Jumlah pembayaran melebihi sisa tagihan"] } };
  }

  const terbayarBaru = sudahBayar + jumlahBayar;
  const sisaBaru = totalTagihan - terbayarBaru;
  const statusBaru = sisaBaru === 0 ? "LUNAS" : "BELUM BAYAR";

  // Update tagihan_siswa
  // CATATAN: sisa akan auto-compute oleh database dari formula DEFAULT
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

  // Insert ke tabel pembayaran
  const { data: pembayaranData, error: insertError } = await supabase
    .from("pembayaran")
    .insert({
      idtagihansiswa: parseInt(idTagihan as string),
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
    // Tidak fatal, tagihan sudah terupdate
  }

  revalidatePath("/admin/tagihan");

  // Kirim kwitansi email jika pembayaran sukses
  if (pembayaranData?.idpembayaran) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      await fetch(`${appUrl}/api/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPembayaran: pembayaranData.idpembayaran,
          idTagihan: parseInt(idTagihan as string),
          jumlahBayar: jumlahBayar,
          totalTagihan: totalTagihan,
          sisaTagihan: sisaBaru,
          statusBaru: statusBaru,
          metodePembayaran: "cash",
        }),
      });
      console.log(`📧 [bayarTagihanManual] Receipt email queued for pembayaran ${pembayaranData.idpembayaran}`);
    } catch (emailError) {
      console.error(`⚠️ [bayarTagihanManual] Failed to queue receipt email:`, emailError);
      // Jangan stop execution jika email fail
    }
  }

  return { 
    status: "success",
    data: {
      idpembayaran: pembayaranData?.idpembayaran,
      jumlahbayar: jumlahBayar,
      sisatagihan: sisaBaru,
      statusbaru: statusBaru,
    }
  };
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