import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookiesStore = await cookies();
  const userProfileCookie = cookiesStore.get("user_profile");
  
  console.log("🍪 Cookie user_profile:", userProfileCookie?.value);

  let profile = { role: null };
  
  try {
    if (userProfileCookie?.value) {
      profile = JSON.parse(userProfileCookie.value);
    }
  } catch (error) {
    console.error("Error parsing user_profile cookie:", error);
  }

  console.log("👤 Parsed profile:", profile);

  // Redirect berdasarkan role
  if (profile.role === "admin") {
    redirect("/admin");
  } else if (profile.role === "santri") {
    redirect("/santri/info");
  }

  // Fallback jika tidak ada role
  redirect("/beranda");
}