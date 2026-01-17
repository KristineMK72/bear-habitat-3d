"use client";

import React from "react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function BearMap3D() {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Map
        mapLib={maplibregl}
        initialViewState={{
          longitude: -110.58,
          latitude: 44.42,
          zoom: 12,
          pitch: 60,
          bearing: -20
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        terrain={{ source: "raster-dem", exaggeration: 1.5 }}
        maxPitch={85}
      >
        <Source
          id="raster-dem"
          type="raster-dem"
          tiles={["https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png"]}
          tileSize={256}
        />

        <Source
          id="satellite"
          type="raster"
          tiles={[
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ]}
          tileSize={256}
        >
          <Layer id="satellite-layer" type="raster" />
        </Source>

        <Source id="habitat" type="geojson" data="/habitat.geojson">
          <Layer
            id="habitat-layer"
            type="fill"
            paint={{
              "fill-color": "#fbbf24",
              "fill-opacity": 0.4,
              "fill-outline-color": "#ffffff"
            }}
          />
        </Source>

        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
}
