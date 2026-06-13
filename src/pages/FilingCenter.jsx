import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";

export default function FilingCenter() {
  const [selectedClient, setSelectedClient] = useState("all");
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => base44.entities.ComplianceTask.list() });
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: () => base44.entities.BenefitPlan.list() });

  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c; });

  const filteredTasks = selectedClient === "all" ? tasks : tasks.filter(t => t.client_id === selectedClient);

  // Group by client
  const clientGroups = {};
  filteredTasks.forEach(t => {
    if (!clientGroups[t.client_id]) clientGroups[t.client_id] = [];
    clientGroups[t.client_id].push(t);
  });

  const generateTasks = async (clientId) => {
    setGenerating(true);
    const client = clientMap[clientId];
    const clientPlans = plans.filter(p => p.client_id === clientId && p.status === "active");
    const totalParticipants = clientPlans.reduce((sum, p) => sum + (p.participant_count || 0), 0);
    const year = new Date().getFullYear().toString();
    const planYearEnd = client?.plan_year_end ? new Date(client.plan_year_end) : new Date(year, 11, 31);

    const tasksToCreate = [];
    const addMonths = (date, months) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d;
    };

    // Form 5500 (7 months after plan year end)
    const form5500Due = addMonths(planYearEnd, 7);
    tasksToCreate.push({
      client_id: clientId, task_type: "form_5500",
      title: `Form 5500 Annual Return — ${year}`,
      description: `Annual return/report for plan year ${year}. ${totalParticipants >= 100 ? "LARGE PLAN: Independent audit required." : "Small plan filing."}`,
      due_date: format(form5500Due, "yyyy-MM-dd"),
      reminder_date: format(addMonths(form5500Due, -1), "yyyy-MM-dd"),
      status: "not_started", priority: "high", plan_year: year,
    });

    // Schedule A for each insured plan
    clientPlans.filter(p => p.funding_type === "fully_insured").forEach(plan => {
      tasksToCreate.push({
        client_id: clientId, plan_id: plan.id, task_type: "schedule_a",
        title: `Schedule A — ${plan.plan_name} — ${year}`,
        description: `Insurance information for ${plan.carrier || "carrier"}. Report premiums and commissions.`,
        due_date: format(form5500Due, "yyyy-MM-dd"),
        status: "not_started", priority: "medium", plan_year: year,
      });
    });

    // SAR (9 months after plan year end, or 2 months after 5500 due)
    const sarDue = addMonths(planYearEnd, 9);
    tasksToCreate.push({
      client_id: clientId, task_type: "sar",
      title: `Summary Annual Report (SAR) — ${year}`,
      description: "Distribute SAR to all plan participants within 9 months of plan year end.",
      due_date: format(sarDue, "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    // SBC (at renewal)
    tasksToCreate.push({
      client_id: clientId, task_type: "sbc",
      title: `Summary of Benefits and Coverage (SBC) — ${year}`,
      description: "Distribute SBC to participants at open enrollment and upon request.",
      due_date: format(addMonths(planYearEnd, -1), "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    // SPD review
    tasksToCreate.push({
      client_id: clientId, task_type: "spd",
      title: `SPD Review — ${year}`,
      description: "Review and update Summary Plan Description. Must be redistributed every 5 years (or 10 if no changes).",
      due_date: format(addMonths(planYearEnd, 4), "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    // Wrap Document
    tasksToCreate.push({
      client_id: clientId, task_type: "wrap_document",
      title: `Wrap Plan Document Review — ${year}`,
      description: "Ensure wrap document is current and incorporates all benefit plans under ERISA.",
      due_date: format(addMonths(planYearEnd, 3), "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    // MEWA
    const mewaPlans = clientPlans.filter(p => p.is_mewa);
    if (mewaPlans.length > 0) {
      tasksToCreate.push({
        client_id: clientId, task_type: "form_m1",
        title: `Form M-1 (MEWA) — ${year}`,
        description: "Annual filing for Multiple Employer Welfare Arrangement.",
        due_date: format(new Date(parseInt(year) + 1, 2, 1), "yyyy-MM-dd"),
        status: "not_started", priority: "high", plan_year: year,
      });
    }

    // Large plan audit
    if (totalParticipants >= 100) {
      tasksToCreate.push({
        client_id: clientId, task_type: "plan_audit",
        title: `Independent Plan Audit — ${year}`,
        description: `${totalParticipants} participants. Large plan requires independent qualified public accountant audit.`,
        due_date: format(addMonths(form5500Due, -2), "yyyy-MM-dd"),
        status: "not_started", priority: "critical", plan_year: year,
      });
    }

    // Fidelity Bond
    tasksToCreate.push({
      client_id: clientId, task_type: "fidelity_bond",
      title: `Fidelity Bond Verification — ${year}`,
      description: "Verify fidelity bond coverage: minimum 10% of plan assets handled, $1,000 minimum.",
      due_date: format(addMonths(planYearEnd, 1), "yyyy-MM-dd"),
      status: "not_started", priority: "low", plan_year: year,
    });

    // COBRA
    tasksToCreate.push({
      client_id: clientId, task_type: "cobra_notice",
      title: `COBRA General Notice — ${year}`,
      description: "Provide COBRA general rights notice to new participants within 90 days of coverage start.",
      due_date: format(addMonths(planYearEnd, 3), "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    // Medicare Part D
    tasksToCreate.push({
      client_id: clientId, task_type: "medicare_part_d_notice",
      title: `Medicare Part D Creditable Coverage Notice — ${year}`,
      description: "Annual notice to Medicare-eligible individuals before October 15.",
      due_date: format(new Date(parseInt(year), 9, 15), "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    // PCORI Fee
    tasksToCreate.push({
      client_id: clientId, task_type: "pcori_fee",
      title: `PCORI Fee Payment — ${year}`,
      description: "Patient-Centered Outcomes Research Institute fee due July 31 for self-funded plans.",
      due_date: format(new Date(parseInt(year), 6, 31), "yyyy-MM-dd"),
      status: "not_started", priority: "medium", plan_year: year,
    });

    await base44.entities.ComplianceTask.bulkCreate(tasksToCreate);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setGenerating(false);
  };

  return (
    <div>
      <PageHeader title="Filing Center" description="Generate and manage compliance filing schedules">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.filter(c => c.status === "active").map(c => (
              <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Generate Tasks Card */}
      <Card className="mb-6 border-dashed">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-sm">Auto-Generate Compliance Tasks</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically creates all required ERISA compliance tasks for a client based on their plans and participant counts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedClient === "all" ? "" : selectedClient} onValueChange={v => { setSelectedClient(v); }}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Pick a client" /></SelectTrigger>
                <SelectContent>
                  {clients.filter(c => c.status === "active").map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedClient || selectedClient === "all" || generating}
                onClick={() => generateTasks(selectedClient)}
                className="gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filing Status by Client */}
      {Object.entries(clientGroups).map(([clientId, clientTasks]) => {
        const client = clientMap[clientId];
        const completed = clientTasks.filter(t => t.status === "completed").length;
        const overdue = clientTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "na").length;

        return (
          <Card key={clientId} className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">{client?.company_name || "Unknown"}</CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3.5 h-3.5" />{completed} completed</span>
                  {overdue > 0 && <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="w-3.5 h-3.5" />{overdue} overdue</span>}
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" />{clientTasks.length} total</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div className="bg-success h-1.5 rounded-full transition-all" style={{ width: `${clientTasks.length > 0 ? (completed / clientTasks.length) * 100 : 0}%` }} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-1.5">
                {clientTasks.sort((a, b) => new Date(a.due_date || "9999") - new Date(b.due_date || "9999")).map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{task.title}</span>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground shrink-0">{format(new Date(task.due_date), "MMM d, yyyy")}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {Object.keys(clientGroups).length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No filing tasks yet. Select a client and generate tasks.</p>
        </div>
      )}
    </div>
  );
}