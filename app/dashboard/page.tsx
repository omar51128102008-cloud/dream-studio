import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function Dashboard() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <LogoutButton />
      </div>
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Link
          href="/dashboard/weddings"
          style={{
            display: "block",
            padding: "16px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            color: "#111",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Weddings
        </Link>
        <Link
          href="/dashboard/weddings/new"
          style={{
            display: "block",
            padding: "16px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            color: "#111",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + New Wedding
        </Link>
      </nav>
    </main>
  );
}
