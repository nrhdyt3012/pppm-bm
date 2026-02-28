import DetailBerita from "./_components/detail-berita";

// Metadata dinamis
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: `Berita | PP Baitul Makmur`,
    description: "Detail berita Pondok Pesantren Baitul Makmur",
    icons: {
      icon: "/logo_ppm.svg",
    },
  };
}

export default function BeritaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <DetailBerita slug={params.slug} />;
}