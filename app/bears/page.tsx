// /app/bears/page.tsx
import { BEARS } from "@/data/bears";
import BearCard from "@/components/BearCard";

export const metadata = {
  title: "Bears of the USA",
  description: "Species pages, ranges, habitat, and sightings for U.S. bears.",
};

export default function BearsIndexPage() {
  return (
    <main style={{ padding: "28px 16px" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="kicker" style={{ opacity: 0.85 }}>
          Wildlife Atlas
        </div>
        <h1 style={{ fontSize: 44, margin: "8px 0 10px" }}>
          Bears of the United States
        </h1>
        <p style={{ maxWidth: 850, opacity: 0.9, lineHeight: 1.55 }}>
          Explore each bear species with range, habitat, conservation notes, and
          (soon) interactive sightings + hotspots.
        </p>

        <div style={{ height: 18 }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {BEARS.map((bear) => (
            <BearCard key={bear.slug} bear={bear} />
          ))}
        </div>
      </section>
    </main>
  );
}
