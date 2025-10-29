"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, startTransition, useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createOrderBatch } from "../../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { useRouter } from "next/navigation";

export default function CreateOrder() {
  const supabase = createClient();
  const router = useRouter();

  // State untuk form
  const [selectedSantri, setSelectedSantri] = useState<string[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [searchSantri, setSearchSantri] = useState("");

  // Fetch daftar santri
  const { data: santriList, isLoading: loadingSantri } = useQuery({
    queryKey: ["santri", searchSantri],
    queryFn: async () => {
      const query = supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("name");

      if (searchSantri) {
        query.ilike("name", `%${searchSantri}%`);
      }

      const result = await query;
      if (result.error) {
        toast.error("Gagal memuat data santri", {
          description: result.error.message,
        });
      }
      return result.data || [];
    },
  });

  // Fetch daftar menu/tagihan
  const { data: menuList, isLoading: loadingMenu } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const result = await supabase.from("menus").select("*").order("periode");

      if (result.error) {
        toast.error("Gagal memuat data tagihan", {
          description: result.error.message,
        });
      }
      return result.data || [];
    },
  });

  const [createOrderState, createOrderAction, isPendingCreateOrder] =
    useActionState(createOrderBatch, INITIAL_STATE_ACTION);

  const handleSelectAllSantri = (checked: boolean) => {
    if (checked) {
      setSelectedSantri(santriList?.map((s) => s.id) || []);
    } else {
      setSelectedSantri([]);
    }
  };

  const handleSelectSantri = (santriId: string, checked: boolean) => {
    if (checked) {
      setSelectedSantri([...selectedSantri, santriId]);
    } else {
      setSelectedSantri(selectedSantri.filter((id) => id !== santriId));
    }
  };

  const handleSubmit = () => {
    if (selectedSantri.length === 0) {
      toast.error("Pilih minimal 1 santri");
      return;
    }
    if (!selectedMenu) {
      toast.error("Pilih jenis tagihan");
      return;
    }

    const formData = new FormData();
    formData.append("santri_ids", JSON.stringify(selectedSantri));
    formData.append("menu_id", selectedMenu);

    startTransition(() => {
      createOrderAction(formData);
    });
  };

  useEffect(() => {
    if (createOrderState?.status === "error") {
      toast.error("Gagal membuat tagihan", {
        description: createOrderState.errors?._form?.[0],
      });
    }

    if (createOrderState?.status === "success") {
      toast.success("Tagihan berhasil dibuat");
      router.push("/order");
    }
  }, [createOrderState, router]);

  const selectedMenuData = menuList?.find(
    (m) => m.id.toString() === selectedMenu
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buat Tagihan Santri</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pilih Jenis Tagihan */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Jenis Tagihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMenu ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {menuList?.map((menu) => (
                  <div
                    key={menu.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMenu === menu.id.toString()
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedMenu(menu.id.toString())}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{menu.periode}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {menu.description}
                        </p>
                      </div>
                      <Checkbox
                        checked={selectedMenu === menu.id.toString()}
                        onCheckedChange={() =>
                          setSelectedMenu(menu.id.toString())
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Tagihan */}
        {selectedMenuData && (
          <Card>
            <CardHeader>
              <CardTitle>Detail Tagihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Periode:
                  </span>
                  <span className="font-medium">{selectedMenuData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Uang Makan:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.uang_makan || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Uang Asrama:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.asrama || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Kas Pondok:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.kas_pondok || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Shodaqoh Sukarela:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.shodaqoh_sukarela || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Jariyah SB:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.jariyah_sb || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Uang Tahunan:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.uang_tahunan || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Iuran Kampung:
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(selectedMenuData.iuran_kampung || 0)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-teal-600">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(
                        (selectedMenuData.uang_makan || 0) +
                          (selectedMenuData.asrama || 0) +
                          (selectedMenuData.kas_pondok || 0) +
                          (selectedMenuData.shodaqoh_sukarela || 0) +
                          (selectedMenuData.jariyah_sb || 0) +
                          (selectedMenuData.uang_tahunan || 0) +
                          (selectedMenuData.iuran_kampung || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pilih Santri */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Pilih Santri ({selectedSantri.length} dipilih)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari santri..."
                className="w-64"
                onChange={(e) => setSearchSantri(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSelectAllSantri(selectedSantri.length === 0)
                }
              >
                {selectedSantri.length === santriList?.length
                  ? "Batal Semua"
                  : "Pilih Semua"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingSantri ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {santriList?.map((santri) => (
                <div
                  key={santri.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Checkbox
                    checked={selectedSantri.includes(santri.id)}
                    onCheckedChange={(checked) =>
                      handleSelectSantri(santri.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <p className="font-medium">{santri.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {santri.jurusan || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/order")}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isPendingCreateOrder || selectedSantri.length === 0 || !selectedMenu
          }
          className="bg-teal-500 hover:bg-teal-600"
        >
          {isPendingCreateOrder ? (
            <Loader2 className="animate-spin" />
          ) : (
            `Buat Tagihan (${selectedSantri.length} Santri)`
          )}
        </Button>
      </div>
    </div>
  );
}
