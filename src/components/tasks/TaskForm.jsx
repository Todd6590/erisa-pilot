import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TASK_TYPES = [
  { value: "form_5500", label: "Form 5500 Annual Return" },
  { value: "schedule_a", label: "Schedule A (Insurance Info)" },
  { value: "form_m1", label: "Form M-1 (MEWA)" },
  { value: "form_5558_extension", label: "Form 5558 Extension" },
  { value: "spd", label: "Summary Plan Description (SPD)" },
  { value: "smm", label: "Summary of Material Modifications (SMM)" },
  { value: "sbc", label: "Summary of Benefits & Coverage (SBC)" },
  { value: "sar", label: "Summary Annual Report (SAR)" },
  { value: "wrap_document", label: "Wrap Plan Document" },
  { value: "plan_document", label: "Plan Document" },
  { value: "fidelity_bond", label: "Fidelity Bond" },
  { value: "cobra_notice", label: "COBRA Notice" },
  { value: "hipaa_notice", label: "HIPAA Notice of Privacy Practices" },
  { value: "medicare_part_d_notice", label: "Medicare Part D Creditable Coverage" },
  { value: "whcra_notice", label: "WHCRA Notice" },
  { value: "newborns_notice", label: "Newborns' Act Notice" },
  { value: "chipra_notice", label: "CHIPRA Notice" },
  { value: "aca_reporting_1094", label: "ACA Reporting (1094-C)" },
  { value: "aca_reporting_1095", label: "ACA Reporting (1095-C)" },
  { value: "pcori_fee", label: "PCORI Fee Payment" },
  { value: "annual_enrollment", label: "Annual Enrollment" },
  { value: "plan_audit", label: "Plan Audit" },
  { value: "other", label: "Other" },
];

export default function TaskForm({ open, onClose, onSubmit, task, clients, plans, defaultClientId }) {
  const [form, setForm] = useState(task || {
    client_id: defaultClientId || "",
    plan_id: "",
    task_type: "form_5500",
    title: "",
    description: "",
    due_date: "",
    reminder_date: "",
    status: "not_started",
    priority: "medium",
    assigned_to: "",
    plan_year: new Date().getFullYear().toString(),
    filing_year: new Date().getFullYear().toString(),
    extension_filed: false,
    extended_due_date: "",
    notes: "",
  });

  const update = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-set title based on type
      if (field === "task_type" && !prev.title) {
        const type = TASK_TYPES.find(t => t.value === value);
        if (type) next.title = `${type.label} — ${next.plan_year}`;
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{task ? "Edit Compliance Task" : "Add Compliance Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {!defaultClientId && (
            <div>
              <Label>Client *</Label>
              <Select value={form.client_id} onValueChange={v => update("client_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Task Type *</Label>
              <Select value={form.task_type} onValueChange={v => update("task_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => update("title", e.target.value)} required />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => update("description", e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Plan Year</Label>
              <Input value={form.plan_year} onChange={e => update("plan_year", e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => update("due_date", e.target.value)} />
            </div>
            <div>
              <Label>Reminder Date</Label>
              <Input type="date" value={form.reminder_date} onChange={e => update("reminder_date", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => update("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input value={form.assigned_to} onChange={e => update("assigned_to", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.extension_filed} onCheckedChange={v => update("extension_filed", v)} />
              <Label>Extension Filed (Form 5558)</Label>
            </div>
          </div>

          {form.extension_filed && (
            <div>
              <Label>Extended Due Date</Label>
              <Input type="date" value={form.extended_due_date} onChange={e => update("extended_due_date", e.target.value)} />
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{task ? "Update Task" : "Add Task"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}