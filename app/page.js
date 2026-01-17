"use client";

import dynamic from "next/dynamic";

const BearMap3D = dynamic(() => import("../components/BearMap3D"), {
  ssr: false
});

export default function Home() {
  return (
    <main style={{ padding: "2rem", background: "#0c0a09", minHeight: "100vh" }}>
      <h1 style={{ color: "white", textAlign: "center", marginBottom: "1rem" }}>
        Bear Habitat 3D Terrain
      </h1>
      <BearMap3D />
    </main>
  );
}
