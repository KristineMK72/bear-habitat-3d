// /app/bears/[slug]/page.tsx
import { BEARS, getBearBySlug } from "@/data/bears";
import BearPage from "@/components/BearPage";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return BEARS.map((b) => ({ slug: b.slug }));
}

export default function BearDetailPage({ params }: { params: { slug: string } }) {
  const bear = getBearBySlug(params.slug);
  if (!bear) return notFound();
  return <BearPage bear={bear} />;
}
