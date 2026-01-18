import Link from "next/link";

export default function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "12px 16px",
        backdropFilter: "blur(10px)",
        background: "rgba(10,18,32,0.55)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          URSUS
        </Link>

        <Link href="/bears" style={pill}>
          Bears
        </Link>

        <div style={{ flex: 1 }} />

        {/* quick links directly to each bear page */}
        <Link href="/bears/black-bear" style={pillSmall}>Black</Link>
        <Link href="/bears/grizzly-bear" style={pillSmall}>Grizzly</Link>
        <Link href="/bears/polar-bear" style={pillSmall}>Polar</Link>
        <Link href="/bears/kodiak-bear" style={pillSmall}>Kodiak</Link>
      </nav>
    </header>
  );
}

const pill = {
  textDecoration: "none",
  color: "inherit",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
};

const pillSmall = {
  ...pill,
  padding: "6px 10px",
  fontSize: 13,
  opacity: 0.9,
};
