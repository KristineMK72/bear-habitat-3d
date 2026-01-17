/**
 * Fetch GBIF bear occurrences (crowdsourced observations) and write:
 *  - data/gbif/bear_observations.csv
 *  - data/gbif/bear_observations.geojson
 *
 * Uses the GBIF Occurrence Search API with paging. :contentReference[oaicite:1]{index=1}
 *
 * Configure via env vars:
 *   GBIF_BBOX="minLon,minLat,maxLon,maxLat"  (optional)
 *   GBIF_LIMIT=300                          (optional; per-request max commonly 300) :contentReference[oaicite:2]{index=2}
 *   GBIF_MAX=20000                          (optional; total records to fetch)
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const OUT_DIR = path.join("data", "gbif");
const CSV_PATH = path.join(OUT_DIR, "bear_observations.csv");
const GEOJSON_PATH = path.join(OUT_DIR, "bear_observations.geojson");

const LIMIT = Number(process.env.GBIF_LIMIT || 300);
const MAX = Number(process.env.GBIF_MAX || 20000);

// Optional bounding box: "minLon,minLat,maxLon,maxLat"
const BBOX = process.env.GBIF_BBOX?.trim();

// A practical starter set of bears:
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

function toGeoJSONFeature(r) {
  // GBIF uses decimalLatitude/decimalLongitude
  const lon = r.decimalLongitude;
  const lat = r.decimalLatitude;
  if (typeof lon !== "number" || typeof lat !== "number") return null;

  const props = {
    gbifID: r.gbifID ?? null,
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
    institutionCode: r.institutionCode ?? null,
    collectionCode: r.collectionCode ?? null,
    license: r.license ?? null,
    // Keep any flags/issues if you want QA later
    issues: r.issues ?? null,
  };

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lon, lat] },
    properties: props,
  };
}

async function fetchPage(params) {
  const url = new URL("https://api.gbif.org/v1/occurrence/search");
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GBIF request failed ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchSpecies(scientificName) {
  let offset = 0;
  let all = [];

  while (all.length < MAX) {
    // GBIF supports filtering on hasCoordinate and hasGeospatialIssue. :contentReference[oaicite:3]{index=3}
    // We also request only "human observation" style records where possible.
    const params = {
      scientificName,
      limit: LIMIT,
      offset,
      hasCoordinate: "true",
      hasGeospatialIssue: "false",
      // You can comment out basisOfRecord if you want everything:
      basisOfRecord: "HUMAN_OBSERVATION",
    };

    // Optional bounding box filter using geometry=WKT polygon.
    // If provided, BBOX is minLon,minLat,maxLon,maxLat
    if (BBOX) {
      const [minLon, minLat, maxLon, maxLat] = BBOX.split(",").map(Number);
      if ([minLon, minLat, maxLon, maxLat].every((n) => Number.isFinite(n))) {
        params.geometry = `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
      }
    }

    const json = await fetchPage(params);
    const results = json.results ?? [];
    all.push(...results);

    if (results.length < LIMIT) break; // no more pages
    offset += LIMIT;
  }

  // Trim if we overshot MAX
  if (all.length > MAX) all = all.slice(0, MAX);
  return all;
}

async function main() {
  ensureDir(OUT_DIR);

  console.log(`GBIF fetch starting… LIMIT=${LIMIT} MAX=${MAX} BBOX=${BBOX || "none"}`);

  let rows = [];
  for (const s of SPECIES) {
    console.log(`→ Fetching: ${s.scientificName} (${s.label})`);
    const recs = await fetchSpecies(s.scientificName);
    console.log(`  got ${recs.length}`);
    rows.push(...recs);
  }

  // De-dupe by gbifID if present
  const seen = new Set();
  rows = rows.filter((r) => {
    const id = r.gbifID ?? r.key; // sometimes "key"
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
    ...rows.map((r) =>
      headers
        .map((h) => csvEscape(r[h]))
        .join(",")
    ),
  ];
  fs.writeFileSync(CSV_PATH, csvLines.join("\n"), "utf8");

  // Write GeoJSON
  const features = rows
    .map(toGeoJSONFeature)
    .filter(Boolean);

  const geojson = {
    type: "FeatureCollection",
    name: "gbif_bear_observations",
    features,
  };
  fs.writeFileSync(GEOJSON_PATH, JSON.stringify(geojson), "utf8");

  console.log(`✅ Wrote ${CSV_PATH} (${rows.length} rows)`);
  console.log(`✅ Wrote ${GEOJSON_PATH} (${features.length} points)`);
  console.log(`Tip: cite GBIF downloads when publishing results. :contentReference[oaicite:4]{index=4}`);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
