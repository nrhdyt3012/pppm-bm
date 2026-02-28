"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Eye,
  Share2,
  ArrowLeft,
  Facebook,
  Twitter,
  MessageCircle,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Data berita lengkap (nanti bisa dari API)
const beritaLengkap = {
  "smp-budi-utomo-perak-melaju-gemilang-di-kejurkab-softball-piala-koni-2025": {
    id: 1,
    judul:
      "SMP Budi Utomo Perak Melaju Gemilang di Kejurkab Softball Piala KONI 2025",
    ringkasan:
      "Tim softball SMP Budi Utomo Perak berhasil meraih prestasi gemilang dalam Kejuaraan Kabupaten Softball Piala KONI 2025.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-11-17",
    kategori: "Prestasi",
    penulis: "Admin PPPM",
    views: 234,
    kontenLengkap: `
      <h2>Prestasi Membanggakan Tim Softball</h2>
      <p>Dalam ajang Kejuaraan Kabupaten (Kejurkab) Softball Piala KONI 2025 yang diselenggarakan di Lapangan Softball Kabupaten Jombang, tim putri SMP Budi Utomo Perak berhasil menunjukkan performa luar biasa dan meraih hasil yang membanggakan.</p>
      
      <p>Tim yang dilatih oleh Pak Ahmad Yusuf ini berhasil mengalahkan tim-tim tangguh dari berbagai sekolah di Kabupaten Jombang dalam pertandingan yang berlangsung sengit dan penuh sportivitas.</p>
      
      <h3>Perjalanan Menuju Juara</h3>
      <p>Perjalanan tim SMP Budi Utomo Perak dalam kejuaraan ini tidaklah mudah. Mereka harus melewati babak penyisihan dengan menghadapi 8 tim kuat lainnya. Dalam setiap pertandingan, tim kami menunjukkan kemampuan batting yang solid, fielding yang presisi, dan kekompakan tim yang luar biasa.</p>
      
      <blockquote>
        <p>"Kami sangat bangga dengan prestasi anak-anak. Mereka telah berlatih keras selama berbulan-bulan dan hasilnya terbayar lunas. Ini adalah bukti bahwa dengan kerja keras, disiplin, dan doa, prestasi dapat diraih." - Pak Ahmad Yusuf, Pelatih Tim Softball</p>
      </blockquote>
      
      <h3>Dukungan Penuh dari Sekolah</h3>
      <p>Kepala SMP Budi Utomo Perak, Ibu Siti Aminah, S.Pd., menyampaikan apresiasi yang tinggi kepada tim dan pelatih. "Prestasi ini adalah kebanggaan bagi seluruh keluarga besar SMP Budi Utomo Perak. Kami akan terus mendukung pengembangan bakat dan minat siswa di bidang olahraga maupun akademik," ujarnya.</p>
      
      <h3>Target Ke Depan</h3>
      <p>Dengan prestasi ini, tim SMP Budi Utomo Perak berhak mewakili Kabupaten Jombang dalam Kejuaraan Softball tingkat Provinsi yang akan diselenggarakan pada bulan Januari 2026. Tim kini sedang mempersiapkan diri dengan latihan yang lebih intensif untuk menghadapi kompetisi yang lebih besar.</p>
      
      <p>Selamat kepada seluruh tim softball SMP Budi Utomo Perak! Semoga prestasi ini menjadi motivasi bagi siswa-siswi lain untuk terus berprestasi dan mengharumkan nama sekolah.</p>
      
      <p><strong>Tim Softball SMP Budi Utomo Perak:</strong></p>
      <ul>
        <li>Siti Nurhaliza (Kapten)</li>
        <li>Dewi Anggraini</li>
        <li>Putri Maharani</li>
        <li>Aisyah Rahmawati</li>
        <li>Fatimah Azzahra</li>
        <li>Lailatul Fitriyah</li>
        <li>Nur Azizah</li>
        <li>Rizka Amalia</li>
        <li>Salsabila Putri</li>
      </ul>
    `,
    tags: ["Prestasi", "Softball", "Olahraga", "KONI", "SMP"],
  },
  "smp-budi-utomo-perak-raih-juara-harapan-1-matholympiad-2025": {
    id: 2,
    judul: "SMP Budi Utomo Perak Raih Juara Harapan 1 pada MathOlympiad 2025",
    ringkasan:
      "Santri berprestasi dari SMP Budi Utomo Perak berhasil meraih Juara Harapan 1 dalam kompetisi MathOlympiad tingkat nasional.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-11-16",
    kategori: "Prestasi",
    penulis: "Admin PPPM",
    views: 189,
    kontenLengkap: `
      <h2>Prestasi Gemilang di Bidang Matematika</h2>
      <p>Muhammad Rafi Al-Ghifari, siswa kelas IX SMP Budi Utomo Perak, berhasil meraih Juara Harapan 1 dalam ajang MathOlympiad 2025 yang diselenggarakan oleh Universitas Indonesia di Jakarta pada 10-12 November 2025.</p>
      
      <p>Kompetisi bergengsi ini diikuti oleh lebih dari 500 siswa terbaik dari seluruh Indonesia, yang telah melewati seleksi ketat di tingkat sekolah dan kabupaten/kota.</p>
      
      <h3>Persiapan Matang</h3>
      <p>Rafi mempersiapkan diri untuk kompetisi ini dengan latihan intensif selama 6 bulan. Ia dibimbing langsung oleh Pak Dr. Budi Santoso, guru matematika SMP Budi Utomo Perak yang juga merupakan alumni olimpiade matematika tingkat internasional.</p>
      
      <blockquote>
        <p>"Saya sangat senang bisa mengharumkan nama sekolah. Terima kasih kepada guru-guru yang telah membimbing saya, terutama Pak Budi yang tidak pernah lelah mengajari saya konsep-konsep matematika yang sulit." - Muhammad Rafi Al-Ghifari</p>
      </blockquote>
      
      <h3>Soal yang Menantang</h3>
      <p>Dalam kompetisi ini, Rafi harus mengerjakan 30 soal pilihan ganda dan 5 soal esai dalam waktu 3 jam. Soal-soal yang diberikan mencakup berbagai topik matematika tingkat SMP seperti aljabar, geometri, teori bilangan, dan kombinatorik.</p>
      
      <p>Rafi berhasil menyelesaikan semua soal dengan baik dan mendapatkan nilai tertinggi ketiga dari seluruh peserta, sehingga berhak mendapatkan penghargaan Juara Harapan 1.</p>
      
      <h3>Target Olimpiade Internasional</h3>
      <p>Dengan prestasi ini, Rafi berkesempatan untuk mengikuti seleksi tim olimpiade matematika Indonesia yang akan bertanding di International Mathematics Olympiad (IMO) 2026. Ia kini sedang mengikuti program pembinaan khusus di tingkat nasional.</p>
      
      <p>Kepala Sekolah SMP Budi Utomo Perak menyampaikan, "Kami sangat bangga dengan prestasi Rafi. Ini membuktikan bahwa pesantren kami tidak hanya fokus pada pendidikan agama, tetapi juga memberikan perhatian serius pada pengembangan kemampuan akademik siswa."</p>
    `,
    tags: ["Prestasi", "Matematika", "Olimpiade", "Akademik"],
  },
  "prestasi-gemilang-siswa-smp-budi-utomo-gadingmangu-di-popkab-jombang-2025":
    {
      id: 3,
      judul:
        "Prestasi Gemilang Siswa SMP Budi Utomo Gadingmangu di POPKAB Jombang 2025",
      ringkasan:
        "Siswa SMP Budi Utomo Gadingmangu menorehkan prestasi membanggakan dalam Pekan Olahraga Pelajar Kabupaten Jombang 2025.",
      gambar: "/logo_ppm.svg",
      tanggal: "2025-11-06",
      kategori: "Olahraga",
      penulis: "Admin PPPM",
      views: 156,
      kontenLengkap: `
      <h2>Berbagai Medali dari POPKAB 2025</h2>
      <p>Kontingen SMP Budi Utomo Gadingmangu berhasil meraih total 15 medali dalam Pekan Olahraga Pelajar Kabupaten (POPKAB) Jombang 2025 yang berlangsung pada 1-5 November 2025 di berbagai venue di Kabupaten Jombang.</p>
      
      <p>Prestasi gemilang ini terdiri dari 5 medali emas, 6 medali perak, dan 4 medali perunggu dari berbagai cabang olahraga yang dipertandingkan.</p>
      
      <h3>Rincian Perolehan Medali</h3>
      <p><strong>Medali Emas:</strong></p>
      <ul>
        <li>Atletik - Lari 100m Putra (Ahmad Fadhil)</li>
        <li>Renang - 50m Gaya Bebas Putri (Nabila Putri)</li>
        <li>Bulu Tangkis - Tunggal Putra (Rizky Pratama)</li>
        <li>Taekwondo - Poomsae Putri (Zahra Amelia)</li>
        <li>Catur - Rapid Putra (Dimas Aditya)</li>
      </ul>
      
      <p><strong>Medali Perak:</strong></p>
      <ul>
        <li>Atletik - Lompat Jauh Putri</li>
        <li>Renang - 100m Gaya Punggung Putra</li>
        <li>Bulu Tangkis - Ganda Campuran</li>
        <li>Taekwondo - Kyorugi Putra</li>
        <li>Pencak Silat - Tanding Putri</li>
        <li>Catur - Blitz Putri</li>
      </ul>
      
      <blockquote>
        <p>"Ini adalah hasil kerja keras seluruh atlet dan pelatih. Kami telah mempersiapkan diri dengan baik sejak 6 bulan yang lalu. Terima kasih atas dukungan sekolah dan orang tua yang luar biasa." - Pak Agus Salim, Koordinator Pembina Olahraga</p>
      </blockquote>
      
      <h3>Program Pembinaan Berkelanjutan</h3>
      <p>Kepala SMP Budi Utomo Gadingmangu, Bapak Drs. H. Mahmud, M.Pd., menyatakan komitmen sekolah untuk terus mengembangkan potensi siswa di bidang olahraga. "Kami akan terus meningkatkan fasilitas dan program pembinaan olahraga. Prestasi ini membuktikan bahwa dengan pembinaan yang tepat, siswa kami mampu bersaing di level yang lebih tinggi," ujarnya.</p>
      
      <p>Sekolah berencana mengirimkan para juara untuk mengikuti pemusatan latihan persiapan menghadapi POPDA (Pekan Olahraga Pelajar Daerah) tingkat provinsi yang akan diselenggarakan tahun depan.</p>
    `,
      tags: ["Olahraga", "POPKAB", "Prestasi", "Kompetisi"],
    },
  "smp-budi-utomo-gadingmangu-raih-juara-1-a3f-futsal-student-competition-2025":
    {
      id: 4,
      judul:
        "SMP Budi Utomo Gadingmangu Raih Juara 1 A3F Futsal Student Competition 2025",
      ringkasan:
        "Tim futsal SMP Budi Utomo Gadingmangu sukses menjuarai A3F Futsal Student Competition 2025 setelah mengalahkan tim-tim tangguh.",
      gambar: "/logo_ppm.svg",
      tanggal: "2025-10-06",
      kategori: "Olahraga",
      penulis: "Admin PPPM",
      views: 198,
      kontenLengkap: `
      <h2>Juara A3F Futsal Student Competition 2025</h2>
      <p>Tim futsal SMP Budi Utomo Gadingmangu berhasil menjuarai A3F (Ayo Aku Asik) Futsal Student Competition 2025 yang diselenggarakan di GOR Futsal Jombang pada tanggal 1-5 Oktober 2025. Kompetisi ini diikuti oleh 32 tim SMP terbaik dari berbagai daerah di Jawa Timur.</p>
      
      <p>Dalam pertandingan final yang berlangsung dramatis, tim SMP Budi Utomo Gadingmangu berhasil mengalahkan SMP Negeri 1 Mojokerto dengan skor 4-3 setelah melewati babak adu penalti yang menegangkan.</p>
      
      <h3>Perjalanan Menuju Final</h3>
      <p>Tim yang diasuh oleh Coach Hendra Wijaya ini menunjukkan konsistensi luar biasa sejak babak penyisihan. Berikut adalah rekam jejak perjalanan tim menuju gelar juara:</p>
      
      <ul>
        <li><strong>Babak Penyisihan Grup A:</strong>
          <ul>
            <li>vs SMP 5 Surabaya: Menang 6-2</li>
            <li>vs SMP 3 Gresik: Menang 5-1</li>
            <li>vs SMP 2 Sidoarjo: Menang 4-2</li>
          </ul>
        </li>
        <li><strong>16 Besar:</strong> vs SMP 4 Malang: Menang 3-1</li>
        <li><strong>Perempat Final:</strong> vs SMP 1 Pasuruan: Menang 5-3</li>
        <li><strong>Semi Final:</strong> vs SMP 2 Kediri: Menang 3-2</li>
        <li><strong>Final:</strong> vs SMP 1 Mojokerto: Menang 4-3 (adu penalti)</li>
      </ul>
      
      <blockquote>
        <p>"Ini adalah hasil kerja keras anak-anak selama 8 bulan latihan. Mereka menunjukkan mental juara dan tidak pernah menyerah meskipun menghadapi tim-tim yang sangat kuat. Saya bangga dengan mereka semua." - Coach Hendra Wijaya</p>
      </blockquote>
      
      <h3>Pemain Terbaik</h3>
      <p>Beberapa pemain SMP Budi Utomo Gadingmangu meraih penghargaan individu:</p>
      <ul>
        <li><strong>Best Player:</strong> Rizal Fauzi (Gelandang)</li>
        <li><strong>Top Scorer:</strong> Farhan Maulana (12 gol)</li>
        <li><strong>Best Goalkeeper:</strong> Dani Kurniawan</li>
      </ul>
      
      <h3>Hadiah dan Penghargaan</h3>
      <p>Sebagai juara pertama, tim SMP Budi Utomo Gadingmangu membawa pulang trofi bergilir, medali emas untuk setiap pemain, uang pembinaan sebesar Rp 10.000.000, dan tiket untuk mengikuti turnamen futsal pelajar tingkat nasional di Jakarta pada Desember 2025.</p>
      
      <p>Kepala Sekolah menyampaikan apresiasi tinggi dan berjanji akan terus mendukung pengembangan bakat olahraga siswa, termasuk dengan memperbaiki fasilitas lapangan futsal sekolah.</p>
    `,
      tags: ["Futsal", "Olahraga", "Juara", "Kompetisi"],
    },
  "kegiatan-tahfidz-ramadhan-menghafal-alquran-di-bulan-penuh-berkah": {
    id: 5,
    judul: "Kegiatan Tahfidz Ramadhan: Menghafal Al-Quran di Bulan Penuh Berkah",
    ringkasan:
      "Santri Pondok Pesantren Baitul Makmur mengikuti program intensif tahfidz selama bulan Ramadhan dengan target hafalan 1 juz.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-03-15",
    kategori: "Kegiatan",
    penulis: "Admin PPPM",
    views: 312,
    kontenLengkap: `
      <h2>Program Tahfidz Intensif Ramadhan 1446 H</h2>
      <p>Pondok Pesantren Baitul Makmur menyelenggarakan program tahfidz intensif selama bulan Ramadhan 1446 H dengan target minimal santri mampu menghafal 1 juz (30 halaman) Al-Quran. Program ini diikuti oleh seluruh santri dari tingkat SMP hingga SMA.</p>
<p>Program yang berlangsung selama 30 hari ini dirancang khusus untuk memaksimalkan momen bulan penuh berkah dalam meningkatkan kualitas hafalan Al-Quran santri.</p>
      
      <h3>Jadwal dan Metode Pembelajaran</h3>
      <p>Program tahfidz intensif ini dilaksanakan dengan jadwal sebagai berikut:</p>
      <ul>
        <li><strong>Ba'da Subuh (05.00-06.30):</strong> Muroja'ah hafalan lama dan setoran hafalan baru</li>
        <li><strong>Ba'da Dzuhur (13.00-14.30):</strong> Talaqqi dan tasmi' dengan ustadz/ustadzah</li>
        <li><strong>Ba'da Ashar (16.00-17.30):</strong> Tahsin dan perbaikan bacaan</li>
        <li><strong>Ba'da Tarawih (21.00-22.00):</strong> Muroja'ah mandiri sebelum tidur</li>
      </ul>
      
      <p>Metode yang digunakan adalah kombinasi antara metode Tikrar (pengulangan), Talaqqi (setoran langsung kepada ustadz), dan Tasmi' (simakan hafalan).</p>
      
      <blockquote>
        <p>"Ramadhan adalah momentum terbaik untuk mendekatkan diri kepada Al-Quran. Kami melihat semangat luar biasa dari santri dalam menghafal. Banyak yang bahkan melampaui target 1 juz yang telah ditetapkan." - Ustadz Ahmad Zainuddin, M.Pd.I, Koordinator Program Tahfidz</p>
      </blockquote>
      
      <h3>Pencapaian Luar Biasa</h3>
      <p>Hingga pertengahan Ramadhan, pencapaian program tahfidz intensif sangat menggembirakan:</p>
      <ul>
        <li>95% santri telah menghafal minimal 15 halaman</li>
        <li>65% santri telah menyelesaikan target 1 juz</li>
        <li>30 santri berhasil menghafal lebih dari 1 juz</li>
        <li>5 santri tercepat berhasil menghafal 2 juz</li>
      </ul>
      
      <h3>Dukungan dan Fasilitas</h3>
      <p>Untuk mendukung kelancaran program, pesantren menyediakan:</p>
      <ul>
        <li>15 ustadz/ustadzah tahfidz bersertifikat</li>
        <li>Mushaf khusus untuk tahfidz dengan panduan tajwid</li>
        <li>Ruang tahfidz ber-AC yang nyaman</li>
        <li>Sistem reward dan motivasi bagi santri berprestasi</li>
        <li>Konsultasi personal dengan ustadz pembimbing</li>
      </ul>
      
      <h3>Testimoni Santri</h3>
      <p><em>"Saya sangat bersyukur bisa mengikuti program ini. Awalnya saya ragu bisa menghafal 1 juz dalam sebulan, tapi dengan bimbingan ustadz dan semangat teman-teman, Alhamdulillah saya sudah menghafal 1.5 juz. Terima kasih Pondok Pesantren Baitul Makmur!" - Fatimah Azzahra, Santri Kelas XI</em></p>
      
      <h3>Wisuda Tahfidz</h3>
      <p>Program akan diakhiri dengan acara Wisuda Tahfidz pada malam 27 Ramadhan, di mana santri yang berhasil menyelesaikan target akan mendapatkan sertifikat dan penghargaan. Santri dengan hafalan terbaik akan mendapatkan hadiah umrah dari donatur pesantren.</p>
      
      <p>Semoga program tahfidz intensif Ramadhan ini menjadi awal bagi santri untuk terus istiqomah dalam menghafal dan mengamalkan Al-Quran.</p>
    `,
    tags: ["Tahfidz", "Ramadhan", "Al-Quran", "Kegiatan", "Ibadah"],
  },
  "wisuda-santri-angkatan-2025-150-santri-berhasil-lulus": {
    id: 6,
    judul: "Wisuda Santri Angkatan 2025: 150 Santri Berhasil Lulus",
    ringkasan:
      "Sebanyak 150 santri dinyatakan lulus dan siap melanjutkan pendidikan ke jenjang yang lebih tinggi.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-06-20",
    kategori: "Wisuda",
    penulis: "Admin PPPM",
    views: 445,
    kontenLengkap: `
      <h2>Wisuda Akbar Santri Angkatan 2025</h2>
      <p>Pondok Pesantren Baitul Makmur menyelenggarakan acara Wisuda Santri Angkatan 2025 pada hari Sabtu, 20 Juni 2025, di Aula Utama Pesantren. Sebanyak 150 santri dari tingkat SMP dan SMA dinyatakan lulus dan siap melanjutkan pendidikan ke jenjang yang lebih tinggi.</p>
      
      <p>Acara yang berlangsung khidmat ini dihadiri oleh Bupati Jombang, Kepala Kantor Kementerian Agama Kabupaten Jombang, tokoh masyarakat, para wali santri, serta undangan lainnya.</p>
      
      <h3>Rincian Kelulusan</h3>
      <ul>
        <li><strong>Lulusan SMP:</strong> 80 santri</li>
        <li><strong>Lulusan SMA:</strong> 70 santri</li>
        <li><strong>Lulusan Terbaik SMP:</strong> Muhammad Fadhil Rahman (Nilai Rata-rata: 9.8)</li>
        <li><strong>Lulusan Terbaik SMA:</strong> Siti Nur Azizah (Nilai Rata-rata: 9.7)</li>
        <li><strong>Lulusan dengan Hafalan Terbanyak:</strong> Ahmad Zaki Mubarak (15 Juz)</li>
      </ul>
      
      <blockquote>
        <p>"Hari ini adalah hari yang membanggakan bagi kami. Santri-santri kami tidak hanya unggul dalam bidang akademik dan agama, tetapi juga memiliki karakter yang kuat dan siap berkontribusi untuk masyarakat." - KH. Abdul Wahid Hasyim, M.A., Pengasuh Pondok Pesantren Baitul Makmur</p>
      </blockquote>
      
      <h3>Sambutan Bupati Jombang</h3>
      <p>Dalam sambutannya, Bupati Jombang mengapresiasi prestasi yang diraih oleh Pondok Pesantren Baitul Makmur. "Pesantren ini telah membuktikan bahwa pendidikan agama dan akademik dapat berjalan beriringan. Lulusan-lulusan dari pesantren ini telah banyak yang sukses dan berkontribusi di berbagai bidang," ujarnya.</p>
      
      <p>Bupati juga menyampaikan komitmen pemerintah daerah untuk terus mendukung pengembangan pendidikan pesantren melalui berbagai program dan bantuan.</p>
      
      <h3>Prestasi Lulusan Tahun Ini</h3>
      <p>Para lulusan angkatan 2025 telah mencatatkan berbagai prestasi membanggakan selama masa pendidikan di pesantren:</p>
      <ul>
        <li>45 santri lolos seleksi SNBP dan SNBT ke PTN ternama</li>
        <li>25 santri mendapatkan beasiswa penuh untuk kuliah</li>
        <li>30 santri menjuarai berbagai kompetisi akademik dan non-akademik</li>
        <li>80% lulusan memiliki hafalan minimal 3 juz Al-Quran</li>
        <li>100% lulusan lulus ujian nasional dengan nilai di atas KKM</li>
      </ul>
      
      <h3>Pesan untuk Para Lulusan</h3>
      <p>Pengasuh pesantren memberikan pesan khusus kepada para lulusan: "Kalian adalah generasi penerus yang membawa nama baik pesantren. Jaga akhlak, tingkatkan ilmu, dan jangan pernah lupakan Al-Quran. Jadilah pribadi yang bermanfaat bagi agama, nusa, dan bangsa."</p>
      
      <h3>Agenda Ke Depan</h3>
      <p>Setelah wisuda, para lulusan akan mengikuti beberapa kegiatan penutup:</p>
      <ul>
        <li>Khataman Al-Quran Bersama (21 Juni 2025)</li>
        <li>Silaturahmi Alumni dan Wali Santri (22 Juni 2025)</li>
        <li>Pelepasan Santri dengan Do'a Bersama (23 Juni 2025)</li>
      </ul>
      
      <p>Pesantren juga akan membuka pendaftaran santri baru angkatan 2025/2026 mulai tanggal 1 Juli 2025. Informasi lebih lanjut dapat diakses melalui website atau datang langsung ke kantor pesantren.</p>
      
      <p><strong>Selamat kepada seluruh lulusan angkatan 2025! Semoga ilmu yang telah didapat bermanfaat dan berkah. Aamiin.</strong></p>
    `,
    tags: ["Wisuda", "Kelulusan", "Pendidikan", "Prestasi"],
  },
};

