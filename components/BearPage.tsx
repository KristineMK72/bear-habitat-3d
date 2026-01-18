// /components/BearPage.tsx
import type { Bear } from "@/data/bears";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        fontSize: 13,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {children}
    </span>
  );
}

export default function BearPage({ bear }: { bear: Bear }) {
  return (
    <main style={{ padding: "28px 16px" }}>
      <section style={{ maxWidth: 1050, margin: "0 auto" }}>
        <div className="kicker" style={{ opacity: 0.85 }}>
          Bear Species
        </div>

        <h1 style={{ fontSize: 44, margin: "8px 0 6px" }}>{bear.name}</h1>
        <div style={{ opacity: 0.85, marginBottom: 14 }}>
          <em>{bear.scientific}</em> — {bear.heroSubtitle}
        </div>

        <div
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            padding: 18,
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.95 }}>
            {bear.shortBlurb}
          </p>

          <div style={{ height: 14 }} />

          <div>
            <strong>Where you’ll find them:</strong>
            <div style={{ marginTop: 8 }}>
              {bear.where.map((w) => (
                <Pill key={w}>{w}</Pill>
              ))}
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div>
            <strong>Habitats:</strong>
            <div style={{ marginTop: 8 }}>
              {bear.habitat.map((h) => (
                <Pill key={h}>{h}</Pill>
              ))}
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div>
            <strong>Diet:</strong>
            <div style={{ marginTop: 8 }}>
              {bear.diet.map((d) => (
                <Pill key={d}>{d}</Pill>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          <article
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              padding: 18,
            }}
          >
            <h2 style={{ margin: "0 0 10px" }}>Fun facts</h2>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.95 }}>
              {bear.funFacts.map((f) => (
                <li key={f} style={{ marginBottom: 8, lineHeight: 1.5 }}>
                  {f}
                </li>
              ))}
            </ul>
          </article>

          <article
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              padding: 18,
            }}
          >
            <h2 style={{ margin: "0 0 10px" }}>Conservation</h2>
            <div style={{ marginBottom: 8, opacity: 0.95 }}>
              <strong>Status:</strong> {bear.conservation.status}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.95 }}>
              {bear.conservation.notes.map((n) => (
                <li key={n} style={{ marginBottom: 8, lineHeight: 1.5 }}>
                  {n}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <div style={{ height: 18 }} />

        {/* Next step: drop your BearMap3D here as a section */}
        {/* Example placeholder */}
        <section
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            padding: 18,
          }}
        >
          <h2 style={{ margin: "0 0 10px" }}>Map</h2>
          <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.55 }}>
            Next: embed your 3D map here, then swap datasets based on the bear’s
            slug (range GeoJSON + sightings).
          </p>
        </section>
      </section>
    </main>
  );
}
