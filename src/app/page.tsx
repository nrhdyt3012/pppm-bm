import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookiesStore = await cookies();
  const profile = JSON.parse(cookiesStore.get("user_profile")?.value ?? "{}");

  // Redirect berdasarkan role
  if (profile.role === "admin") {
    redirect("/admin");
  } else if (profile.role === "kitchen" || profile.role === "cashier") {
    redirect("/order");
  }

  // Fallback jika tidak ada role
  redirect("/beranda");
}
