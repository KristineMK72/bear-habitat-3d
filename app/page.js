"use client";

import dynamic from "next/dynamic";

const BearMap3D = dynamic(() => import("../components/BearMap3D"), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <div className="container">
        <div className="header">
          <div className="brand">
            <div className="title">URSUS</div>
            <div className="subtitle">
              A Living Bear Habitat · 3D terrain + real USA observations
            </div>
          </div>

          <div className="row">
            <span className="badge">GBIF sightings</span>
            <span className="badge">USA-only</span>
            <span className="badge">7360 points</span>
          </div>
        </div>

        <div className="card">
          <div className="stage">
            <BearMap3D showHabitat={true} showBears={true} />
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
          Tip: zoom in to see clusters. Hover a point for details.
          <span style={{ display: "inline-block", width: 10 }} />
          Data source: GBIF Occurrence API.
        </div>
      </div>
    </main>
  );
}
