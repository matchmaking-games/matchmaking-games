import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Bem-vindo ao Dashboard
        </h1>
      </div>
    </DashboardLayout>
  );
}
