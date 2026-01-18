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
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {bear.name} — hotspots & sightings
          </div>
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

      <BearMap3D
        styleJSON={URSUS_SATELLITE_STYLE}
        initialView={initialView}
        onReady={(map) => (mapRef.current = map)}
        showBears={true}
        showHabitat={true}
        showStateWires={true}
        statesUrl="https://raw.githubusercontent.com/datasets/geo-boundaries-us-110m/master/states.geojson"
      />
    </section>
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
