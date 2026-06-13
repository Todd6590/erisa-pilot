import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Upload, FileText, Download, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";

const DOC_TYPES = [
  { value: "form_5500", label: "Form 5500" },
  { value: "schedule_a", label: "Schedule A" },
  { value: "schedule_c", label: "Schedule C" },
  { value: "schedule_h", label: "Schedule H" },
  { value: "schedule_i", label: "Schedule I" },
  { value: "form_m1", label: "Form M-1" },
  { value: "form_5558", label: "Form 5558" },
  { value: "spd", label: "SPD" },
  { value: "smm", label: "SMM" },
  { value: "sbc", label: "SBC" },
  { value: "sar", label: "SAR" },
  { value: "wrap_document", label: "Wrap Document" },
  { value: "plan_document", label: "Plan Document" },
  { value: "trust_agreement", label: "Trust Agreement" },
  { value: "fidelity_bond", label: "Fidelity Bond" },
  { value: "cobra_notice", label: "COBRA Notice" },
  { value: "hipaa_notice", label: "HIPAA Notice" },
  { value: "aca_1094", label: "ACA 1094-C" },
  { value: "aca_1095", label: "ACA 1095-C" },
  { value: "audit_report", label: "Audit Report" },
  { value: "carrier_certificate", label: "Carrier Certificate" },
  { value: "other", label: "Other" },
];

export default function Documents() {
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ client_id: "", document_type: "form_5500", title: "", plan_year: new Date().getFullYear().toString(), status: "draft", notes: "" });
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.ComplianceDocument.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c.company_name; });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ComplianceDocument.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["documents"] }); setShowUpload(false); setFile(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ComplianceDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    let fileUrl = "";
    if (file) {
      const result = await base44.integrations.Core.UploadFile({ file });
      fileUrl = result.file_url;
    }
    createMutation.mutate({ ...form, file_url: fileUrl });
    setUploading(false);
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) ||
      clientMap[d.client_id]?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || d.document_type === typeFilter;
    return matchSearch && matchType;
  });

  const docLabel = (type) => DOC_TYPES.find(d => d.value === type)?.label || type;

  return (
    <div>
      <PageHeader title="Documents" description="Compliance documents and filings">
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </PageHeader>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.map(doc => (
          <Card key={doc.id} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{doc.title}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{clientMap[doc.client_id] || "—"}</span>
                    <span>{docLabel(doc.document_type)}</span>
                    {doc.plan_year && <span>PY {doc.plan_year}</span>}
                    <span>{format(new Date(doc.created_date), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {doc.file_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4" /></a>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteMutation.mutate(doc.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No documents found</p>
          </div>
        )}
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-2">
            <div>
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={v => setForm(p => ({ ...p, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select value={form.document_type} onValueChange={v => setForm(p => ({ ...p, document_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plan Year</Label>
                <Input value={form.plan_year} onChange={e => setForm(p => ({ ...p, plan_year: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <Label>File</Label>
              <Input type="file" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}