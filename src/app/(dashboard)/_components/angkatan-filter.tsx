"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { useAngkatanFilterStore } from "@/stores/angkatan-filter-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function AngkatanFilter() {
  const pathname = usePathname();
  const supabase = createClient();
  const { angkatan, setAngkatan } = useAngkatanFilterStore();

  // Hanya tampil di halaman dashboard utama
  const isDashboardPage = pathname === "/admin" || pathname === "/superadmin";

  const { data: angkatanList } = useQuery({
    queryKey: ["angkatan-list"],
    enabled: isDashboardPage,
    queryFn: async () => {
      const { data } = await supabase
        .from("siswa")
        .select("angkatan")
        .not("angkatan", "is", null);

      const unique = Array.from(
        new Set((data || []).map((s: any) => s.angkatan).filter(Boolean))
      ) as string[];

      return unique.sort((a, b) => b.localeCompare(a));
    },
  });

  if (!isDashboardPage) return null;

  return (
    <div className="flex items-center gap-4">
      <Select value={angkatan} onValueChange={setAngkatan}>
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="Semua Angkatan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Angkatan</SelectItem>
          {(angkatanList || []).map((a) => (
            <SelectItem key={a} value={a}>
              Angkatan {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}