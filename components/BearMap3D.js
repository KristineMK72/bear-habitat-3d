"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const BASE_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const STATES_GEOJSON_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/us-states.json";

export default function BearMap3D({
  showStates = true,
  showHabitat = true,
  showBears = true,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center: [-96, 39],
      zoom: 3,
      pitch: 55,
      bearing: -12,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("error", (e) => {
      const msg = e?.error?.message || e?.error || e;
      if (msg) console.log("[MapLibre error]", msg);
    });

    map.on("load", async () => {
      // =========================================
      // STATES (wire outlines)
      // =========================================
      if (showStates) {
        try {
          map.addSource("us-states", { type: "geojson", data: STATES_GEOJSON_URL });

          map.addLayer({
            id: "states-outline",
            type: "line",
            source: "us-states",
            paint: {
              "line-color": "#ffffff",
              "line-width": 1.2,
              "line-opacity": 0.55,
            },
          });
        } catch (err) {
          console.log("[States] Failed to add:", err);
        }
      }

      // =========================================
      // HABITAT (your local GeoJSON in /public)
      // =========================================
      if (showHabitat) {
        try {
          map.addSource("habitat", { type: "geojson", data: "/habitat.geojson" });

          map.addLayer({
            id: "habitat-fill",
            type: "fill",
            source: "habitat",
            paint: { "fill-color": "#2dd4bf", "fill-opacity": 0.14 },
          });

          map.addLayer({
            id: "habitat-outline",
            type: "line",
            source: "habitat",
            paint: { "line-color": "#7dd3fc", "line-width": 1.5, "line-opacity": 0.9 },
          });
        } catch (err) {
          console.log("[Habitat] Failed to add:", err);
        }
      }

      // =========================================
      // GBIF BEARS (cluster hotspots + species points)
      // =========================================
      if (showBears) {
        try {
          map.addSource("gbif-bears", {
            type: "geojson",
            data: "/data/gbif/bear_observations.geojson",
            cluster: true,
            clusterMaxZoom: 7,
            clusterRadius: 55,
          });

          // --- Hotspot clusters ---
          map.addLayer({
            id: "bear-clusters",
            type: "circle",
            source: "gbif-bears",
            filter: ["has", "point_count"],
            paint: {
              "circle-radius": [
                "step",
                ["get", "point_count"],
                14,
                25, 18,
                60, 24,
                150, 32,
                400, 42,
              ],
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#ffb703",
                25, "#fb8500",
                60, "#ff3b3b",
                150, "#d00000",
                400, "#8d0000",
              ],
              "circle-opacity": 0.75,
              "circle-stroke-color": "rgba(255,255,255,0.85)",
              "circle-stroke-width": 1.5,
            },
          });

          // --- Cluster count labels ---
          map.addLayer({
            id: "bear-cluster-count",
            type: "symbol",
            source: "gbif-bears",
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 12,
              "text-allow-overlap": true,
            },
            paint: {
              "text-color": "#111111",
              "text-halo-color": "rgba(255,255,255,0.92)",
              "text-halo-width": 1,
            },
          });

          // --- Individual bears (zoom in) ---
          map.addLayer({
            id: "bear-points",
            type: "circle",
            source: "gbif-bears",
            filter: ["!", ["has", "point_count"]],
            minzoom: 6.5,
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                6.5, 3,
                8, 5,
                10, 7,
              ],
              "circle-color": [
                "match",
                ["get", "scientificName"],
                "Ursus americanus", "#00e5ff", // black bear
                "Ursus arctos", "#ff3b3b",     // brown bear
                "Ursus maritimus", "#ffffff",  // polar bear
                "#a78bfa",                     // fallback
              ],
              "circle-opacity": 0.9,
              "circle-stroke-color": "rgba(0,0,0,0.35)",
              "circle-stroke-width": 1,
            },
          });

          // Bring hotspots above everything
          map.moveLayer("bear-clusters");
          map.moveLayer("bear-cluster-count");
          map.moveLayer("bear-points");

          // Click hotspot to zoom in
          map.on("click", "bear-clusters", (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ["bear-clusters"] });
            const clusterId = features?.[0]?.properties?.cluster_id;
            if (clusterId == null) return;

            const source = map.getSource("gbif-bears");
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: Math.min(zoom + 0.5, 11),
                duration: 650,
              });
            });
          });

          map.on("mouseenter", "bear-clusters", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "bear-clusters", () => {
            map.getCanvas().style.cursor = "";
          });

          // Popup for individual bears (desktop hover)
          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 10,
          });

          map.on("mouseenter", "bear-points", (e) => {
            map.getCanvas().style.cursor = "pointer";
            const f = e.features?.[0];
            const p = f?.properties || {};
            const coords = f?.geometry?.coordinates;
            if (!coords) return;

            const label =
              p.vernacularName || p.species || p.scientificName || "Bear observation";
            const when = p.year ? ` (${p.year})` : "";
            const where = [p.stateProvince, p.county].filter(Boolean).join(", ");

            popup
              .setLngLat(coords)
              .setHTML(
                `<div style="font: 12px/1.35 system-ui; color:#111;">
                  <b>${label}</b>${when}<br/>
                  <span style="opacity:.75">${where}</span>
                </div>`
              )
              .addTo(map);
          });

          map.on("mouseleave", "bear-points", () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });

          // Start where hotspots are easy to see
          map.flyTo({
            center: [-84, 45],
            zoom: 4.3,
            pitch: 55,
            bearing: -12,
            essential: true,
          });
        } catch (err) {
          console.log("[GBIF] Failed to add clustered bears:", err);
        }
      }
    });

    return () => {
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [showStates, showHabitat, showBears]);

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
