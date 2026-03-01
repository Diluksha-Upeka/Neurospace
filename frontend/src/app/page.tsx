import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="w-full h-full border border-slate-800 rounded-lg flex items-center justify-center bg-slate-900/50">
        <p className="text-slate-500 animate-pulse">Graph Canvas Initializing...</p>
      </div>
    </DashboardLayout>
  );
}
