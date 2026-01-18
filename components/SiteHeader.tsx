import Link from "next/link";

export default function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "14px 16px",
        backdropFilter: "blur(10px)",
        background: "rgba(10,18,32,0.55)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <nav style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 14, alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 900, letterSpacing: 1 }}>
          URSUS
        </Link>

        <div style={{ flex: 1 }} />

        <Link href="/bears" style={navLink}>Bears</Link>
      </nav>
    </header>
  );
}

const navLink = {
  textDecoration: "none",
  color: "inherit",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
} as const;
