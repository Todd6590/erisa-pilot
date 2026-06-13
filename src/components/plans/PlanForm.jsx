import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PLAN_TYPES = [
  { value: "medical", label: "Medical" },
  { value: "dental", label: "Dental" },
  { value: "vision", label: "Vision" },
  { value: "life", label: "Life Insurance" },
  { value: "disability_std", label: "Short-Term Disability" },
  { value: "disability_ltd", label: "Long-Term Disability" },
  { value: "fsa", label: "FSA" },
  { value: "hsa", label: "HSA" },
  { value: "hra", label: "HRA" },
  { value: "eap", label: "EAP" },
  { value: "wrap", label: "Wrap Plan" },
  { value: "401k", label: "401(k)" },
  { value: "other", label: "Other" },
];

export default function PlanForm({ open, onClose, onSubmit, plan, clients, defaultClientId }) {
  const [form, setForm] = useState(plan || {
    client_id: defaultClientId || "",
    plan_name: "",
    plan_type: "medical",
    carrier: "",
    policy_number: "",
    plan_number: "",
    participant_count: "",
    annual_premium: "",
    broker_commission: "",
    effective_date: "",
    renewal_date: "",
    is_erisa_covered: true,
    is_mewa: false,
    funding_type: "fully_insured",
    status: "active",
    notes: "",
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      participant_count: form.participant_count ? Number(form.participant_count) : undefined,
      annual_premium: form.annual_premium ? Number(form.annual_premium) : undefined,
      broker_commission: form.broker_commission ? Number(form.broker_commission) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{plan ? "Edit Benefit Plan" : "Add Benefit Plan"}</DialogTitle>
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
              <Label>Plan Name *</Label>
              <Input value={form.plan_name} onChange={e => update("plan_name", e.target.value)} required />
            </div>
            <div>
              <Label>Plan Type *</Label>
              <Select value={form.plan_type} onValueChange={v => update("plan_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Carrier</Label>
              <Input value={form.carrier} onChange={e => update("carrier", e.target.value)} />
            </div>
            <div>
              <Label>Policy Number</Label>
              <Input value={form.policy_number} onChange={e => update("policy_number", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Plan Number</Label>
              <Input value={form.plan_number} onChange={e => update("plan_number", e.target.value)} placeholder="e.g., 501" />
            </div>
            <div>
              <Label>Participants</Label>
              <Input type="number" value={form.participant_count} onChange={e => update("participant_count", e.target.value)} />
            </div>
            <div>
              <Label>Funding Type</Label>
              <Select value={form.funding_type} onValueChange={v => update("funding_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fully_insured">Fully Insured</SelectItem>
                  <SelectItem value="self_funded">Self-Funded</SelectItem>
                  <SelectItem value="level_funded">Level-Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Annual Premium ($)</Label>
              <Input type="number" step="0.01" value={form.annual_premium} onChange={e => update("annual_premium", e.target.value)} />
            </div>
            <div>
              <Label>Broker Commission ($)</Label>
              <Input type="number" step="0.01" value={form.broker_commission} onChange={e => update("broker_commission", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Effective Date</Label>
              <Input type="date" value={form.effective_date} onChange={e => update("effective_date", e.target.value)} />
            </div>
            <div>
              <Label>Renewal Date</Label>
              <Input type="date" value={form.renewal_date} onChange={e => update("renewal_date", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_erisa_covered} onCheckedChange={v => update("is_erisa_covered", v)} />
              <Label>ERISA Covered</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_mewa} onCheckedChange={v => update("is_mewa", v)} />
              <Label>MEWA</Label>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{plan ? "Update Plan" : "Add Plan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}