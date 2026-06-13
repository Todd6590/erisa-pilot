import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

export default function ClientForm({ open, onClose, onSubmit, client }) {
  const [form, setForm] = useState(client || {
    company_name: "",
    ein: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    industry: "",
    total_employees: "",
    plan_year_start: "",
    plan_year_end: "",
    status: "active",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      total_employees: form.total_employees ? Number(form.total_employees) : undefined,
    });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label>Company Name *</Label>
              <Input value={form.company_name} onChange={e => update("company_name", e.target.value)} required />
            </div>
            <div>
              <Label>EIN</Label>
              <Input value={form.ein} onChange={e => update("ein", e.target.value)} placeholder="XX-XXXXXXX" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact Name</Label>
              <Input value={form.contact_name} onChange={e => update("contact_name", e.target.value)} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={e => update("contact_email", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={form.contact_phone} onChange={e => update("contact_phone", e.target.value)} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry} onChange={e => update("industry", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={e => update("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={e => update("city", e.target.value)} />
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.state} onValueChange={v => update("state", v)}>
                <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ZIP</Label>
              <Input value={form.zip} onChange={e => update("zip", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Employees</Label>
              <Input type="number" value={form.total_employees} onChange={e => update("total_employees", e.target.value)} />
            </div>
            <div>
              <Label>Plan Year Start</Label>
              <Input type="date" value={form.plan_year_start} onChange={e => update("plan_year_start", e.target.value)} />
            </div>
            <div>
              <Label>Plan Year End</Label>
              <Input type="date" value={form.plan_year_end} onChange={e => update("plan_year_end", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{client ? "Update Client" : "Add Client"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}