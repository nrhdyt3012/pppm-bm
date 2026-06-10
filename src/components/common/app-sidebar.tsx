"use client";

// src/components/common/app-sidebar.tsx — VERSI BARU dengan superadmin menu
// Ganti seluruh file dengan ini.

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  AlertCircle,
  LogOut,
  Receipt,
  History,
  ShieldCheck,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

// ── Menu definitions ──────────────────────────────────────────────────────────

const ADMIN_MENU = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Data Siswa", url: "/admin/user", icon: Users },
  { title: "Master Tagihan", url: "/admin/menu", icon: ClipboardList },
  { title: "Tagihan Siswa", url: "/admin/tagihan", icon: FileText },
  {
    title: "Rekapan Pembayaran",
    url: "/admin/rekapan-pembayaran",
    icon: Receipt,
  },
  {
    title: "Rekapan Tunggakan",
    url: "/admin/rekapan-tunggakan",
    icon: AlertCircle,
  },
  { title: "Riwayat Aktivitas", url: "/admin/changelog", icon: History },
];

const SUPERADMIN_MENU = [
  // Superadmin punya akses ke semua menu admin…
  { title: "Dashboard Admin", url: "/admin", icon: LayoutDashboard },
  { title: "Data Siswa", url: "/admin/user", icon: Users },
  { title: "Master Tagihan", url: "/admin/menu", icon: ClipboardList },
  { title: "Tagihan Siswa", url: "/admin/tagihan", icon: FileText },
  {
    title: "Rekapan Pembayaran",
    url: "/admin/rekapan-pembayaran",
    icon: Receipt,
  },
  {
    title: "Rekapan Tunggakan",
    url: "/admin/rekapan-tunggakan",
    icon: AlertCircle,
  },
  { title: "Riwayat Aktivitas", url: "/admin/changelog", icon: History },
];

const SUPERADMIN_EXCLUSIVE_MENU = [
  { title: "Kelola Bendahara", url: "/superadmin/bendahara", icon: ShieldCheck },
];

const SISWA_MENU = [
  { title: "Info Siswa", url: "/siswa/info", icon: Users },
  { title: "Tagihan", url: "/siswa/tagihan", icon: FileText },
  { title: "Riwayat Pembayaran", url: "/siswa/riwayat", icon: History },
];

// ── Komponen Sidebar ──────────────────────────────────────────────────────────

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie =
      "user_profile=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Berhasil logout");
    router.push("/login");
  };

  const isSuperadmin = profile?.role === "superadmin";
  const isAdmin = profile?.role === "admin";
  const isSiswa = profile?.role === "siswa";

  // Tentukan menu utama
  const mainMenu = isSiswa
    ? SISWA_MENU
    : isSuperadmin
    ? SUPERADMIN_MENU
    : ADMIN_MENU;

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={isSuperadmin ? "/superadmin" : isAdmin ? "/admin" : "/siswa/info"}>
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-semibold truncate">PAUD ABA 1</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {isSuperadmin
                        ? "Superadmin"
                        : isAdmin
                        ? "Bendahara"
                        : "Wali Siswa"}
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Utama */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isSiswa ? "Menu Siswa" : "Menu Administrasi"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Eksklusif Superadmin */}
        {isSuperadmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-yellow-500" />
              Superadmin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SUPERADMIN_EXCLUSIVE_MENU.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: profil + logout */}
      <SidebarFooter className="border-t">
        <div className="p-2 space-y-2">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium truncate">
              {profile?.name || "Pengguna"}
            </p>
            <p
              className={cn(
                "text-xs font-medium",
                isSuperadmin
                  ? "text-yellow-600 dark:text-yellow-400"
                  : isAdmin
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400"
              )}
            >
              {isSuperadmin ? "Superadmin" : isAdmin ? "Bendahara" : "Wali Siswa"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}