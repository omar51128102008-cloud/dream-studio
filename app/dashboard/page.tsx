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
      <nav>
        <Link
          href="/dashboard/weddings/new"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 4,
            background: "#111",
            color: "#fff",
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
