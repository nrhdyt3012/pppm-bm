/**
 * WhatsApp Message Templates
 * Template messages untuk notifikasi KB TK Aisyiyah Bustanul Athfal 1 Buduran
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
    nominal: string | number;
    linkPembayaran: string;
    batasPembayaran?: string;
    kelas?: string;
  }): string => {
    const nominalFormatted =
      typeof params.nominal === 'number'
        ? new Intl.NumberFormat('id-ID').format(params.nominal)
        : params.nominal;

    return `🔔 *PEMBERITAHUAN TAGIHAN*

Assalamu'alaikum Wr. Wb.

Yth. Bapak/Ibu *${params.recipientName}*

Kami informasikan bahwa telah diterbitkan tagihan pembayaran untuk Ananda *${params.studentName}*${params.kelas ? ` (${params.kelas})` : ''} dengan rincian sebagai berikut:

📋 *Detail Tagihan*
- Periode: ${params.periode}
- Jenis Tagihan: ${params.namaTagihan}
- Nominal: Rp${nominalFormatted}

Untuk melakukan pembayaran, silakan mengakses tautan berikut:
${params.linkPembayaran}

Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.

Wassalamu'alaikum Wr. Wb.
*KB TK Aisyiyah Bustanul Athfal 1 Buduran*`;
  },

  /**
   * Notifikasi Pembayaran Berhasil
   */
  notifikasiPembayaranBerhasil: (params: MessageTemplateParams & {
    namaTagihan: string;
    nominalBayar: string | number;
    tanggalPembayaran: string;
    linkKwitansi: string;
    kelas?: string;
  }): string => {
    const nominalFormatted =
      typeof params.nominalBayar === 'number'
        ? new Intl.NumberFormat('id-ID').format(params.nominalBayar)
        : params.nominalBayar;

    return `✅ *PEMBAYARAN BERHASIL*

Assalamu'alaikum Wr. Wb.

Yth. Bapak/Ibu *${params.recipientName}*

Alhamdulillah, pembayaran tagihan untuk Ananda *${params.studentName}*${params.kelas ? ` (${params.kelas})` : ''} telah kami terima dengan rincian sebagai berikut:

📄 *Detail Pembayaran*
- Jenis Tagihan: ${params.namaTagihan}
- Nominal Pembayaran: Rp${nominalFormatted}
- Tanggal Pembayaran: ${params.tanggalPembayaran}
- Status: *LUNAS* ✓

Kwitansi pembayaran dapat dilihat melalui tautan berikut:
${params.linkKwitansi}

Jazakumullahu khairan atas kepercayaan dan kerja sama Bapak/Ibu.

Wassalamu'alaikum Wr. Wb.
*KB TK Aisyiyah Bustanul Athfal 1 Buduran*`;
  },

  /**
   * Notifikasi Pembayaran Gagal / Kadaluarsa
   */
  notifikasiPembayaranGagal: (params: MessageTemplateParams & {
    namaTagihan: string;
    nominalBayar: string | number;
    alasan?: string;
    nomorAdmin?: string;
    kelas?: string;
  }): string => {
    const nominalFormatted =
      typeof params.nominalBayar === 'number'
        ? new Intl.NumberFormat('id-ID').format(params.nominalBayar)
        : params.nominalBayar;

    return `⚠️ *PEMBAYARAN GAGAL*

Assalamu'alaikum Wr. Wb.

Yth. Bapak/Ibu *${params.recipientName}*

Kami informasikan bahwa pembayaran tagihan untuk Ananda *${params.studentName}*${params.kelas ? ` (${params.kelas})` : ''} belum berhasil diproses.

❌ *Detail Pembayaran*
- Jenis Tagihan: ${params.namaTagihan}
- Nominal: Rp${nominalFormatted}
- Keterangan: ${params.alasan || 'Pembayaran tidak berhasil, silakan coba kembali'}

Mohon Bapak/Ibu melakukan pembayaran ulang melalui aplikasi atau menghubungi pihak sekolah untuk bantuan lebih lanjut.${params.nomorAdmin ? `\n\n📱 Hubungi Admin: *${params.nomorAdmin}*` : ''}

Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.

Wassalamu'alaikum Wr. Wb.
*KB TK Aisyiyah Bustanul Athfal 1 Buduran*`;
  },

  /**
   * Pengingat Tagihan Tertunggak — dipakai dari menu Rekapan Tunggakan
   */
  remiderTagihanTertunggak: (params: MessageTemplateParams & {
    namaTagihan: string;
    nominalTertunggak: string | number;
    periode: string;
    linkPembayaran: string;
    kelas?: string;
  }): string => {
    const nominalFormatted =
      typeof params.nominalTertunggak === 'number'
        ? new Intl.NumberFormat('id-ID').format(params.nominalTertunggak)
        : params.nominalTertunggak;

    return `🔔 *PENGINGAT PEMBAYARAN*

Assalamu'alaikum Wr. Wb.

Yth. Bapak/Ibu Wali Murid Ananda *${params.studentName}*${params.kelas ? ` (${params.kelas})` : ''}

Dengan hormat, kami informasikan bahwa hingga saat ini masih terdapat tagihan administrasi yang belum terbayarkan:

- ${params.namaTagihan} ${params.periode} — Rp${nominalFormatted}

*Total Tunggakan: Rp${nominalFormatted}*

Mohon kesediaan Bapak/Ibu untuk segera melakukan pembayaran melalui tautan berikut:
${params.linkPembayaran}

Apabila pembayaran telah dilakukan, mohon abaikan pesan ini.

Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.

Wassalamu'alaikum Wr. Wb.
*KB TK Aisyiyah Bustanul Athfal 1 Buduran*`;
  },

  /**
   * Test Message
   */
  testMessage: (params: MessageTemplateParams): string => {
    return `👋 *TES NOTIFIKASI*

Assalamu'alaikum Wr. Wb.

Halo *${params.recipientName}*!

Ini adalah pesan tes dari sistem notifikasi WhatsApp KB TK Aisyiyah Bustanul Athfal 1 Buduran.

Sistem sudah siap untuk mengirimkan notifikasi tagihan dan pembayaran.

Wassalamu'alaikum Wr. Wb.
*KB TK Aisyiyah Bustanul Athfal 1 Buduran*`;
  },
};

export type TemplateKey = keyof typeof whatsappTemplates;