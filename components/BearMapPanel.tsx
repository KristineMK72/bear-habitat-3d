"use client";

import { useCallback, useMemo, useRef } from "react";
import type { Bear } from "@/data/bears";
import BearMap3D from "@/components/BearMap3D"; // <-- this must exist (your MapLibre component)
import { URSUS_SATELLITE_STYLE } from "@/data/mapStyle";

type MapLike = any; // keep simple; MapLibre Map type works too

export default function BearMapPanel({ bear }: { bear: Bear }) {
  const mapRef = useRef<MapLike | null>(null);

  const initialView = useMemo(() => {
    return {
      center: bear.view.center,
      zoom: bear.view.zoom,
      pitch: bear.view.pitch ?? 45,
      bearing: bear.view.bearing ?? 0,
    };
  }, [bear]);

  const flyTo = useCallback(
    (view: { center: [number, number]; zoom: number; pitch?: number; bearing?: number }) => {
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
    },
    []
  );

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
          <button
            onClick={() => flyTo(initialView)}
            style={chipStyle}
            type="button"
          >
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

      {/* Your existing map component goes here */}
      <BearMap3D
        styleJSON={URSUS_SATELLITE_STYLE}
        initialView={initialView}
        onReady={(map: MapLike) => {
          mapRef.current = map;
        }}
        // Optional toggles you already support:
        showBears={true}
        showHabitat={true}
        showStateWires={false}
        // Later we’ll pass per-bear data urls:
        // observationsUrl={bear.sightingsGeoJSON}
        // habitatUrl={bear.rangeGeoJSON}
      />
    </section>
  );
}

const chipStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "inherit",
  cursor: "pointer",
};
