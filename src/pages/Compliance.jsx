import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, isPast } from "date-fns";
import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";
import TaskForm from "../components/tasks/TaskForm";

const taskTypeLabels = {
  form_5500: "Form 5500", schedule_a: "Schedule A", form_m1: "Form M-1",
  spd: "SPD", smm: "SMM", sbc: "SBC", sar: "SAR", wrap_document: "Wrap Document",
  plan_document: "Plan Document", fidelity_bond: "Fidelity Bond",
  form_5558_extension: "Form 5558", cobra_notice: "COBRA",
  hipaa_notice: "HIPAA", medicare_part_d_notice: "Medicare Part D",
  whcra_notice: "WHCRA", newborns_notice: "Newborns' Act",
  chipra_notice: "CHIPRA", aca_reporting_1094: "ACA 1094-C",
  aca_reporting_1095: "ACA 1095-C", pcori_fee: "PCORI Fee",
  annual_enrollment: "Enrollment", plan_audit: "Plan Audit", other: "Other",
};

export default function Compliance() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.ComplianceTask.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c.company_name; });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ComplianceTask.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ComplianceTask.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ComplianceTask.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const markComplete = (task) => {
    updateMutation.mutate({
      id: task.id,
      data: { status: "completed", completed_date: new Date().toISOString().split("T")[0] },
    });
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) ||
      clientMap[t.client_id]?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchType = typeFilter === "all" || t.task_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  }).sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return (
    <div>
      <PageHeader title="Compliance Tasks" description="Track all ERISA compliance requirements">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(taskTypeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        {filtered.map(task => {
          const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "completed" && task.status !== "na";
          return (
            <Card key={task.id} className={`p-4 hover:shadow-sm transition-shadow ${isOverdue ? "border-destructive/30" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}
                    <span className="text-sm font-medium">{task.title}</span>
                    <StatusBadge status={isOverdue ? "overdue" : task.status} />
                    <StatusBadge status={task.priority} />
                    {task.extension_filed && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Extended</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>{clientMap[task.client_id] || "—"}</span>
                    <span>{taskTypeLabels[task.task_type] || task.task_type}</span>
                    {task.due_date && <span>Due: {format(new Date(task.due_date), "MMM d, yyyy")}</span>}
                    {task.plan_year && <span>Plan Year: {task.plan_year}</span>}
                    {task.assigned_to && <span>Assigned: {task.assigned_to}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {task.status !== "completed" && (
                    <Button variant="ghost" size="icon" onClick={() => markComplete(task)} title="Mark Complete">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(task)}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMutation.mutate(task.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No compliance tasks found</p>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm open onClose={() => setShowForm(false)} onSubmit={data => createMutation.mutate(data)} clients={clients} />
      )}
      {editing && (
        <TaskForm open task={editing} onClose={() => setEditing(null)} onSubmit={data => updateMutation.mutate({ id: editing.id, data })} clients={clients} />
      )}
    </div>
  );
}