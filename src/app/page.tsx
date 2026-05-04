import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookiesStore = await cookies();
  const userProfileCookie = cookiesStore.get("user_profile");

  let profile = { role: null };

  try {
    if (userProfileCookie?.value) {
      profile = JSON.parse(userProfileCookie.value);
    }
  } catch (error) {
    console.error("Error parsing user_profile cookie:", error);
  }

  if (profile.role === "admin") {
    redirect("/admin");
  } else if (profile.role === "siswa") {
    redirect("/siswa/info");
  }

  redirect("/login");
}