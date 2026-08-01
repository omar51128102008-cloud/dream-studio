import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function Dashboard() {
  return (
    <>
      <header className="dash-band">
        <div className="dash-band-inner">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Dream Studio staff console</p>
          </div>
          <div className="dash-actions">
            <LogoutButton className="on-dark" />
          </div>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-row-link">
          <Link href="/dashboard/weddings">
            Weddings <span>→</span>
          </Link>
        </div>
        <div className="dash-row-link">
          <Link href="/dashboard/weddings/new">
            New Wedding <span>→</span>
          </Link>
        </div>
      </main>
    </>
  );
}
