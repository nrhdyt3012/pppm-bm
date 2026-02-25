// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { loginSchemaForm } from "@/validations/auth-validation";
// import { cookies } from "next/headers";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     console.log("🔵 Login API called with:", { email: body.email });

//     const validatedFields = loginSchemaForm.safeParse(body);

//     if (!validatedFields.success) {
//       console.log("❌ Validation failed:", validatedFields.error);
//       return NextResponse.json(
//         {
//           status: "error",
//           errors: validatedFields.error.flatten().fieldErrors,
//         },
//         { status: 400 }
//       );
//     }

//     const supabase = await createClient();

//     const {
//       error,
//       data: { user },
//     } = await supabase.auth.signInWithPassword(validatedFields.data);

//     if (error || !user) {
//       console.log("❌ Supabase auth error:", error);
//       return NextResponse.json(
//         {
//           status: "error",
//           errors: { _form: [error?.message || "Login gagal"] },
//         },
//         { status: 401 }
//       );
//     }

//     console.log("✅ User authenticated:", user.id);

//     // Cek role user
//     const { data: adminData } = await supabase
//       .from("admin")
//       .select("id, nama, jenis_kelamin, noHP")
//       .eq("id", user.id)
//       .maybeSingle();

//     const { data: santriData } = await supabase
//       .from("santri")
//       .select("id, nama, jenisKelamin, avatarUrl")
//       .eq("id", user.id)
//       .maybeSingle();

//     let profile = null;

//     if (adminData) {
//       profile = {
//         id: adminData.id,
//         name: adminData.nama,
//         role: "admin",
//         avatar_url: null,
//       };
//     } else if (santriData) {
//       profile = {
//         id: santriData.id,
//         name: santriData.nama,
//         role: "santri",
//         avatar_url: santriData.avatarUrl,
//       };
//     } else {
//       console.log("❌ Profile not found for user:", user.id);
//       return NextResponse.json(
//         {
//           status: "error",
//           errors: { _form: ["Profile tidak ditemukan"] },
//         },
//         { status: 404 }
//       );
//     }

//     console.log("✅ Profile found:", profile);

//     // Set cookie menggunakan Next.js cookies API
//     const cookieStore = await cookies();
//     cookieStore.set("user_profile", JSON.stringify(profile), {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7, // 7 hari
//       path: "/",
//     });

//     console.log("✅ Cookie set successfully");

//     return NextResponse.json({
//       status: "success",
//       data: { profile },
//     });

//   } catch (error: any) {
//     console.error("❌ Login error:", error);
//     return NextResponse.json(
//       {
//         status: "error",
//         errors: { _form: [error.message || "Terjadi kesalahan"] },
//       },
//       { status: 500 }
//     );
//   }
// }