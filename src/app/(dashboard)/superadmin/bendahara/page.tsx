// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(dashboard)/superadmin/bendahara/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
import BendaharaManagement from "./_components/bendahara";

export const metadata = {
  title: "PAUD BA 1 Buduran | Kelola Bendahara",
  icons: { icon: "/favicon.ico" },
};

export default function BendaharaPage() {
  return <BendaharaManagement />;
}