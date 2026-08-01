import "../dashboard.css";
import DashNav from "@/components/DashNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash">
      <DashNav />
      {children}
    </div>
  );
}
