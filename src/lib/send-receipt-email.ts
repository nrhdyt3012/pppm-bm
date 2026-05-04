// src/lib/send-receipt-email.ts
// Helper server-side untuk kirim kwitansi via email setelah pembayaran sukses.
// Dipanggil dari server actions (bayarTagihanManual, confirmPayment, dll).

const BULAN_NAMA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function convertIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildReceiptHtml(params: {
  siswa: any;
  tagihan: any;
  jumlahBayar: number;
  totalTagihan: number;
  sisaTagihan: number;
  isLunas: boolean;
  metode: string;
  noKwitansi: string;
  tanggalCetak: string;
}): string {
  const { siswa, tagihan, jumlahBayar, totalTagihan, sisaTagihan, isLunas, metode, noKwitansi, tanggalCetak } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 14px; color: #222; background: #f4f4f4; padding: 24px; }
    .card { background: #fff; max-width: 640px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #16a34a; color: #fff; padding: 24px 28px; }
    .header h1 { font-size: 20px; font-weight: bold; }
    .header p { font-size: 12px; opacity: 0.85; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-top: 12px; }
    .badge-lunas { background: #bbf7d0; color: #15803d; }
    .badge-belum { background: #fee2e2; color: #b91c1c; }
    .body { padding: 24px 28px; }
    .section-title { font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .info-row .label { color: #6b7280; }
    .info-row .value { font-weight: 600; text-align: right; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .text-right { text-align: right; }
    .total-row td { font-weight: bold; border-top: 2px solid #e5e7eb; border-bottom: none; }
    .sisa-color { color: ${sisaTagihan > 0 ? "#b91c1c" : "#16a34a"}; }
    .status-box { border: 2px solid ${isLunas ? "#16a34a" : "#f59e0b"}; background: ${isLunas ? "#f0fdf4" : "#fffbeb"}; color: ${isLunas ? "#15803d" : "#92400e"}; border-radius: 6px; padding: 12px; text-align: center; font-weight: bold; font-size: 15px; margin-bottom: 20px; }
    .footer { text-align: center; font-size: 11px; color: #9ca3af; padding: 16px 28px; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>PAUD Aisyiyah Bustanul Athfal 1 Buduran</h1>
      <p>Jl. Kavling Persada Asri C-37, Damarsi, Buduran, Sidoarjo</p>
      <div><span class="badge ${isLunas ? "badge-lunas" : "badge-belum"}">${isLunas ? "✓ LUNAS" : "⚠ BELUM LUNAS"}</span></div>
    </div>
    <div class="body">
      <h2 style="text-align:center;font-size:16px;margin-bottom:4px;">KWITANSI PEMBAYARAN</h2>
      <p style="text-align:center;font-size:12px;color:#6b7280;margin-bottom:20px;">No. ${noKwitansi}</p>
      <div class="grid2">
        <div>
          <p class="section-title">Data Siswa</p>
          <div class="info-row"><span class="label">Nama</span><span class="value">${siswa?.namasiswa || "-"}</span></div>
          <div class="info-row"><span class="label">Kelas</span><span class="value">${siswa?.kelas || "-"}</span></div>
          <div class="info-row"><span class="label">Wali</span><span class="value">${siswa?.namawali || "-"}</span></div>
        </div>
        <div>
          <p class="section-title">Detail Transaksi</p>
          <div class="info-row"><span class="label">ID Tagihan</span><span class="value">#${tagihan?.idtagihansiswa}</span></div>
          <div class="info-row"><span class="label">Periode</span><span class="value">${BULAN_NAMA[tagihan?.bulan || 0]} ${tagihan?.tahun}</span></div>
          <div class="info-row"><span class="label">Tanggal</span><span class="value">${tanggalCetak}</span></div>
          <div class="info-row"><span class="label">Metode</span><span class="value">${metode}</span></div>
        </div>
      </div>
      <p class="section-title">Rincian Pembayaran</p>
      <table>
        <thead>
          <tr><th>Keterangan</th><th>Periode</th><th class="text-right">Total Tagihan</th><th class="text-right">Dibayar</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${tagihan?.master_tagihan?.namatagihan || "-"}</td>
            <td>${BULAN_NAMA[tagihan?.bulan || 0]} ${tagihan?.tahun}</td>
            <td class="text-right">${convertIDR(totalTagihan)}</td>
            <td class="text-right" style="color:#16a34a;font-weight:bold;">${convertIDR(jumlahBayar)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row"><td colspan="3" class="text-right">Jumlah Dibayar:</td><td class="text-right" style="color:#16a34a;">${convertIDR(jumlahBayar)}</td></tr>
          <tr><td colspan="3" class="text-right" style="padding:8px 12px;color:#6b7280;">Sisa Tagihan:</td><td class="text-right sisa-color" style="padding:8px 12px;font-weight:600;">${sisaTagihan > 0 ? convertIDR(sisaTagihan) : "LUNAS ✓"}</td></tr>
        </tfoot>
      </table>
      <div class="status-box">
        STATUS TAGIHAN: ${isLunas ? "✓ LUNAS" : "⚠ BELUM LUNAS"}
        ${!isLunas ? `<br/><span style="font-size:12px;font-weight:normal;">Sisa: ${convertIDR(sisaTagihan)}</span>` : ""}
      </div>
    </div>
    <div class="footer">
      <p>Kwitansi ini dikirim otomatis oleh sistem PAUD Aisyiyah Bustanul Athfal 1 Buduran</p>
      <p>Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    </div>
  </div>
</body>
</html>`.trim();
}

/**
 * Kirim kwitansi ke email wali siswa.
 * Dipanggil setelah pembayaran sukses di server actions.
 *
 * @param supabase - admin supabase client
 * @param params   - data tagihan, pembayaran, siswa
 */
export async function sendReceiptEmail(
  supabase: any,
  params: {
    idTagihan: number | string;
    idPembayaran: number;
    jumlahBayar: number;
    totalTagihan: number;
    sisaTagihan: number;
    statusBaru: string;
    metodePembayaran: "cash" | "midtrans_online";
    tanggalPembayaran?: Date;
  }
): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@paudba1buduran.sch.id";

  if (!RESEND_API_KEY) {
    console.warn("[sendReceiptEmail] RESEND_API_KEY tidak diset, skip kirim email");
    return;
  }

  try {
    // Ambil detail tagihan + siswa + master_tagihan
    const { data: tagihan } = await supabase
      .from("tagihan_siswa")
      .select(`
        idtagihansiswa, jumlahtagihan, jumlahterbayar, statuspembayaran, bulan, tahun,
        siswa:siswa!idsiswa(id, namasiswa, kelas, namawali, nowa, email),
        master_tagihan:master_tagihan!idmastertagihan(namatagihan, jenjang, jenistagihan)
      `)
      .eq("idtagihansiswa", params.idTagihan)
      .single();

    if (!tagihan) return;

    const siswa = tagihan.siswa as any;

    // Cari email dari auth jika tidak ada di tabel siswa
    let emailTujuan: string | null = siswa?.email || null;
    if (!emailTujuan && siswa?.id) {
      const { data: authUser } = await supabase.auth.admin.getUserById(siswa.id);
      emailTujuan = authUser?.user?.email || null;
    }

    if (!emailTujuan) {
      console.warn("[sendReceiptEmail] Email tidak ditemukan untuk siswa:", siswa?.id);
      return;
    }

    const isLunas = params.statusBaru === "LUNAS";
    const metode = params.metodePembayaran === "cash" ? "Tunai/Cash" : "Transfer/Online (Midtrans)";
    const tgl = params.tanggalPembayaran || new Date();
    const noKwitansi = `${params.idTagihan}/${params.idPembayaran}/${tgl.getFullYear()}`;
    const tanggalCetak = tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const htmlContent = buildReceiptHtml({
      siswa, tagihan,
      jumlahBayar: params.jumlahBayar,
      totalTagihan: params.totalTagihan,
      sisaTagihan: params.sisaTagihan,
      isLunas, metode, noKwitansi, tanggalCetak,
    });

    const subject = isLunas
      ? `✓ Tagihan LUNAS — ${tagihan.master_tagihan?.namatagihan} (${BULAN_NAMA[tagihan.bulan]} ${tagihan.tahun})`
      : `Konfirmasi Pembayaran — ${tagihan.master_tagihan?.namatagihan} (${BULAN_NAMA[tagihan.bulan]} ${tagihan.tahun})`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `PAUD BA 1 Buduran <${FROM_EMAIL}>`,
        to: [emailTujuan],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[sendReceiptEmail] Resend error:", err);
    } else {
      console.log("[sendReceiptEmail] Email terkirim ke:", emailTujuan);
    }
  } catch (err) {
    console.error("[sendReceiptEmail] Error:", err);
  }
}