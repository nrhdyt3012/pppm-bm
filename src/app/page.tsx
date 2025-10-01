"use client";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export default function Home() {
  const profile = useAuthStore((state) => state.profile);
  return (
    <div className="bg-muted flex justify-center items-center h-screen flex-col space-y-4">
      <h1 className="text-4xl font-semibold">Welcome {profile.name}</h1>
      <Link href={profile.role === "admin" ? "/admin" : "/order"}>
        <Button className="bg-teal-500 text-white hover:bg-teal-600">
          Access Dashboard
        </Button>
      </Link>
    </div>
  );
}
