import EditOrder from "./_components/edit-order";

export const metadata = {
  title: "PPPM BM | Edit Tagihan",
  icons: {
    icon: "/logo_ppm.svg",
  },
};

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditOrder orderId={id} />;
}
