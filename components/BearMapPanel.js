<div style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
  <div
    style={{
      position: "absolute",
      left: 12,
      bottom: 12,
      zIndex: 5,
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(11,18,32,0.62)",
      backdropFilter: "blur(10px)",
      fontSize: 12,
      lineHeight: 1.35,
      maxWidth: 260,
      pointerEvents: "none",
    }}
  >
    <div style={{ fontWeight: 800, marginBottom: 6, letterSpacing: 0.6 }}>
      Legend
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#22c55e", display: "inline-block" }} />
      <span>Bear hotspots (clusters)</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#60a5fa", display: "inline-block" }} />
      <span>Black bear sightings</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#f59e0b", display: "inline-block" }} />
      <span>Brown/Grizzly sightings</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#e5e7eb", display: "inline-block" }} />
      <span>Polar bear sightings</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 18, height: 0, borderTop: "2px solid rgba(255,255,255,0.55)", display: "inline-block" }} />
      <span>State boundaries</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 18, height: 10, background: "rgba(250,204,21,0.25)", border: "1px solid rgba(253,224,71,0.85)", display: "inline-block" }} />
      <span>Habitat overlay</span>
    </div>
  </div>

  <BearMap3D
    styleJSON={URSUS_SATELLITE_STYLE}
    initialView={initialView}
    onReady={(map) => (mapRef.current = map)}
    showBears
    showHabitat
    showStateWires
    statesUrl="https://raw.githubusercontent.com/datasets/geo-boundaries-us-110m/master/states.geojson"
  />
</div>
