"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function BearMap3D() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Keep the same overall "look" as your original: angled, dramatic, big terrain view.
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-104, 42], // nice western-US angle similar to your screenshot
      zoom: 3.2,
      pitch: 55,
      bearing: -18,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    // Log errors (useful, but won't break the UI)
    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error;
      if (msg) console.log("[MapLibre]", msg);
    });

    map.on("load", async () => {
      setReady(true);

      // ===== Habitat overlay (optional; uses /public/habitat.geojson if present) =====
      try {
        map.addSource("habitat", {
          type: "geojson",
          data: "/habitat.geojson",
        });

        map.addLayer({
          id: "habitat-fill",
          type: "fill",
          source: "habitat",
          paint: {
            "fill-color": "#22c55e",
            "fill-opacity": 0.12,
          },
        });

        map.addLayer({
          id: "habitat-outline",
          type: "line",
          source: "habitat",
          paint: {
            "line-color": "#86efac",
            "line-width": 1.5,
            "line-opacity": 0.9,
          },
        });
      } catch (err) {
        // If habitat.geojson doesn't exist, that's fine.
        console.log("[Habitat] skipped:", err?.message || err);
      }

      // ===== GBIF bears =====
      try {
        map.addSource("gbif-bears", {
          type: "geojson",
          data: "/data/gbif/bear_observations.geojson",
        });

        // SUPER visible circles so you know it's working
        map.addLayer({
          id: "gbif-bears-circles",
          type: "circle",
          source: "gbif-bears",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 2, 5, 4, 8, 7],
            "circle-color": "#ff3b3b",
            "circle-opacity": 0.85,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
          },
        });

        // Auto zoom to bears so you can’t miss them
        const gj = await fetch("/data/gbif/bear_observations.geojson").then((r) => r.json());
        const coords = (gj.features || [])
          .map((f) => f?.geometry?.coordinates)
          .filter((c) => Array.isArray(c) && c.length === 2);

        console.log("[GBIF] points:", coords.length);

        if (coords.length) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const [lon, lat] of coords) {
            if (lon < minX) minX = lon;
            if (lat < minY) minY = lat;
            if (lon > maxX) maxX = lon;
            if (lat > maxY) maxY = lat;
          }
          map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 50, duration: 900 });
        }
      } catch (err) {
        console.log("[GBIF] bears layer failed:", err?.message || err);
      }
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {/* Title bar (matches your screenshot vibe) */}
      <div
        style={{
          textAlign: "center",
          padding: "14px 10px",
          fontWeight: 800,
          letterSpacing: "0.06em",
          color: "white",
          background: "rgba(0,0,0,0.85)",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "none",
        }}
      >
        Bear Habitat 3D Terrain
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "70vh",
          minHeight: 520,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
        }}
      />

      {!ready && (
        <div style={{ color: "rgba(255,255,255,0.7)", marginTop: 10, fontSize: 13 }}>
          Loading map…
        </div>
      )}
    </div>
  );
}
