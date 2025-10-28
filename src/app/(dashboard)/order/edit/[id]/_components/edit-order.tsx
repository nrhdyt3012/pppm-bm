"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, startTransition, useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { updateOrderCustomer } from "../../../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditOrder({ orderId }: { orderId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [selectedSantri, setSelectedSantri] = useState<string>("");
  const [searchSantri, setSearchSantri] = useState("");

  // Fetch order data
  const { data: order, isLoading: loadingOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const result = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (result.error) {
        toast.error("Gagal memuat data tagihan", {
          description: result.error.message,
        });
        return null;
      }
      return result.data;
    },
  });

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

  const [updateOrderState, updateOrderAction, isPendingUpdate] = useActionState(
    updateOrderCustomer,
    INITIAL_STATE_ACTION
  );

  const handleSubmit = () => {
    if (!selectedSantri) {
      toast.error("Pilih santri terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("santri_id", selectedSantri);

    startTransition(() => {
      updateOrderAction(formData);
    });
  };

  useEffect(() => {
    if (updateOrderState?.status === "error") {
      toast.error("Gagal mengubah tagihan", {
        description: updateOrderState.errors?._form?.[0],
      });
    }

    if (updateOrderState?.status === "success") {
      toast.success("Tagihan berhasil diubah");
      router.push("/order");
    }
  }, [updateOrderState, router]);

  if (loadingOrder) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Tagihan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Tagihan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Order ID</Label>
            <Input value={order?.order_id || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Nama Santri Saat Ini</Label>
            <Input value={order?.customer_name || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={order?.status || ""}
              disabled
              className="capitalize"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Santri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cari Santri</Label>
            <Input
              placeholder="Ketik nama santri..."
              onChange={(e) => setSearchSantri(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Pilih Santri Baru</Label>
            <Select value={selectedSantri} onValueChange={setSelectedSantri}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih santri" />
              </SelectTrigger>
              <SelectContent>
                {loadingSantri ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  santriList?.map((santri) => (
                    <SelectItem key={santri.id} value={santri.id}>
                      {santri.name} - {santri.jurusan || "-"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/order")}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPendingUpdate || !selectedSantri}
          className="bg-teal-500 hover:bg-teal-600"
        >
          {isPendingUpdate ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </div>
  );
}
