// src/app/(dashboard)/santri/payment/layout.tsx
import { ReactNode } from "react";

type PaymentLayoutProps = {
  children: ReactNode;
};

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {children}
    </div>
  );
}
