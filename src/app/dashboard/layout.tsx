import "./dashboard.css";

export const metadata = {
  title: "Academy Portal | ZYT X",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-root">
      {children}
    </div>
  );
}
