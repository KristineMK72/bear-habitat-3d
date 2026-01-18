// /components/BearCard.js
import Link from "next/link";

export default function BearCard({ bear }) {
  return (
    <Link href={`/bears/${bear.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        className="card"
        style={{
          padding: 18,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.8 }}>
          {bear.scientific}
        </div>

        <h3 style={{ margin: "6px 0 8px", fontSize: 22 }}>{bear.name}</h3>

        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.45 }}>
          {bear.shortBlurb}
        </p>

        <div style={{ height: 12 }} />

        <div style={{ fontSize: 13, opacity: 0.85 }}>
          <strong>Where:</strong> {bear.where.slice(0, 3).join(", ")}
          {bear.where.length > 3 ? "…" : ""}
        </div>
      </article>
    </Link>
  );
}
