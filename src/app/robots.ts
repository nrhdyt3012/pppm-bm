// src/app/robots.ts
// Letakkan file ini di: src/app/robots.ts

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://paudaba1buduran.my.id"; // TANPA www

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/beranda",
          "/profil",
          "/fasilitas",
          "/info-sekolah",
          "/ppdb",
          "/kontak",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/siswa",
          "/siswa/*",
          "/api/*",
          "/login",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}