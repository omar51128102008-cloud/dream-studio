import Link from "next/link";
import StudioLogo from "./StudioLogo";

export default function DashNav() {
  return (
    <header className="dash-nav">
      <div className="dash-nav-inner">
        <StudioLogo onDark href="/dashboard" />
        <nav className="dash-nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/weddings">Weddings</Link>
        </nav>
      </div>
    </header>
  );
}
