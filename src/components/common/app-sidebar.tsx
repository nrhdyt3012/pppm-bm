"use client";

// src/components/common/app-sidebar.tsx

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
  Receipt,
  Activity,
  ShieldCheck,
  Crown,
  MoreHorizontal,
  KeyRound,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Menu definitions ──────────────────────────────────────────────────────────

const ADMIN_MENU = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Rekapan Pembayaran", url: "/admin/rekapan-pembayaran", icon: Receipt },
  { title: "Rekapan Tunggakan", url: "/admin/rekapan-tunggakan", icon: AlertCircle },
  { title: "Master Tagihan", url: "/admin/menu", icon: ClipboardList },
  { title: "Tagihan Siswa", url: "/admin/tagihan", icon: FileText },
  { title: "Data Siswa", url: "/admin/user", icon: Users },
  { title: "Changelog", url: "/admin/changelog", icon: Activity },
];

const SUPERADMIN_MENU = [
  { title: "Dashboard Admin", url: "/admin", icon: LayoutDashboard },
  { title: "Rekapan Pembayaran", url: "/admin/rekapan-pembayaran", icon: Receipt },
  { title: "Rekapan Tunggakan", url: "/admin/rekapan-tunggakan", icon: AlertCircle },
  { title: "Master Tagihan", url: "/admin/menu", icon: ClipboardList },
  { title: "Tagihan Siswa", url: "/admin/tagihan", icon: FileText },
  { title: "Data Siswa", url: "/admin/user", icon: Users },
  { title: "Changelog", url: "/admin/changelog", icon: Activity },
];

const SUPERADMIN_EXCLUSIVE_MENU = [
  { title: "Kelola Bendahara", url: "/superadmin/bendahara", icon: ShieldCheck },
];

const SISWA_MENU = [
  { title: "Info Siswa", url: "/siswa/info", icon: Users },
  { title: "Tagihan", url: "/siswa/tagihan", icon: FileText },
  { title: "Riwayat Pembayaran", url: "/siswa/riwayat", icon: Activity },
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

  const handleGantiPassword = () => {
    router.push("/ganti-password");
  };

  const isSuperadmin = profile?.role === "superadmin";
  const isAdmin = profile?.role === "admin";
  const isSiswa = profile?.role === "siswa";

  const mainMenu = isSiswa
    ? SISWA_MENU
    : isSuperadmin
    ? SUPERADMIN_MENU
    : ADMIN_MENU;

  const roleLabel = isSuperadmin
    ? "Superadmin"
    : isAdmin
    ? "Admin"
    : "Wali Siswa";

  const roleColor = isSuperadmin
    ? "text-yellow-600 dark:text-yellow-400"
    : isAdmin
    ? "text-green-600 dark:text-green-400"
    : "text-blue-600 dark:text-blue-400";

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href={
                  isSuperadmin
                    ? "/superadmin"
                    : isAdmin
                    ? "/admin"
                    : "/siswa/info"
                }
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-semibold truncate">KB/TK ABA 1 BUDURAN</span>
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

      {/* Content */}
      <SidebarContent>
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

      {/* Footer: nama, role, titik 3 */}
      <SidebarFooter className="border-t p-2">
        <div className="flex items-center gap-2 px-1 py-1.5">
          {/* Avatar inisial */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
              isSuperadmin
                ? "bg-yellow-500"
                : isAdmin
                ? "bg-green-600"
                : "bg-blue-500"
            )}
          >
            {(profile?.name || "?").charAt(0).toUpperCase()}
          </div>

          {/* Nama & Role */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">
              {profile?.name || "Pengguna"}
            </p>
            <p className={cn("text-xs font-medium leading-tight", roleColor)}>
              {roleLabel}
            </p>
          </div>

          {/* Tombol titik 3 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Menu pengguna"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-48 mb-1">
              <DropdownMenuItem
                onClick={handleGantiPassword}
                className="cursor-pointer gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Ganti Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}