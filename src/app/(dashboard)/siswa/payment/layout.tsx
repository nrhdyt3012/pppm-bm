import { ReactNode } from "react";

export default function PaymentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {children}
    </div>
  );
}