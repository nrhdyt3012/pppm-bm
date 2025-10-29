"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  MapPin,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

export default function InfoSantri() {
  const profile = useAuthStore((state) => state.profile);

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
                src={profile.avatar_url}
                alt={profile.name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">
                {profile.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">
                ID Santri: {profile.id?.substring(0, 8).toUpperCase()}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm">
                  {profile.jenis_kelamin}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm capitalize">
                  {profile.role}
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
            <InfoItem icon={User} label="Nama Lengkap" value={profile.name} />
            <InfoItem
              icon={MapPin}
              label="Tempat Lahir"
              value={profile.tempat_lahir}
            />
            <InfoItem
              icon={Calendar}
              label="Tanggal Lahir"
              value={
                profile.tanggal_lahir
                  ? new Date(profile.tanggal_lahir).toLocaleDateString(
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

        {/* Data Pendidikan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-500" />
              Data Pendidikan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoItem
              icon={School}
              label="Universitas/Sekolah"
              value={profile.universitas}
            />
            <InfoItem
              icon={GraduationCap}
              label="Jurusan"
              value={profile.jurusan}
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
            <InfoItem icon={User} label="Nama Ayah" value={profile.nama_ayah} />
            <InfoItem
              icon={GraduationCap}
              label="Pekerjaan"
              value={profile.pekerjaan_ayah}
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
            <InfoItem icon={User} label="Nama Ibu" value={profile.nama_ibu} />
            <InfoItem
              icon={GraduationCap}
              label="Pekerjaan"
              value={profile.pekerjaan_ibu}
            />
          </CardContent>
        </Card>
      </div>

      {/* Informasi Tambahan */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Jika ada perubahan data atau informasi yang kurang tepat, silakan
            hubungi bagian administrasi pondok pesantren untuk melakukan
            pembaruan data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
