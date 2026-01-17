"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * BearMap3D.js
 * - Satellite raster basemap (Esri World Imagery, no key)
 * - Optional terrain (Terrarium) if available; if not, it fails gracefully
 * - Habitat overlay: /habitat.geojson (optional)
 * - Bear points: /data/gbif/bear_observations.geojson (GBIF)
 *   - clustering ("hotspots")
 *   - species-colored points
 *   - click: cluster zooms in, point shows popup
 * - Legend overlay
 */

export default function BearMap3D({
  showBears = true,
  showHabitat = true,
  showStateWires = false, // optional; expects /data/us_states.geojson if you enable it
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // Satellite style (no key)
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
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error;
      if (msg) console.log("[MapLibre]", msg);
    });

    map.on("load", async () => {
      // =========================
      // TERRAIN (optional)
      // =========================
      // If Terrarium tiles are unavailable, terrain just won't apply.
      try {
        map.addSource("terrain", {
          type: "raster-dem",
          tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
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
            "sky-atmosphere-sun": [0.0, 0.0],
            "sky-atmosphere-sun-intensity": 10,
          },
        });
      } catch (err) {
        console.log("[Terrain] not applied:", err?.message || err);
      }

      // =========================
      // HABITAT OVERLAY (optional)
      // =========================
      if (showHabitat) {
        try {
          map.addSource("habitat", { type: "geojson", data: "/habitat.geojson" });

          map.addLayer({
            id: "habitat-fill",
            type: "fill",
            source: "habitat",
            paint: {
              "fill-color": "#facc15",
              "fill-opacity": 0.18,
            },
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
        } catch (err) {
          console.log("[Habitat] skipped:", err?.message || err);
        }
      }

      // =========================
      // STATE WIRES (optional)
      // =========================
      // Only enable if you actually add /public/data/us_states.geojson
      if (showStateWires) {
        try {
          map.addSource("us-states", { type: "geojson", data: "/data/us_states.geojson" });
          map.addLayer({
            id: "us-states-wire",
            type: "line",
            source: "us-states",
            paint: {
              "line-color": "rgba(255,255,255,0.55)",
              "line-width": 1,
            },
          });
        } catch (err) {
          console.log("[States] skipped:", err?.message || err);
        }
      }

      // =========================
      // GBIF BEARS (clusters + species + popups)
      // =========================
      if (!showBears) return;

      // Species “matcher” expression
      const speciesExpr = [
        "coalesce",
        ["get", "species"],
        ["get", "scientificName"],
        ["get", "vernacularName"],
        "",
      ];

      // Add source with clustering ("hotspots")
      map.addSource("gbif-bears", {
        type: "geojson",
        data: "/data/gbif/bear_observations.geojson",
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 6,
      });

      // Hotspot circles (clusters)
      map.addLayer({
        id: "bears-clusters",
        type: "circle",
        source: "gbif-bears",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#22c55e", 50, "#f59e0b", 200, "#ef4444"],
          "circle-radius": ["step", ["get", "point_count"], 14, 50, 22, 200, 30],
          "circle-opacity": 0.85,
          "circle-stroke-color": "rgba(255,255,255,0.9)",
          "circle-stroke-width": 1,
        },
      });

      // Hotspot labels
      map.addLayer({
        id: "bears-cluster-count",
        type: "symbol",
        source: "gbif-bears",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#0b1220" },
      });

      // Individual points, colored by species
      map.addLayer({
        id: "bears-points",
        type: "circle",
        source: "gbif-bears",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2, 6, 4, 10, 7],
          "circle-opacity": 0.92,
          "circle-stroke-color": "rgba(255,255,255,0.95)",
          "circle-stroke-width": 1,

          "circle-color": [
            "case",
            // American black bear
            [
              "any",
              ["in", "Ursus americanus", speciesExpr],
              ["in", "American black bear", speciesExpr],
              ["in", "black bear", ["downcase", speciesExpr]],
            ],
            "#60a5fa", // blue

            // Brown bear / grizzly
            [
              "any",
              ["in", "Ursus arctos", speciesExpr],
              ["in", "Brown bear", speciesExpr],
              ["in", "grizzly", ["downcase", speciesExpr]],
            ],
            "#f59e0b", // amber

            // Polar bear
            [
              "any",
              ["in", "Ursus maritimus", speciesExpr],
              ["in", "Polar bear", speciesExpr],
            ],
            "#e5e7eb", // near-white

            // fallback
            "#ef4444",
          ],
        },
      });

      // ===== Interactions =====
      const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 14 });

      // Click hotspot => zoom in
      map.on("click", "bears-clusters", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const clusterId = f.properties.cluster_id;
        const src = map.getSource("gbif-bears");

        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: f.geometry.coordinates,
            zoom: zoom + 0.5,
            duration: 700,
          });
        });
      });

      // Click point => popup
      map.on("click", "bears-points", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const p = f.properties || {};
        const coords = f.geometry?.coordinates;

        const label =
          p.vernacularName ||
          p.species ||
          p.scientificName ||
          "Bear observation";

        const date = p.eventDate || (p.year ? `${p.year}` : "Unknown date");
        const place = [p.county, p.stateProvince, p.country].filter(Boolean).join(", ");

        popup
          .setLngLat(coords)
          .setHTML(`
            <div style="font: 12.5px/1.35 system-ui; color:#0b1220; min-width:220px">
              <div style="font-weight:800; margin-bottom:4px">${label}</div>
              <div style="opacity:.85"><b>Date:</b> ${date}</div>
              <div style="opacity:.85"><b>Place:</b> ${place || "—"}</div>
              <div style="opacity:.75; margin-top:6px">GBIF ID: ${p.gbifID || "—"}</div>
            </div>
          `)
          .addTo(map);
      });

      // Cursor hints
      map.on("mouseenter", "bears-clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "bears-clusters", () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", "bears-points", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "bears-points", () => (map.getCanvas().style.cursor = ""));

      // Auto-fit to the data once so you SEE it
      try {
        const gj = await fetch("/data/gbif/bear_observations.geojson").then((r) => r.json());
        const coords = (gj.features || [])
          .map((ff) => ff?.geometry?.coordinates)
          .filter((c) => Array.isArray(c) && c.length === 2);

        if (coords.length) {
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

          for (const [lon, lat] of coords) {
            if (lon < minX) minX = lon;
            if (lat < minY) minY = lat;
            if (lon > maxX) maxX = lon;
            if (lat > maxY) maxY = lat;
          }

          map.fitBounds(
            [
              [minX, minY],
              [maxX, maxY],
            ],
            { padding: 55, duration: 900 }
          );
        }
      } catch (err) {
        console.log("[GBIF] fitBounds skipped:", err?.message || err);
      }
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [SATELLITE_STYLE, showBears, showHabitat, showStateWires]);

  // Simple legend UI overlay
  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        className="stage"
        style={{ width: "100%", height: "70vh", minHeight: 520 }}
      />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          padding: "12px 12px",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(10,14,22,0.72)",
          backdropFilter: "blur(10px)",
          color: "rgba(255,255,255,0.92)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
          maxWidth: 270,
        }}
      >
        <div style={{ fontWeight: 900, letterSpacing: "0.06em", marginBottom: 8 }}>
          Legend
        </div>

        <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
          <LegendRow color="#60a5fa" label="Black bear (Ursus americanus)" />
          <LegendRow color="#f59e0b" label="Brown bear / Grizzly (Ursus arctos)" />
          <LegendRow color="#e5e7eb" label="Polar bear (Ursus maritimus)" />
          <div style={{ height: 6 }} />
          <LegendRow color="#22c55e" label="Hotspot (small cluster)" />
          <LegendRow color="#f59e0b" label="Hotspot (medium cluster)" />
          <LegendRow color="#ef4444" label="Hotspot (large cluster)" />
        </div>

        <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
          Click a hotspot to zoom in. Click a point for details.
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
          border: "1px solid rgba(255,255,255,0.55)",
          display: "inline-block",
        }}
      />
      <span style={{ opacity: 0.92 }}>{label}</span>
    </div>
  );
}
