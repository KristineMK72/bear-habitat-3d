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

const DEFAULT_VIEW = { center: [-104, 42], zoom: 3.2, pitch: 60, bearing: -18 };

const DEFAULT_STATES_URL =
  "https://raw.githubusercontent.com/datasets/geo-boundaries-us-110m/master/states.geojson";

export default function BearMap3D({
  showBears = true,
  showHabitat = true,
  showStateWires = false,

  styleJSON,
  initialView,
  onReady,

  habitatUrl = "/habitat.geojson",
  statesUrl = DEFAULT_STATES_URL,
  bearsUrl = "/data/gbif/bear_observations.geojson",

  autoFitBears = false,
  animateOnViewChange = false, // NEW: if true, use flyTo instead of jumpTo
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const handlersRef = useRef({}); // keep references to handlers so we can remove them safely

  const startView = useMemo(() => initialView || DEFAULT_VIEW, [initialView]);

  // Create map ONCE
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleJSON || DEFAULT_STYLE,
      center: startView.center,
      zoom: startView.zoom,
      pitch: startView.pitch ?? DEFAULT_VIEW.pitch,
      bearing: startView.bearing ?? DEFAULT_VIEW.bearing,
      antialias: true,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error;
      if (msg) console.log("[MapLibre]", msg);
    });

    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 14 });

    map.on("load", async () => {
      onReady?.(map);

      // ---- Terrain (best-effort) ----
      try {
        if (!map.getSource("terrain")) {
          map.addSource("terrain", {
            type: "raster-dem",
            tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 12,
            encoding: "terrarium",
          });
        }

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

      // ---- Habitat (optional) ----
      if (showHabitat) {
        try {
          ensureGeoJSONSource(map, "habitat", habitatUrl);

          ensureLayer(map, "habitat-fill", {
            id: "habitat-fill",
            type: "fill",
            source: "habitat",
            paint: { "fill-color": "#facc15", "fill-opacity": 0.18 },
          });

          ensureLayer(map, "habitat-outline", {
            id: "habitat-outline",
            type: "line",
            source: "habitat",
            paint: { "line-color": "#fde047", "line-width": 1.5, "line-opacity": 0.9 },
          });
        } catch (err) {
          console.log("[Habitat] skipped:", err?.message || err);
        }
      }

      // ---- State wires (optional) ----
      if (showStateWires) {
        try {
          ensureGeoJSONSource(map, "us-states", statesUrl);

          ensureLayer(map, "us-states-wire", {
            id: "us-states-wire",
            type: "line",
            source: "us-states",
            minzoom: 2.5,
            paint: { "line-color": "rgba(255,255,255,0.55)", "line-width": 1 },
          });
        } catch (err) {
          console.log("[States] skipped:", err?.message || err);
        }
      }

      // ---- Bears (optional) ----
      if (showBears) {
        try {
          if (!map.getSource("gbif-bears")) {
            map.addSource("gbif-bears", {
              type: "geojson",
              data: bearsUrl,
              cluster: true,
              clusterRadius: 50,
              clusterMaxZoom: 6,
            });
          }

          ensureLayer(map, "bears-clusters", {
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

          ensureLayer(map, "bears-cluster-count", {
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

          ensureLayer(map, "bears-points", {
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
                ["any",
                  ["in", "Ursus americanus", speciesExpr],
                  ["in", "American black bear", speciesExpr],
                  ["in", "black bear", ["downcase", speciesExpr]],
                ],
                "#60a5fa",
                ["any",
                  ["in", "Ursus arctos", speciesExpr],
                  ["in", "Brown bear", speciesExpr],
                  ["in", "grizzly", ["downcase", speciesExpr]],
                ],
                "#f59e0b",
                ["any",
                  ["in", "Ursus maritimus", speciesExpr],
                  ["in", "Polar bear", speciesExpr],
                ],
                "#e5e7eb",
                "#ef4444",
              ],
            },
          });

          // Cursor
          map.on("mouseenter", "bears-clusters", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "bears-clusters", () => (map.getCanvas().style.cursor = ""));
          map.on("mouseenter", "bears-points", () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", "bears-points", () => (map.getCanvas().style.cursor = ""));

          // Remove old handlers if any (hot reload safety)
          safeOff(map, "click", "bears-clusters", handlersRef);
          safeOff(map, "click", "bears-points", handlersRef);

          // Cluster click -> expand
          handlersRef.current.clusterClick = (e) => {
            const f = e.features?.[0];
            if (!f) return;
            const clusterId = f.properties?.cluster_id;
            const src = map.getSource("gbif-bears");
            if (!src?.getClusterExpansionZoom) return;

            src.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              map.easeTo({ center: f.geometry.coordinates, zoom: zoom + 0.5, duration: 700 });
            });
          };
          map.on("click", "bears-clusters", handlersRef.current.clusterClick);

          // Point click -> popup
          handlersRef.current.pointClick = (e) => {
            const f = e.features?.[0];
            if (!f) return;

            const p = f.properties || {};
            const coords = f.geometry?.coordinates;

            const label = p.vernacularName || p.spec
