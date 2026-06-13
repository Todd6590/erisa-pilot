import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const SAMPLE_CLIENT_IDS = [
  "6a2cda624b3b6ed3d802f537",
  "6a2cda624b3b6ed3d802f538",
  "6a2cda624b3b6ed3d802f539",
  "6a2cda624b3b6ed3d802f53a",
];

export default function SampleDataBanner({ onCleared }) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleClear = async () => {
    if (!window.confirm("This will permanently delete all sample clients, plans, and tasks. Are you sure?")) return;
    setLoading(true);

    // Delete tasks tied to sample clients
    for (const id of SAMPLE_CLIENT_IDS) {
      await base44.entities.ComplianceTask.filter({ client_id: id }).then(tasks =>
        Promise.all(tasks.map(t => base44.entities.ComplianceTask.delete(t.id)))
      );
      await base44.entities.BenefitPlan.filter({ client_id: id }).then(plans =>
        Promise.all(plans.map(p => base44.entities.BenefitPlan.delete(p.id)))
      );
      await base44.entities.Client.delete(id);
    }

    setLoading(false);
    if (onCleared) onCleared();
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3 rounded-lg border border-warning/40 bg-warning/8 text-sm">
      <div className="flex items-center gap-2 text-warning-foreground">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <span>
          <strong>Sample data is currently displayed.</strong> This is example information for demonstration purposes only — not real client data.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="border-warning/40 text-warning hover:bg-warning/10 gap-1.5"
          onClick={handleClear}
          disabled={loading}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {loading ? "Clearing..." : "Remove Sample Data"}
        </Button>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}