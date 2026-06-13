import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Building2, Mail, Phone, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "../components/shared/StatusBadge";
import PlanForm from "../components/plans/PlanForm";
import TaskForm from "../components/tasks/TaskForm";
import { format } from "date-fns";

const planTypeLabels = {
  medical: "Medical", dental: "Dental", vision: "Vision", life: "Life",
  disability_std: "STD", disability_ltd: "LTD", fsa: "FSA", hsa: "HSA",
  hra: "HRA", eap: "EAP", wrap: "Wrap", "401k": "401(k)", other: "Other",
};

const taskTypeLabels = {
  form_5500: "Form 5500", schedule_a: "Schedule A", form_m1: "Form M-1",
  spd: "SPD", smm: "SMM", sbc: "SBC", sar: "SAR", wrap_document: "Wrap Document",
  plan_document: "Plan Document", fidelity_bond: "Fidelity Bond",
  form_5558_extension: "Form 5558", cobra_notice: "COBRA", hipaa_notice: "HIPAA",
  medicare_part_d_notice: "Medicare Part D", aca_reporting_1094: "ACA 1094-C",
  aca_reporting_1095: "ACA 1095-C", pcori_fee: "PCORI Fee",
  annual_enrollment: "Enrollment", plan_audit: "Plan Audit", other: "Other",
};

export default function ClientDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = window.location.pathname.split("/").pop();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });
  const client = clients.find(c => c.id === clientId);

  const { data: plans = [] } = useQuery({
    queryKey: ["plans", clientId],
    queryFn: () => base44.entities.BenefitPlan.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", clientId],
    queryFn: () => base44.entities.ComplianceTask.filter({ client_id: clientId }),
    enabled: !!clientId,
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.BenefitPlan.create({ ...data, client_id: clientId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plans"] }); setShowPlanForm(false); },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.ComplianceTask.create({ ...data, client_id: clientId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setShowTaskForm(false); },
  });

  if (!client) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Client not found</p>
        <Link to="/clients" className="text-primary hover:underline text-sm mt-2 block">Back to Clients</Link>
      </div>
    );
  }

  const activePlans = plans.filter(p => p.status === "active");
  const totalParticipants = activePlans.reduce((sum, p) => sum + (p.participant_count || 0), 0);

  return (
    <div>
      <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-bold">{client.company_name}</h1>
              <StatusBadge status={client.status} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              {client.ein && <span>EIN: {client.ein}</span>}
              {client.industry && <span>{client.industry}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
          <p className="font-medium text-sm mt-1">{client.contact_name || "—"}</p>
          {client.contact_email && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Mail className="w-3 h-3" />{client.contact_email}</p>}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Employees</p>
          <p className="font-medium text-sm mt-1">{client.total_employees || "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalParticipants} plan participants</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Plans</p>
          <p className="font-medium text-sm mt-1">{activePlans.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{plans.length} total</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan Year</p>
          <p className="font-medium text-sm mt-1">
            {client.plan_year_start ? format(new Date(client.plan_year_start), "MMM d") : "—"} — {client.plan_year_end ? format(new Date(client.plan_year_end), "MMM d") : "—"}
          </p>
        </Card>
      </div>

      {totalParticipants >= 100 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 mb-6">
          <p className="text-sm font-medium text-warning">⚠ Large Plan: {totalParticipants} participants. Independent audit and large plan Form 5500 filing required.</p>
        </div>
      )}

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Benefit Plans ({plans.length})</TabsTrigger>
          <TabsTrigger value="tasks">Compliance Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowPlanForm(true)} className="gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Plan
            </Button>
          </div>
          <div className="grid gap-3">
            {plans.map(plan => (
              <Card key={plan.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{plan.plan_name}</span>
                      <StatusBadge status={plan.status} />
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{planTypeLabels[plan.plan_type] || plan.plan_type}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {plan.carrier && <span>Carrier: {plan.carrier}</span>}
                      {plan.participant_count && <span>{plan.participant_count} participants</span>}
                      {plan.annual_premium && <span>${plan.annual_premium.toLocaleString()} annual</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {plans.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No benefit plans yet</p>}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowTaskForm(true)} className="gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          </div>
          <div className="grid gap-2">
            {tasks.sort((a, b) => new Date(a.due_date || "9999") - new Date(b.due_date || "9999")).map(task => (
              <Card key={task.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{task.title}</span>
                      <StatusBadge status={task.status} />
                      <StatusBadge status={task.priority} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {taskTypeLabels[task.task_type] || task.task_type}
                      {task.due_date && ` · Due: ${format(new Date(task.due_date), "MMM d, yyyy")}`}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No compliance tasks yet</p>}
          </div>
        </TabsContent>
      </Tabs>

      {showPlanForm && (
        <PlanForm open onClose={() => setShowPlanForm(false)} onSubmit={data => createPlanMutation.mutate(data)} clients={[client]} defaultClientId={clientId} />
      )}
      {showTaskForm && (
        <TaskForm open onClose={() => setShowTaskForm(false)} onSubmit={data => createTaskMutation.mutate(data)} clients={[client]} defaultClientId={clientId} />
      )}
    </div>
  );
}