/**
 * WhatsApp Message Templates
 * Template messages untuk berbagai notifikasi
 */

interface MessageTemplateParams {
  recipientName: string;
  studentName: string;
  [key: string]: string | number;
}

export const whatsappTemplates = {
  /**
   * Notifikasi Tagihan Baru
   */
  notifikasiTagihan: (params: MessageTemplateParams & {
    periode: string;
    namaTagihan: string;
    nominal: string;
    linkPembayaran: string;
    batasPembayaran?: string;
  }): string => {
    return `🔔 *PEMBERITAHUAN TAGIHAN*

Halo ${params.recipientName},

Anak Anda ${params.studentName} telah diterbitkan tagihan pembayaran sebagai berikut:

📋 *Detail Tagihan:*
Periode: ${params.periode}
Jenis Tagihan: ${params.namaTagihan}
Jumlah: *Rp ${params.nominal}*
${params.batasPembayaran ? `Batas Pembayaran: ${params.batasPembayaran}` : ''}

💳 *Untuk melakukan pembayaran, silakan klik link di bawah:*
${params.linkPembayaran}

Terima kasih,
*Pihak Sekolah*`;
  },

  /**
   * Notifikasi Pembayaran Berhasil
   */
  notifikasiPembayaranBerhasil: (params: MessageTemplateParams & {
    namaTagihan: string;
    nominalBayar: string;
    tanggalPembayaran: string;
    linkKwitansi: string;
  }): string => {
    return `✅ *PEMBAYARAN BERHASIL*

Halo ${params.recipientName},

Pembayaran tagihan anak Anda ${params.studentName} telah berhasil diproses.

✔️ *Detail Pembayaran:*
Jenis Tagihan: ${params.namaTagihan}
Jumlah Pembayaran: *Rp ${params.nominalBayar}*
Tanggal Pembayaran: ${params.tanggalPembayaran}
Status: *LUNAS*

📄 *Lihat Kwitansi:*
${params.linkKwitansi}

Terima kasih atas pembayaran Anda!
*Pihak Sekolah*`;
  },

  /**
   * Notifikasi Pembayaran Gagal
   */
  notifikasiPembayaranGagal: (params: MessageTemplateParams & {
    namaTagihan: string;
    nominalBayar: string;
    alasan?: string;
    nomorAdmin?: string;
  }): string => {
    return `⚠️ *PEMBAYARAN GAGAL*

Halo ${params.recipientName},

Pembayaran tagihan anak Anda ${params.studentName} gagal diproses.

❌ *Detail Pembayaran:*
Jenis Tagihan: ${params.namaTagihan}
Jumlah: *Rp ${params.nominalBayar}*
${params.alasan ? `Alasan: ${params.alasan}` : 'Silakan coba kembali'}

🔄 *Silakan coba kembali atau hubungi pihak sekolah untuk bantuan.*

${params.nomorAdmin ? `📱 Hubungi Admin: ${params.nomorAdmin}` : ''}

*Pihak Sekolah*`;
  },

  /**
   * Notifikasi Remider Tagihan Tertunggak
   */
  remiderTagihanTertunggak: (params: MessageTemplateParams & {
    namaTagihan: string;
    nominalTertunggak: string;
    periode: string;
    linkPembayaran: string;
  }): string => {
    return `📢 *PENGINGAT TAGIHAN TERTUNGGAK*

Halo ${params.recipientName},

Masih ada tagihan tertunggak dari anak Anda ${params.studentName} yang perlu dibayarkan.

⚠️ *Detail Tagihan Tertunggak:*
Jenis Tagihan: ${params.namaTagihan}
Periode: ${params.periode}
Jumlah: *Rp ${params.nominalTertunggak}*

💳 *Silakan lakukan pembayaran melalui link berikut:*
${params.linkPembayaran}

Terima kasih,
*Pihak Sekolah*`;
  },

  /**
   * Test Message
   */
  testMessage: (params: MessageTemplateParams): string => {
    return `👋 Halo ${params.recipientName}!

Ini adalah pesan test dari sistem notifikasi WhatsApp PPPM-BM.

Sistem sudah siap untuk mengirimkan notifikasi tagihan dan pembayaran.

*Pihak Sekolah*`;
  },
};

export type TemplateKey = keyof typeof whatsappTemplates;
