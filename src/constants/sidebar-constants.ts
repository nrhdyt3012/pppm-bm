import {
  FileText,
  LayoutDashboard,
  Receipt,
  Users,
  UserCircle,
  History,
} from "lucide-react";

export const SIDEBAR_MENU_LIST = {
  admin: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Tagihan Santri",
      url: "/admin/order",
      icon: Receipt,
    },
    {
      title: "Kelola Tagihan",
      url: "/admin/menu",
      icon: FileText,
    },
    {
      title: "Data Santri",
      url: "/admin/user",
      icon: Users,
    },
  ],
  santri: [
    {
      title: "Info Santri",
      url: "/santri/info",
      icon: UserCircle,
    },
    {
      title: "Tagihan SPP",
      url: "/santri/tagihan",
      icon: Receipt,
    },
    {
      title: "Riwayat Pembayaran",
      url: "/santri/riwayat",
      icon: History,
    },
  ],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
