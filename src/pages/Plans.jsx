import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";
import PlanForm from "../components/plans/PlanForm";

const planTypeLabels = {
  medical: "Medical", dental: "Dental", vision: "Vision", life: "Life",
  disability_std: "STD", disability_ltd: "LTD", fsa: "FSA", hsa: "HSA",
  hra: "HRA", eap: "EAP", wrap: "Wrap", "401k": "401(k)", other: "Other",
};

export default function Plans() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.BenefitPlan.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c.company_name; });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BenefitPlan.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plans"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BenefitPlan.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["plans"] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BenefitPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });

  const filtered = plans.filter(p => {
    const matchSearch = p.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
      clientMap[p.client_id]?.toLowerCase().includes(search.toLowerCase()) ||
      p.carrier?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.plan_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Benefit Plans" description="All benefit plans across your clients">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </Button>
      </PageHeader>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(planTypeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.map(plan => (
          <Card key={plan.id} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{plan.plan_name}</span>
                  <StatusBadge status={plan.status} />
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {planTypeLabels[plan.plan_type] || plan.plan_type}
                  </span>
                  {plan.is_mewa && <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20">MEWA</span>}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span>{clientMap[plan.client_id] || "—"}</span>
                  {plan.carrier && <span>Carrier: {plan.carrier}</span>}
                  {plan.participant_count && <span>{plan.participant_count} participants</span>}
                  {plan.annual_premium && <span>${plan.annual_premium.toLocaleString()}/yr</span>}
                  {plan.funding_type && <span className="capitalize">{plan.funding_type.replace(/_/g, " ")}</span>}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(plan)}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteMutation.mutate(plan.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No benefit plans found</p>
          </div>
        )}
      </div>

      {showForm && (
        <PlanForm open onClose={() => setShowForm(false)} onSubmit={data => createMutation.mutate(data)} clients={clients} />
      )}
      {editing && (
        <PlanForm open plan={editing} onClose={() => setEditing(null)} onSubmit={data => updateMutation.mutate({ id: editing.id, data })} clients={clients} />
      )}
    </div>
  );
}