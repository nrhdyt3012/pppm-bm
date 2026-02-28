import DetailBerita from "./_components/detail-berita";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return {
    title: `Berita | PP Baitul Makmur`,
    description: "Detail berita Pondok Pesantren Baitul Makmur",
    icons: {
      icon: "/logo_ppm.svg",
    },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DetailBerita slug={slug} />;
}