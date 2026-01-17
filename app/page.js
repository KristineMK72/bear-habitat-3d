"use client";

import { useMemo, useState } from "react";
import BearMap3D from "@/components/BearMap3D";

export default function HomePage() {
  const [showBears, setShowBears] = useState(true);
  const [showStateWires, setShowStateWires] = useState(false);
  const [showHabitat, setShowHabitat] = useState(true);

  const badges = useMemo(
    () => [
      { text: "GBIF sightings" },
      { text: "USA-only" },
      { text: "7360 points" },
    ],
    []
  );

  return (
    <main className="container">
      <div className="header">
        <div className="brand">
          <div className="title">URSUS</div>
          <div className="subtitle">
            A Living Bear Habitat · clustered hotspots → species points as you zoom
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <ToggleChip checked={showBears} onClick={() => setShowBears((v) => !v)} label="Bears" />
            <ToggleChip
              checked={showStateWires}
              onClick={() => setShowStateWires((v) => !v)}
              label="State wires"
            />
            <ToggleChip
              checked={showHabitat}
              onClick={() => setShowHabitat((v) => !v)}
              label="Habitat overlay"
            />
          </div>
        </div>

        <div className="row">
          {badges.map((b, i) => (
            <span key={i} className="badge">
              {b.text}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <BearMap3D showBears={showBears} showHabitat={showHabitat} showStateWires={showStateWires} />
      </div>

      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>How to read this map</div>
        <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
          <b>Hotspots</b>: clusters show where observations concentrate. Click a hotspot to zoom in.
          <br />
          <b>Species colors</b>: black bear, brown/grizzly, and polar bear are colored differently.
          Zoom in to see more individual points.
          <br />
          <b>Tip</b>: click any point to view details (date, place, GBIF ID).
        </div>
      </div>
    </main>
  );
}

function ToggleChip({ checked, label, onClick }) {
  return (
    <button
      type="button"
      className="btn"
      onClick={onClick}
      aria-pressed={checked}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        background: checked ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ opacity: checked ? 1 : 0.85, fontWeight: 800 }}>
        {checked ? "✓ " : ""}
        {label}
      </span>
    </button>
  );
}
