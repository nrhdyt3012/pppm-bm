"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClientSupabase } from "@/lib/supabase/default";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Pencil, Trash2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { deleteOrder } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HEADER_TABLE_ORDER } from "@/constants/order-constant";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export default function OrderManagement() {
  const supabase = createClientSupabase();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();
  const profile = useAuthStore((state) => state.profile);

  const {
    data: orders,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("orders")
        .select(
          `
            id, order_id, customer_name, status, payment_token
            `,
          { count: "exact" }
        )
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at", { ascending: false });

      if (currentSearch) {
        query.or(
          `order_id.ilike.%${currentSearch}%,customer_name.ilike.%${currentSearch}%`
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Order data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const [deleteOrderState, deleteOrderAction, isPendingDelete] = useActionState(
    deleteOrder,
    INITIAL_STATE_ACTION
  );

  const handleDeleteOrder = (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) {
      return;
    }

    const formData = new FormData();
    formData.append("order_id", orderId);

    startTransition(() => {
      deleteOrderAction(formData);
    });
  };

  useEffect(() => {
    if (deleteOrderState?.status === "error") {
      toast.error("Hapus Tagihan Gagal", {
        description: deleteOrderState.errors?._form?.[0],
      });
    }

    if (deleteOrderState?.status === "success") {
      toast.success("Tagihan berhasil dihapus");
      refetchOrders();
    }
  }, [deleteOrderState]);

  useEffect(() => {
    const channel = supabase
      .channel("change-order")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          refetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalPages = useMemo(() => {
    return orders && orders.count !== null
      ? Math.ceil(orders.count / currentLimit)
      : 0;
  }, [orders]);

  const filteredData = useMemo(() => {
    return (orders?.data || []).map((order, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        order.order_id,
        order.customer_name,
        "-", // Table dihapus, diganti dengan placeholder
        <div
          key={order.id}
          className={cn("px-2 py-1 rounded-full text-white w-fit capitalize", {
            "bg-lime-600": order.status === "settled",
            "bg-sky-600": order.status === "process",
            "bg-amber-600": order.status === "reserved",
            "bg-red-600": order.status === "canceled",
          })}
        >
          {order.status}
        </div>,
        <DropdownAction
          key={`action-${order.id}`}
          menu={[
            {
              label: (
                <Link
                  href={`/order/${order.order_id}`}
                  className="flex items-center gap-2"
                >
                  <ScrollText />
                  Detail
                </Link>
              ),
              type: "link",
            },
            ...(profile.role === "admin" && order.status !== "settled"
              ? [
                  {
                    label: (
                      <Link
                        href={`/order/edit/${order.order_id}`}
                        className="flex items-center gap-2"
                      >
                        <Pencil />
                        Edit
                      </Link>
                    ),
                    type: "link" as const,
                  },
                  {
                    label: (
                      <span className="flex items-center gap-2">
                        <Trash2 className="text-red-400" />
                        Hapus
                      </span>
                    ),
                    variant: "destructive" as const,
                    action: () => handleDeleteOrder(order.order_id),
                  },
                ]
              : []),
          ]}
        />,
      ];
    });
  }, [orders, currentLimit, currentPage]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Tagihan Santri</h1>
      </div>

      <div className="flex gap-2 justify-between mb-4">
        <Input
          placeholder="Search..."
          className="max-w-64"
          onChange={(e) => handleChangeSearch(e.target.value)}
        />
        {profile.role === "admin" && (
          <Link href="/order/create">
            <Button variant="outline">Buat Tagihan</Button>
          </Link>
        )}
      </div>

      <DataTable
        header={HEADER_TABLE_ORDER}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
    </div>
  );
}
