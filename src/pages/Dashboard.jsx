import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Building2, ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import StatsRow from "../components/dashboard/StatsRow";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import ComplianceOverview from "../components/dashboard/ComplianceOverview";
import ThresholdAlerts from "../components/dashboard/ThresholdAlerts";
import SampleDataBanner from "../components/dashboard/SampleDataBanner";

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.BenefitPlan.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.ComplianceTask.list(),
  });

  const activeClients = clients.filter(c => c.status === "active").length;
  const activePlans = plans.filter(p => p.status === "active").length;
  const overdueTasks = tasks.filter(t => t.status === "overdue" || (t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "na")).length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;

  const stats = [
    { label: "Active Clients", value: activeClients, icon: Building2, color: "bg-primary", iconColor: "text-primary", sub: `${clients.length} total` },
    { label: "Benefit Plans", value: activePlans, icon: ClipboardList, color: "bg-chart-2", iconColor: "text-chart-2", sub: `${plans.length} total` },
    { label: "Overdue Items", value: overdueTasks, icon: AlertTriangle, color: "bg-destructive", iconColor: "text-destructive", sub: "Needs attention" },
    { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "bg-success", iconColor: "text-success", sub: `of ${tasks.length} tasks` },
  ];

  return (
    <div>
      <SampleDataBanner onCleared={() => queryClient.invalidateQueries()} />
      <PageHeader
        title="Dashboard"
        description="ERISA compliance overview for all your clients"
      />
      <StatsRow stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <UpcomingDeadlines tasks={tasks} clients={clients} />
        <ComplianceOverview tasks={tasks} />
      </div>

      <div className="mt-6">
        <ThresholdAlerts clients={clients} plans={plans} />
      </div>
    </div>
  );
}