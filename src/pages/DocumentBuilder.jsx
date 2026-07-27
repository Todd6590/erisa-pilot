import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { FileText, Sparkles, Download, Save, AlertCircle, Loader2, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";

const DOC_TYPES = [
  { id: "spd", label: "Summary Plan Description (SPD)" },
  { id: "sbc", label: "Summary of Benefits and Coverage (SBC)" },
  { id: "sar", label: "Summary Annual Report (SAR)" },
  { id: "smm", label: "Summary of Material Modifications (SMM)" },
  { id: "wrap_document", label: "Wrap Plan Document" },
  { id: "plan_document", label: "Plan Document" },
  { id: "cobra_notice", label: "COBRA Initial / Election Notice" },
  { id: "hipaa_notice", label: "HIPAA Notice of Privacy Practices" },
];

// Maps doc type id -> ComplianceDocument.document_type (creating these documents saves here)
const SAVE_AS = {
  spd: "spd", sbc: "sbc", sar: "sar", smm: "smm",
  wrap_document: "wrap_document", plan_document: "plan_document",
  cobra_notice: "cobra_notice", hipaa_notice: "hipaa_notice",
};

export default function DocumentBuilder() {
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState("spd");
  const [clientId, setClientId] = useState("");
  const [planId, setPlanId] = useState("");
  const [planYear, setPlanYear] = useState(String(new Date().getFullYear()));
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.BenefitPlan.list(),
  });

  const { data: updates = [] } = useQuery({
    queryKey: ["regulatory-updates"],
    queryFn: () => base44.entities.RegulatoryUpdate.list("-research_date", 5),
  });

  const clientPlans = plans.filter((p) => p.client_id === clientId);

  const handleGenerate = async () => {
    if (!clientId) { setError("Please select a client."); return; }
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("generateDocument", {
        document_type: docType,
        client_id: clientId,
        plan_id: planId || undefined,
        plan_year: planYear,
      });
      setResult(res.data || res);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to generate document.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.content) return;
    const filename = `${result.label || docType}_${result.client_name || clientId}_${result.plan_year || ""}.md`.replace(/\s+/g, "_");
    const blob = new Blob([result.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!result?.content) return;
    setSaving(true);
    setError("");
    try {
      const filename = `${result.label || docType}_${result.client_name || clientId}_${result.plan_year || ""}.md`.replace(/\s+/g, "_");
      const blob = new Blob([result.content], { type: "text/markdown" });
      const file = new File([blob], filename, { type: "text/markdown" });
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ComplianceDocument.create({
        client_id: clientId,
        plan_id: planId || undefined,
        document_type: SAVE_AS[docType] || "other",
        title: `${result.label || docType} — ${result.client_name || ""} (PY ${result.plan_year || planYear})`,
        file_url: uploadRes.file_url,
        plan_year: result.plan_year || planYear,
        status: "draft",
        notes: result.disclaimer || "",
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setError("");
      alert("Document saved to the Documents library.");
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to save document.");
    } finally {
      setSaving(false);
    }
  };

  const latestUpdate = updates[0];

  return (
    <div>
      <PageHeader
        title="Document Builder"
        description="Research current requirements and generate ERISA compliance documents"
      />

      {/* Latest regulatory research */}
      {latestUpdate && (
        <Card className="p-4 mb-6 border-l-4 border-l-accent">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-heading font-semibold">{latestUpdate.title}</span>
                {latestUpdate.has_updates && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                    <AlertCircle className="w-3 h-3" /> Updates found
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {latestUpdate.research_date && format(new Date(latestUpdate.research_date), "MMM d, yyyy")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{latestUpdate.summary}</p>
              {latestUpdate.findings && (
                <details className="mt-2">
                  <summary className="text-xs text-primary cursor-pointer hover:underline">View full findings</summary>
                  <div className="prose prose-sm max-w-none mt-2 text-muted-foreground">
                    <ReactMarkdown>{latestUpdate.findings}</ReactMarkdown>
                  </div>
                </details>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Generator form */}
      <Card className="p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Client / Employer</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v); setPlanId(""); }}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Benefit Plan (optional)</Label>
            <Select value={planId} onValueChange={setPlanId} disabled={!clientId}>
              <SelectTrigger><SelectValue placeholder={clientId ? "All / General" : "Select client first"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All / General</SelectItem>
                {clientPlans.map((p) => <SelectItem key={p.id} value={p.id}>{p.plan_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Plan Year</Label>
            <Input value={planYear} onChange={(e) => setPlanYear(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={generating || !clientId} className="gap-2 w-full sm:w-auto">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Researching & generating..." : "Generate Document"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-destructive bg-destructive/5 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Result preview */}
      {result && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-heading font-semibold text-sm">{result.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {result.client_name} — Plan Year {result.plan_year}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save to Library"}
              </Button>
            </div>
          </div>

          {result.disclaimer && (
            <div className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
              {result.disclaimer}
            </div>
          )}

          <div className="prose prose-sm max-w-none border-t pt-4">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>

          {result.sources?.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Sources reviewed</p>
              <ul className="space-y-1">
                {result.sources.map((s, i) => (
                  <li key={i} className="text-xs">
                    <a href={s} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all inline-flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 shrink-0" /> {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}