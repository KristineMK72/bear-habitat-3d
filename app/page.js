"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

const BearMap3D = dynamic(() => import("../components/BearMap3D"), {
  ssr: false,
});

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{
        borderRadius: 999,
        padding: "10px 14px",
        fontSize: 13,
        opacity: active ? 1 : 0.7,
        background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
      }}
      aria-pressed={active}
      type="button"
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [showBears, setShowBears] = useState(true);
  const [showStates, setShowStates] = useState(true);
  const [showHabitat, setShowHabitat] = useState(true);

  const stats = useMemo(() => {
    // Keep this as a display label; your build log showed 7360 at the time.
    // If you later want this to be dynamic, we can fetch it from the GeoJSON.
    return { points: 7360, scope: "USA-only" };
  }, []);

  return (
    <main>
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="brand">
            <div className="title">URSUS</div>
            <div className="subtitle">
              A Living Bear Habitat · clustered hotspots → species points as you zoom
            </div>
          </div>

          <div className="row">
            <span className="badge">GBIF sightings</span>
            <span className="badge">{stats.scope}</span>
            <span className="badge">{stats.points} points</span>
          </div>
        </div>

        {/* Controls */}
        <div className="row" style={{ marginBottom: 14 }}>
          <Pill active={showBears} onClick={() => setShowBears((v) => !v)}>
            {showBears ? "✓ Bears" : "Bears"}
          </Pill>

          <Pill active={showStates} onClick={() => setShowStates((v) => !v)}>
            {showStates ? "✓ State wires" : "State wires"}
          </Pill>

          <Pill active={showHabitat} onClick={() => setShowHabitat((v) => !v)}>
            {showHabitat ? "✓ Habitat overlay" : "Habitat overlay"}
          </Pill>
        </div>

        {/* Map */}
        <div className="card">
          <div className="stage">
            <BearMap3D showBears={showBears} showStates={showStates} showHabitat={showHabitat} />
          </div>
        </div>

        {/* Legend / help */}
        <div
          className="card"
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>How to read this map</div>

          <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
            <div>
              <b>Hotspots:</b> clusters show where observations concentrate. Tap a hotspot to zoom in.
            </div>
            <div style={{ marginTop: 6 }}>
              <b>Species colors (zoomed in):</b>{" "}
              <span style={{ color: "#00e5ff", fontWeight: 800 }}>Black bear</span>,{" "}
              <span style={{ color: "#ff3b3b", fontWeight: 800 }}>Brown bear</span>,{" "}
              <span style={{ color: "white", fontWeight: 800 }}>Polar bear</span>.
            </div>
            <div style={{ marginTop: 6 }}>
              <b>Tip:</b> On desktop you can hover individual points for details.
            </div>
          </div>
        </div>

        {/* Credits */}
        <footer
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.72)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <div>
            <strong>Cartography & Visualization:</strong>{" "}
            <span style={{ color: "white" }}>Kristine Kahler</span>
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Data:</strong> GBIF Occurrence Records (crowdsourced wildlife observations).
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Map rendering:</strong> MapLibre GL JS · Basemap tiles (demo).
          </div>

          <div style={{ marginTop: 10, opacity: 0.6 }}>
            © {new Date().getFullYear()} · URSUS — A Living Bear Habitat
          </div>
        </footer>
      </div>
    </main>
  );
}
