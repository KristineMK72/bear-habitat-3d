"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function BearMap3D({ showHabitat = true, showBears = true }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-96, 39],
      zoom: 3,
      pitch: 45,
      bearing: -10,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error || e;
      if (msg) console.log("[MapLibre error]", msg);
    });

    map.on("load", async () => {
      // ===== Habitat overlay (optional) =====
      if (showHabitat) {
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
              "fill-color": "#2dd4bf",
              "fill-opacity": 0.18,
            },
          });

          map.addLayer({
            id: "habitat-outline",
            type: "line",
            source: "habitat",
            paint: {
              "line-color": "#7dd3fc",
              "line-width": 1.5,
              "line-opacity": 0.9,
            },
          });
        } catch (err) {
          console.log("[Habitat] Failed to add overlay:", err);
        }
      }

      // ===== GBIF Bears =====
      if (showBears) {
        try {
          // Source
          map.addSource("gbif-bears", {
            type: "geojson",
            data: "/data/gbif/bear_observations.geojson",
          });

          // BIG circles for mobile visibility (debug-friendly)
          map.addLayer({
            id: "gbif-bears-circles",
            type: "circle",
            source: "gbif-bears",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                2, 6,
                4, 10,
                6, 16,
                8, 22
              ],
              "circle-color": "#ff3b3b",
              "circle-opacity": 0.9,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 1,
            },
          });

          // Force bears above everything
          map.moveLayer("gbif-bears-circles");

          // Hover popup (works great on desktop; harmless on mobile)
          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 10,
          });

          map.on("mouseenter", "gbif-bears-circles", (e) => {
            map.getCanvas().style.cursor = "pointer";
            const f = e.features?.[0];
            const p = f?.properties || {};
            const coords = f?.geometry?.coordinates;
            if (!coords) return;

            const label =
              p.vernacularName || p.species || p.scientificName || "Bear observation";
            const year = p.year ? ` (${p.year})` : "";

            popup
              .setLngLat(coords)
              .setHTML(
                `<div style="font: 12px/1.35 system-ui; color:#111;">
                  <b>${label}</b>${year}<br/>
                  <span style="opacity:.75">${p.stateProvince || ""}</span>
                </div>`
              )
              .addTo(map);
          });

          map.on("mouseleave", "gbif-bears-circles", () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });

          // Auto-fit bounds to bears (so you can't miss them)
          const gj = await fetch("/data/gbif/bear_observations.geojson").then((r) => r.json());
          const coords = (gj.features || [])
            .map((f) => f?.geometry?.coordinates)
            .filter((c) => Array.isArray(c) && c.length === 2);

          console.log("[GBIF] Bear points loaded:", coords.length);

          if (coords.length) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const [lon, lat] of coords) {
              if (lon < minX) minX = lon;
              if (lat < minY) minY = lat;
              if (lon > maxX) maxX = lon;
              if (lat > maxY) maxY = lat;
            }

            // Fit to dataset
            map.fitBounds(
              [
                [minX, minY],
                [maxX, maxY],
              ],
              { padding: 50, duration: 900 }
            );

            // Optional: jump toward a dense area (helps mobile users instantly see dots)
            // Comment this out later if you want pure fitBounds behavior.
            map.flyTo({
              center: [-84, 45], // Great Lakes / Upper Midwest (bear-dense)
              zoom: 4.5,
              pitch: 45,
              bearing: -10,
              essential: true,
            });
          }
        } catch (err) {
          console.log("[GBIF] Failed to add bear points:", err);
        }
      }
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [showHabitat, showBears]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "70vh",
        minHeight: 520,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
        background: "rgba(0,0,0,0.25)",
      }}
    />
  );
}
