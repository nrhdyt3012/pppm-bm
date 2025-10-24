import {
  Album,
  Armchair,
  FileText,
  LayoutDashboard,
  Receipt,
  SquareMenu,
  Users,
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
      url: "/order",
      icon: Receipt,
    },
    {
      title: "Buat Tagihan",
      url: "/admin/menu",
      icon: FileText,
    },
    // {
    //   title: "Table",
    //   url: "/admin/table",
    //   icon: Armchair,
    // },
    {
      title: "Data Santri",
      url: "/admin/user",
      icon: Users,
    },
  ],
  cashier: [
    {
      title: "Order",
      url: "/order",
      icon: Album,
    },
  ],
  kitchen: [
    {
      title: "Order",
      url: "/order",
      icon: Album,
    },
  ],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
