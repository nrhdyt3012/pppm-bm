import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookiesStore = await cookies();
  const userProfileCookie = cookiesStore.get("user_profile");
  
  // Jika tidak ada cookie, redirect ke beranda (public page)
  if (!userProfileCookie) {
    redirect("/beranda");
  }

  const profile = JSON.parse(userProfileCookie.value);

  // Redirect berdasarkan role
  if (profile.role === "admin") {
    redirect("/admin");
  } else if (profile.role === "santri") {
    redirect("/santri/info");
  }

  // Fallback ke beranda (seharusnya tidak sampai sini)
  redirect("/beranda");
}