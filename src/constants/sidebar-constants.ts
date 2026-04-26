// src/constants/sidebar-constants.ts
import {
  FileText,
  LayoutDashboard,
  Receipt,
  Users,
  UserCircle,
  History,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const SIDEBAR_MENU_LIST = {
  admin: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Rekapan Pembayaran",
      url: "/admin/rekapan-pembayaran",
      icon: CheckCircle,
    },
    {
      title: "Rekapan Tunggakan",
      url: "/admin/rekapan-tunggakan",
      icon: AlertCircle,
    },
    {
      title: "Tagihan Siswa",
      url: "/admin/tagihan",
      icon: Receipt,
    },
    {
      title: "Master Tagihan",
      url: "/admin/menu",
      icon: FileText,
    },
    {
      title: "Data Siswa",
      url: "/admin/user",
      icon: Users,
    },
  ],
  siswa: [
    {
      title: "Info Siswa",
      url: "/siswa/info",
      icon: UserCircle,
    },
    {
      title: "Tagihan",
      url: "/siswa/tagihan",
      icon: Receipt,
    },
    {
      title: "Riwayat Pembayaran",
      url: "/siswa/riwayat",
      icon: History,
    },
  ],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;