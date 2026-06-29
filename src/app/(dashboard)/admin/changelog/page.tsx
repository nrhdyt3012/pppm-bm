// src/app/(dashboard)/admin/changelog/page.tsx
// Akses: admin & superadmin

import ChangelogPage from "./_components/changelog";

export const metadata = {
  title: "KB/TK ABA 1 Buduran | Riwayat Aktivitas",
  icons: { icon: "/favicon.ico" },
};

export default function Changelog() {
  return <ChangelogPage />;
}
