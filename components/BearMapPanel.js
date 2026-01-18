"use client";

import { useCallback, useMemo, useRef } from "react";
import BearMap3D from "@/components/BearMap3D";
import { URSUS_SATELLITE_STYLE } from "@/data/mapStyle";

export default function BearMapPanel({ bear }) {
  const mapRef = useRef(null);

  const initialView = useMemo(() => {
    return {
      center: bear.view.center,
      zoom: bear.view.zoom,
      pitch: bear.view.pitch ?? 45,
      bearing: bear.view.bearing ?? 0,
    };
  }, [bear]);

  const flyTo = useCallback((view) => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch ?? 45,
      bearing: view.bearing ?? 0,
      speed: 1.2,
      curve: 1.5,
      essential: true,
    });
  }, []);

  return (
    <section
      style={{
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.06)",
        padding: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>MAP</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{bear.name} — hotspots & sightings</div>
          <div style={{ opacity: 0.85, marginTop: 4 }}>
            Starts centered on this bear’s primary region. Use chips to jump around.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => flyTo(initialView)} style={chipStyle} type="button">
            Reset view
          </button>

          {bear.regions?.map((r) => (
            <button
              key={r.id}
              onClick={() => flyTo({ center: r.center, zoom: r.zoom })}
              style={chipStyle}
              type="button"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
        {/* Legend overlay */}
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 5,
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(11,18,32,0.62)",
            backdropFilter: "blur(10px)",
            fontSize: 12,
            lineHeight: 1.35,
            maxWidth: 260,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6, letterSpacing: 0.6 }}>Legend</div>

          <LegendRow color="#22c55e" label="Bear hotspots (clusters)" />
          <LegendRow color="#60a5fa" label="Black bear sightings" />
          <LegendRow color="#f59e0b" label="Brown/Grizzly sightings" />
          <LegendRow color="#e5e7eb" label="Polar bear sightings" />

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                width: 18,
                height: 0,
                borderTop: "2px solid rgba(255,255,255,0.55)",
                display: "inline-block",
              }}
            />
            <span>State boundaries</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 10,
                background: "rgba(250,204,21,0.25)",
                border: "1px solid rgba(253,224,71,0.85)",
                display: "inline-block",
              }}
            />
            <span>Habitat overlay</span>
          </div>
        </div>

        <BearMap3D
          styleJSON={URSUS_SATELLITE_STYLE}
          initialView={initialView}
          onReady={(map) => (mapRef.current = map)}
          showBears
          showHabitat
          showStateWires
          statesUrl="https://raw.githubusercontent.com/datasets/geo-boundaries-us-110m/master/states.geojson"
        />
      </div>
    </section>
  );
}

function LegendRow({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: "inline-block" }} />
      <span>{label}</span>
    </div>
  );
}

const chipStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "inherit",
  cursor: "pointer",
};
