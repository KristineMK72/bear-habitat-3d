import { BEARS, getBearBySlug } from "@/data/bears";
import BearPage from "@/components/BearPage";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return BEARS.map((b) => ({ slug: b.slug }));
}

export default async function BearDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const bear = getBearBySlug(slug);
  if (!bear) return notFound();

  return <BearPage bear={bear} />;
}