// Helper untuk format tanggal
function formatTanggal(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type BeritaDetail = {
  id: number;
  judul: string;
  ringkasan: string;
  gambar: string;
  tanggal: string;
  kategori: string;
  penulis: string;
  views: number;
  kontenLengkap: string;
  tags: string[];
};

export default function DetailBerita({ slug }: { slug: string }) {
  const berita = beritaLengkap[slug as keyof typeof beritaLengkap] as
    | BeritaDetail
    | undefined;

  const [views, setViews] = useState(berita?.views || 0);

  // Increment views saat halaman dimuat
  useEffect(() => {
    if (berita) {
      setViews((prev) => prev + 1);
    }
  }, [berita]);

  if (!berita) {
    notFound();
  }

  // Share handlers
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = berita.judul;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link berhasil disalin!");
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section dengan Gambar */}
      <section className="pt-32 pb-8 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link href="/beranda#berita">
            <Button variant="ghost" className="mb-6 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Button>
          </Link>

          {/* Kategori Badge */}
          <div className="mb-4">
            <span className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-full">
              {berita.kategori}
            </span>
          </div>

          {/* Judul */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {berita.judul}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{berita.penulis}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatTanggal(berita.tanggal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{views} views</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
              Bagikan:
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("facebook")}
              className="gap-2"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("twitter")}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("whatsapp")}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare("copy")}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Salin Link
            </Button>
          </div>
        </div>
      </section>

      {/* Gambar Utama */}
      <section className="px-6 -mt-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900">
            <Image
              src={berita.gambar}
              alt={berita.judul}
              fill
              className="object-contain p-12"
              priority
            />
          </div>
        </div>
      </section>

      {/* Konten Artikel */}
      <section className="py-12 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8 md:p-12">
              {/* Ringkasan */}
              <div className="mb-8 p-6 bg-teal-50 dark:bg-teal-950 rounded-lg border-l-4 border-teal-500">
                <p className="text-lg italic text-gray-700 dark:text-gray-300">
                  {berita.ringkasan}
                </p>
              </div>

              {/* Konten Lengkap */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:text-teal-600 dark:prose-headings:text-teal-400
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                  prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                  prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic
                  prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900 prose-blockquote:py-2 prose-blockquote:my-6
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
                  prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                  prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: berita.kontenLengkap }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                  Tags:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {berita.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Link href="/beranda#berita">
              <Button variant="outline" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Berita Lainnya
              </Button>
            </Link>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              variant="outline"
            >
              Kembali ke Atas
            </Button>
          </div>
        </div>
      </section>

      {/* Berita Terkait */}
      <section className="py-12 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Berita Terkait
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(beritaLengkap)
              .filter(([key]) => key !== slug)
              .slice(0, 2)
              .map(([key, relatedBerita]) => (
                <Link key={key} href={`/berita/${key}`}>
                  <Card className="group hover:shadow-xl transition-all hover:scale-105">
                    <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900">
                      <Image
                        src={relatedBerita.gambar}
                        alt={relatedBerita.judul}
                        fill
                        className="object-contain p-8 group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        {relatedBerita.kategori}
                      </span>
                      <h4 className="font-bold mt-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {relatedBerita.judul}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {relatedBerita.ringkasan}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}