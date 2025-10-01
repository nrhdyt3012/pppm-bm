import { Menu } from "@/validations/menu-validation";
import { useMemo } from "react";

export function usePricing(
  orderMenu: { menus: Menu; quantity: number }[] | null | undefined
) {
  const totalPrice = useMemo(() => {
    let total = 0;
    orderMenu?.forEach((item) => {
      total += item.menus.price * item.quantity;
    });
    return total;
  }, [orderMenu]);

  const tax = useMemo(() => {
    return Math.round(totalPrice * 0.12);
  }, [totalPrice]);

  const service = useMemo(() => {
    return Math.round(totalPrice * 0.05);
  }, [totalPrice]);

  const grandTotal = useMemo(() => {
    return totalPrice + tax + service;
  }, [totalPrice, tax, service]);

  return {
    totalPrice,
    tax,
    service,
    grandTotal,
  };
}
