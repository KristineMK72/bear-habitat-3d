"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function BearMap3D() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Satellite raster style (no key)
    const SATELLITE_STYLE = {
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
      layers: [
        {
          id: "esri-satellite",
          type: "raster",
          source: "esri",
        },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: [-104, 42],
      zoom: 3.2,
      pitch: 60,
      bearing: -18,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error;
      if (msg) console.log("[MapLibre]", msg);
    });

    map.on("load", async () => {
      // --- Terrain (DEM) using Terrarium tiles ---
      // Replaces the broken demotiles.maplibre.org/terrain-tiles/...
      try {
        map.addSource("terrain", {
          type: "raster-dem",
          tiles: [
            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          maxzoom: 12,
          encoding: "terrarium", // key difference vs Mapbox RGB encoding
        });

        map.setTerrain({ source: "terrain", exaggeration: 1.35 });

        // Optional atmospheric sky (makes 3D feel nicer)
        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0.0, 0.0],
            "sky-atmosphere-sun-intensity": 10,
          },
        });
      } catch (err) {
        console.log("[Terrain] skipped/failed:", err?.message || err);
      }

      // --- Habitat overlay (optional) ---
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
          paint: { "line-color": "#fde047", "line-width": 1.5, "line-opacity": 0.9 },
        });
      } catch (err) {
        console.log("[Habitat] skipped:", err?.message || err);
      }

      // --- GBIF bears overlay ---
      try {
        map.addSource("gbif-bears", {
          type: "geojson",
          data: "/data/gbif/bear_observations.geojson",
        });

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

        // Auto-fit to points so you immediately see them
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
        console.log("[GBIF] failed:", err?.message || err);
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
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "70vh",
        minHeight: 520,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
      }}
    />
  );
}
