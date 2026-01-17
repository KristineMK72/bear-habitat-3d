/**
 * Fetch GBIF bear occurrences (crowdsourced observations) and write:
 *  - public/data/gbif/bear_observations.csv
 *  - public/data/gbif/bear_observations.geojson
 *
 * Uses the GBIF Occurrence Search API with paging (limit/offset).
 *
 * Optional env vars:
 *   GBIF_BBOX="minLon,minLat,maxLon,maxLat"  (optional)
 *   GBIF_LIMIT=300                          (optional; per-request limit)
 *   GBIF_MAX=5000                           (optional; total records per species)
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const OUT_DIR = path.join("public", "data", "gbif");
const CSV_PATH = path.join(OUT_DIR, "bear_observations.csv");
const GEOJSON_PATH = path.join(OUT_DIR, "bear_observations.geojson");

const LIMIT = Number(process.env.GBIF_LIMIT || 300);

// IMPORTANT: Keep this modest for Vercel builds.
// You can raise later when you're not running it during build.
const MAX = Number(process.env.GBIF_MAX || 5000);

// Optional bounding box: "minLon,minLat,maxLon,maxLat"
const BBOX = process.env.GBIF_BBOX?.trim();

// Bears (keep all 3, still USA-only)
const SPECIES = [
  { label: "American black bear", scientificName: "Ursus americanus" },
  { label: "Brown bear", scientificName: "Ursus arctos" },
  { label: "Polar bear", scientificName: "Ursus maritimus" },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[,"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GBIF ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      // small backoff
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

function toGeoJSONFeature(r) {
  const lon = r.decimalLongitude;
  const lat = r.decimalLatitude;
  if (typeof lon !== "number" || typeof lat !== "number") return null;

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lon, lat] },
    properties: {
      gbifID: r.gbifID ?? r.key ?? null,
      scientificName: r.scientificName ?? null,
      species: r.species ?? null,
      vernacularName: r.vernacularName ?? null,
      eventDate: r.eventDate ?? null,
      year: r.year ?? null,
      month: r.month ?? null,
      day: r.day ?? null,
      basisOfRecord: r.basisOfRecord ?? null,
      country: r.country ?? null,
      stateProvince: r.stateProvince ?? null,
      county: r.county ?? null,
      locality: r.locality ?? null,
      datasetKey: r.datasetKey ?? null,
      publisher: r.publisher ?? null,
      recordedBy: r.recordedBy ?? null,
      license: r.license ?? null,
      issues: r.issues ?? null,
    },
  };
}

function buildWktPolygonFromBbox(bboxStr) {
  const [minLon, minLat, maxLon, maxLat] = bboxStr.split(",").map(Number);
  if (![minLon, minLat, maxLon, maxLat].every(Number.isFinite)) return null;
  return `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
}

async function fetchSpecies(scientificName) {
  let offset = 0;
  let all = [];

  const wkt = BBOX ? buildWktPolygonFromBbox(BBOX) : null;

  while (all.length < MAX) {
    const url = new URL("https://api.gbif.org/v1/occurrence/search");
    const params = {
      scientificName,
      limit: LIMIT,
      offset,
      hasCoordinate: "true",
      hasGeospatialIssue: "false",
      basisOfRecord: "HUMAN_OBSERVATION",
      country: "US", // ✅ USA-only
      geometry: wkt || undefined,
    };

    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });

    const json = await fetchWithRetry(url, 3);
    const results = json.results ?? [];

    all.push(...results);

    if (results.length < LIMIT) break; // no more pages
    offset += LIMIT;
  }

  if (all.length > MAX) all = all.slice(0, MAX);
  return all;
}

async function main() {
  ensureDir(OUT_DIR);

  console.log(`GBIF fetch starting… LIMIT=${LIMIT} MAX=${MAX} BBOX=${BBOX || "none"} country=US`);

  let rows = [];
  for (const s of SPECIES) {
    console.log(`→ Fetching: ${s.scientificName} (${s.label})`);
    const recs = await fetchSpecies(s.scientificName);
    console.log(`  got ${recs.length}`);
    rows.push(...recs);
  }

  // De-dupe by gbifID/key
  const seen = new Set();
  rows = rows.filter((r) => {
    const id = r.gbifID ?? r.key;
    if (id == null) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // Write CSV
  const headers = [
    "gbifID",
    "scientificName",
    "species",
    "vernacularName",
    "decimalLatitude",
    "decimalLongitude",
    "eventDate",
    "year",
    "month",
    "day",
    "basisOfRecord",
    "country",
    "stateProvince",
    "county",
    "locality",
    "datasetKey",
    "publisher",
    "recordedBy",
    "license",
  ];

  const csvLines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  fs.writeFileSync(CSV_PATH, csvLines.join("\n"), "utf8");

  // Write GeoJSON
  const features = rows.map(toGeoJSONFeature).filter(Boolean);
  const geojson = {
    type: "FeatureCollection",
    name: "gbif_bear_observations_us",
    features,
  };
  fs.writeFileSync(GEOJSON_PATH, JSON.stringify(geojson), "utf8");

  console.log(`✅ Wrote ${CSV_PATH} (${rows.length} rows)`);
  console.log(`✅ Wrote ${GEOJSON_PATH} (${features.length} points)`);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
