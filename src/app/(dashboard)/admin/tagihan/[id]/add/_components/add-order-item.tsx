"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FILTER_MENU } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import CardMenu from "./card-menu";
import LoadingCardMenu from "./loading-card-menu";
import CartSection from "./cart";
import { startTransition, useActionState, useState } from "react";
import { Cart } from "@/types/order";
import { Menu } from "@/validations/menu-validation";
import { addOrderItem } from "../../../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";

export default function AddOrderItem({ id }: { id: string }) {
  const supabase = createClient();
  const {
    currentSearch,
    currentFilter,
    handleChangeSearch,
    handleChangeFilter,
  } = useDataTable();

  const { data: menus, isLoading: isLoadingMenu } = useQuery({
    queryKey: ["menus", currentSearch, currentFilter],
    queryFn: async () => {
      const query = supabase
        .from("menus")
        .select("*", { count: "exact" })
        .order("created_at")
        .eq("is_available", true)
        .ilike("name", `%${currentSearch}%`);

      if (currentFilter) {
        query.eq("category", currentFilter);
      }

      const result = await query;

      if (result.error)
        toast.error("Get Menu data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const result = await supabase
        .from("orders")
        .select("id, customer_name, status, payment_token, tables (name, id)")
        .eq("order_id", id)
        .single();

      if (result.error)
        toast.error("Get Order data failed", {
          description: result.error.message,
        });

      return result.data;
    },
    enabled: !!id,
  });

  const [carts, setCarts] = useState<Cart[]>([]);

  const handleAddToCart = (menu: Menu, action: "increment" | "decrement") => {
    const existingItem = carts.find((item) => item.menu_id === menu.id);
    const priceAfterDiscount =
      menu.price - menu.price * ((menu.discount || 0) / 100);

    if (existingItem) {
      if (action === "decrement") {
        if (existingItem.quantity > 1) {
          setCarts(
            carts.map((item) =>
              item.menu_id === menu.id
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                    nominal: item.nominal - priceAfterDiscount,
                  }
                : item
            )
          );
        } else {
          setCarts(carts.filter((item) => item.menu_id !== menu.id));
        }
      } else {
        setCarts(
          carts.map((item) =>
            item.menu_id === menu.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  nominal: item.nominal + priceAfterDiscount,
                }
              : item
          )
        );
      }
    } else {
      setCarts([
        ...carts,
        {
          menu_id: menu.id,
          quantity: 1,
          nominal: priceAfterDiscount,
          notes: "",
          menu,
        },
      ]);
    }
  };

  const [addOrderItemState, addOrderItemAction, isPendingAddOrderItem] =
    useActionState(addOrderItem, INITIAL_STATE_ACTION);

  const handleOrder = async () => {
    const data = {
      order_id: id,
      items: carts.map((item) => ({
        order_id: order?.id ?? "",
        ...item,
        status: "pending",
      })),
    };

    startTransition(() => {
      addOrderItemAction(data);
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      <div className="space-y-4 lg:w-2/3">
        <div className="flex flex-col items-center justify-between gap-4 w-full lg:flex-row">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <h1 className="text-2xl font-bold">Menu</h1>
            <div className="flex gap-2">
              {FILTER_MENU.map((item) => (
                <Button
                  key={item.value}
                  onClick={() => handleChangeFilter(item.value)}
                  variant={currentFilter === item.value ? "default" : "outline"}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <Input
            placeholder="Search..."
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
        </div>
        {isLoadingMenu && !menus ? (
          <LoadingCardMenu />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 w-full gap-4">
            {menus?.data?.map((menu) => (
              <CardMenu
                menu={menu}
                key={`menu-${menu.id}`}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        {!isLoadingMenu && menus?.data?.length === 0 && (
          <div className="text-center w-full">Menu not found</div>
        )}
      </div>
      <div className="lg:w-1/3">
        <CartSection
          order={order}
          carts={carts}
          setCarts={setCarts}
          onAddToCart={handleAddToCart}
          isLoading={isPendingAddOrderItem}
          onOrder={handleOrder}
        />
      </div>
    </div>
  );
}
