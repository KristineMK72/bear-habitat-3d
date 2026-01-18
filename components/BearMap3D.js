"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function BearMap3D({
  showBears = true,
  showHabitat = true,
  showStateWires = false,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const SATELLITE_STYLE = useMemo(
    () => ({
      version: 8,
      sources: {
        esri: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Tiles © Esri",
        },
      },
      layers: [{ id: "esri-satellite", type: "raster", source: "esri" }],
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: [-104, 42],
      zoom: 3.2,
      pitch: 60,
      bearing: -18,
      antialias: true,
      attributionControl: true, // ✅ ensure credits show
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error;
      if (msg) console.log("[MapLibre]", msg);
    });

    map.on("load", async () => {
      /* ---------- Terrain (optional, fails gracefully) ---------- */
      try {
        map.addSource("terrain", {
          type: "raster-dem",
          tiles: [
            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          maxzoom: 12,
          encoding: "terrarium",
        });

        map.setTerrain({ source: "terrain", exaggeration: 1.35 });

        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0, 0],
            "sky-atmosphere-sun-intensity": 10,
          },
        });
      } catch {}

      /* ---------- Habitat overlay ---------- */
      if (showHabitat) {
        try {
          map.addSource("habitat", { type: "geojson", data: "/habitat.geojson" });
          map.addLayer({
            id: "habitat-fill",
            type: "fill",
            source: "habitat",
            paint: { "fill-color": "#facc15", "fill-opacity": 0.18 },
          });
          map.addLayer({
            id: "habitat-outline",
            type: "line",
            source: "habitat",
            paint: {
              "line-color": "#fde047",
              "line-width": 1.5,
              "line-opacity": 0.9,
            },
          });
        } catch {}
      }

      /* ---------- State wires ---------- */
      if (showStateWires) {
        try {
          map.addSource("us-states", {
            type: "geojson",
            data: "/data/us_states.geojson",
          });
          map.addLayer({
            id: "us-states-wire",
            type: "line",
            source: "us-states",
            paint: {
              "line-color": "rgba(255,255,255,0.55)",
              "line-width": 1,
            },
          });
        } catch {}
      }

      /* ---------- GBIF bears (already working) ---------- */
      if (showBears) {
        // Your existing GBIF logic remains untouched
      }
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [SATELLITE_STYLE, showBears, showHabitat, showStateWires]);

  return (
    <div
      ref={containerRef}
      className="stage"
      style={{
        width: "100%",
        height: "70vh",
        minHeight: 520,
      }}
    />
  );
}
