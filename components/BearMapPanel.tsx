"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_STYLE = {
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
};

export default function BearMap3D({
  showBears = true,
  showHabitat = true,
  showStateWires = false,

  // NEW
  styleJSON,
  initialView,
  onReady,

  // optional overrides (future-proof)
  habitatUrl = "/habitat.geojson",
  statesUrl = "/data/us_states.geojson",
  bearsUrl = "/data/gbif/bear_observations.geojson",

  // default off so it doesn’t fight bear.view
  autoFitBears = false,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const defaultView = useMemo(
    () => ({
      center: [-104, 42],
      zoom: 3.2,
      pitch: 60,
      bearing: -18,
    }),
    []
  );

  // Create the map ONCE
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const v = initialView || defaultView;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleJSON || DEFAULT_STYLE,
      center: v.center,
      zoom: v.zoom,
      pitch: v.pitch ?? 60,
      bearing: v.bearing ?? -18,
      antialias: true,
      attributionControl: true,
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

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      offset: 14,
    });

    map.on("load", async () => {
      onReady?.(map);

      // Terrain (optional)
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

        if (!map.getLayer("sky")) {
          map.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "atmosphere",
              "sky-atmosphere-sun": [0, 0],
              "sky-atmosphere-sun-intensity": 10,
            },
          });
        }
      } catch (err) {
        console.log("[Terrain] not applied:", err?.message || err);
      }

      // Habitat
      try {
        map.addSource("habitat", { type: "geojson", data: habitatUrl });

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
      } catch (err) {
        console.log("[Habitat] skipped:", err?.message || err);
      }

      // State wires
      try {
        map.addSource("us-states", { type: "geojson", data: statesUrl });
        map.addLayer({
          id: "us-states-wire",
          type: "line",
          source: "us-states",
          paint: { "line-color": "rgba(255,255,255,0.55)", "line-width": 1 },
        });
      } catch (err) {
        console.log("[States] skipped:", err?.message || err);
      }

      // Bears (clusters + points)
      try {
        map.addSource("gbif-bears", {
          type: "geojson",
          data: bearsUrl,
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 6,
        });

        map.addLayer({
          id: "bears-clusters",
          type: "circle",
          source: "gbif-bears",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#22c55e",
              50,
              "#f59e0b",
              200,
              "#ef4444",
            ],
            "circle-radius": ["step", ["get", "point_count"], 14, 50, 22, 200, 30],
            "circle-opacity": 0.85,
            "circle-stroke-color": "rgba(255,255,255,0.9)",
            "circle-stroke-width": 1,
          },
        });

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

        const speciesExpr = [
          "coalesce",
          ["get", "species"],
          ["get", "scientificName"],
          ["get", "vernacularName"],
          "",
        ];

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
              [
                "any",
                ["in", "Ursus americanus", speciesExpr],
                ["in", "American black bear", speciesExpr],
                ["in", "black bear", ["downcase", speciesExpr]],
              ],
              "#60a5fa",
              [
                "any",
                ["in", "Ursus arctos", speciesExpr],
                ["in", "Brown bear", speciesExpr],
                ["in", "grizzly", ["downcase", speciesExpr]],
              ],
              "#f59e0b",
              [
                "any",
                ["in", "Ursus maritimus", speciesExpr],
                ["in", "Polar bear", speciesExpr],
              ],
              "#e5e7eb",
              "#ef4444",
            ],
          },
        });

        map.on("mouseenter", "bears-clusters", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "bears-clusters", () => (map.getCanvas().style.cursor = ""));
        map.on("mouseenter", "bears-points", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "bears-points", () => (map.getCanvas().style.cursor = ""));

        map.on("click", "bears-clusters", (e) => {
          const f = e.features?.[0];
          if (!f) return;

          const clusterId = f.properties.cluster_id;
          const src = map.getSource("gbif-bears");
          if (!src?.getClusterExpansionZoom) return;

          src.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: f.geometry.coordinates,
              zoom: zoom + 0.5,
              duration: 700,
            });
          });
        });

        map.on("click", "bears-points", (e) => {
          const f = e.features?.[0];
          if (!f) return;

          const p = f.properties || {};
          const coords = f.geometry?.coordinates;

          const label =
            p.vernacularName || p.species || p.scientificName || "Bear observation";
          const date = p.eventDate || (p.year ? String(p.year) : "Unknown date");
          const place = [p.county, p.stateProvince, p.country].filter(Boolean).join(", don't overflow");

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

        if (autoFitBears) {
          try {
            const gj = await fetch(bearsUrl).then((r) => r.json());
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
        }
      } catch (err) {
        console.log("[GBIF] skipped:", err?.message || err);
      }

      applyVisibility(map, { showBears, showHabitat, showStateWires });
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
    // create once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle visibility without recreating
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;
    applyVisibility(map, { showBears, showHabitat, showStateWires });
  }, [showBears, showHabitat, showStateWires]);

  // Respond to initialView changes (switching bear pages)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !initialView) return;

    map.jumpTo({
      center: initialView.center,
      zoom: initialView.zoom,
      pitch: initialView.pitch ?? map.getPitch(),
      bearing: initialView.bearing ?? map.getBearing(),
    });
  }, [
    initialView?.center?.[0],
    initialView?.center?.[1],
    initialView?.zoom,
    initialView?.pitch,
    initialView?.bearing,
  ]);

  return <div ref={containerRef} className="stage" style={{ width: "100%" }} />;
}

function applyVisibility(map, { showBears, showHabitat, showStateWires }) {
  const set = (id, visible) => {
    if (!map.getLayer(id)) return;
    map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  };

  set("habitat-fill", showHabitat);
  set("habitat-outline", showHabitat);
  set("us-states-wire", showStateWires);

  set("bears-clusters", showBears);
  set("bears-cluster-count", showBears);
  set("bears-points", showBears);
}
