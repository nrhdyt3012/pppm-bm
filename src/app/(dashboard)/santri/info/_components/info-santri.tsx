"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Briefcase,
} from "lucide-react";

export default function InfoSantri() {
  const profile = useAuthStore((state) => state.profile);
  const supabase = createClient();

  // Fetch data santri dari RPC function yang sama seperti di admin
  const { data: santriData, isLoading } = useQuery({
    queryKey: ["santri-detail", profile.id],
    queryFn: async () => {
      const result = await supabase.rpc("get_santri_with_details", {
        search_term: "",
        page_limit: 1,
        page_offset: 0,
      });

      if (result.error) {
        console.error("Error fetching santri data:", result.error);
        toast.error("Gagal memuat data santri", {
          description: result.error.message,
        });
        return null;
      }

      // Filter data sesuai user yang login
      const currentUserData = result.data?.find(
        (item: any) => item.id === profile.id
      );

      return currentUserData || null;
    },
  });

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | undefined;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Icon className="w-5 h-5 text-teal-500 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Info Santri</h1>
        <p className="text-muted-foreground">
          Informasi lengkap data pribadi santri
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-teal-500">
              <AvatarImage
                src={santriData?.avatar_url || profile.avatar_url}
                alt={santriData?.name || profile.name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">
                {(santriData?.name || profile.name)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold">
                {santriData?.name || profile.name}
              </h2>
              <p className="text-muted-foreground">
                ID Santri:{" "}
                {(santriData?.id || profile.id)?.substring(0, 8).toUpperCase()}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm">
                  {santriData?.jenisKelamin || "-"}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm capitalize">
                  Santri
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Pribadi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" />
              Data Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={santriData?.name}
            />
            <InfoItem
              icon={MapPin}
              label="Tempat Lahir"
              value={santriData?.tempatLahir}
            />
            <InfoItem
              icon={Calendar}
              label="Tanggal Lahir"
              value={
                santriData?.tanggalLahir
                  ? new Date(santriData.tanggalLahir).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "-"
              }
            />
          </CardContent>
        </Card>

        {/* Data Orang Tua - Ayah */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              Data Ayah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoItem
              icon={User}
              label="Nama Ayah"
              value={santriData?.namaAyah}
            />
            <InfoItem
              icon={Briefcase}
              label="Pekerjaan"
              value={santriData?.pekerjaanAyah}
            />
          </CardContent>
        </Card>

        {/* Data Orang Tua - Ibu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              Data Ibu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoItem
              icon={User}
              label="Nama Ibu"
              value={santriData?.namaIbu}
            />
            <InfoItem
              icon={Briefcase}
              label="Pekerjaan"
              value={santriData?.pekerjaanIbu}
            />
          </CardContent>
        </Card>

        {/* Catatan */}
        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Jika ada perubahan data atau informasi yang kurang tepat, silakan
              hubungi bagian administrasi pondok pesantren untuk melakukan
              pembaruan data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
