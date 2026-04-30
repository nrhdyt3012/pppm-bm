"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { User, Calendar, MapPin, Phone, BookOpen, Loader2 } from "lucide-react";

export default function InfoSiswa() {
  const profile = useAuthStore((state) => state.profile);
  const supabase = createClient();

  const { data: siswaData, isLoading } = useQuery({
    queryKey: ["siswa-detail-self", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siswa")
        .select("*")
        .eq("id", profile.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
      <Icon className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Info Siswa</h1>
        <p className="text-muted-foreground text-sm">PAUD Aisyiyah Bustanul Athfal 1 Buduran</p>
      </div>

      {/* Header profil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-28 h-28 border-4 border-green-500">
              <AvatarImage src={siswaData?.avatarUrl || profile.avatar_url} alt={siswaData?.namaSiswa} className="object-cover" />
              <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                {(siswaData?.namaSiswa || profile.name)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold">{siswaData?.namasiswa || profile.name}</h2>
              {siswaData?.NIS && (
                <p className="text-muted-foreground text-sm">NIS: {siswaData.nis}</p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                {siswaData?.kelas && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-medium">
                    {siswaData.kelas}
                  </span>
                )}
                {siswaData?.angkatan && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm">
                    Angkatan {siswaData.angkatan}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  siswaData?.status === "aktif"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {siswaData?.status || "Aktif"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Siswa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-green-600" />
              Data Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={User} label="Nama Lengkap" value={siswaData?.namasiswa} />
            <InfoItem icon={BookOpen} label="NIS" value={siswaData?.nis} />
            <InfoItem icon={BookOpen} label="Kelas" value={siswaData?.kelas} />
            <InfoItem icon={BookOpen} label="Angkatan" value={siswaData?.angkatan} />
            <InfoItem icon={MapPin} label="Tempat Lahir" value={siswaData?.tempatlahir} />
            <InfoItem
              icon={Calendar}
              label="Tanggal Lahir"
              value={siswaData?.tanggallahir
                ? new Date(siswaData.tanggallahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                : null}
            />
          </CardContent>
        </Card>

        {/* Data Wali */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-green-600" />
              Data Wali Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem icon={User} label="Nama Wali" value={siswaData?.namawali} />
            <InfoItem icon={Phone} label="No. WhatsApp" value={siswaData?.nowa} />
          </CardContent>
        </Card>

        {/* Catatan */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Jika ada data yang kurang tepat atau perlu diperbarui, silakan hubungi admin/bendahara PAUD Aisyiyah Bustanul Athfal 1 Buduran untuk melakukan perubahan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}