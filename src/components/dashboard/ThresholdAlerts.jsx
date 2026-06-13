import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Users, FileCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThresholdAlerts({ clients, plans }) {
  const alerts = [];

  // Check 100-participant threshold for each client
  clients.forEach(client => {
    const clientPlans = plans.filter(p => p.client_id === client.id && p.status === "active");
    const totalParticipants = clientPlans.reduce((sum, p) => sum + (p.participant_count || 0), 0);

    if (totalParticipants >= 100) {
      alerts.push({
        type: "audit",
        icon: Users,
        title: `${client.company_name} — Plan Audit Required`,
        description: `${totalParticipants} participants (≥100). Large plan filing and independent audit required.`,
        severity: "high",
      });
    } else if (totalParticipants >= 80) {
      alerts.push({
        type: "threshold",
        icon: Users,
        title: `${client.company_name} — Approaching 100 Participants`,
        description: `${totalParticipants} participants. Nearing large plan audit threshold.`,
        severity: "medium",
      });
    }

    // Check fidelity bond requirements
    if (totalParticipants > 0) {
      const hasBond = clientPlans.some(p => p.plan_type === "401k" || p.plan_type === "other");
      if (hasBond) {
        alerts.push({
          type: "bond",
          icon: Shield,
          title: `${client.company_name} — Fidelity Bond Review`,
          description: "Verify fidelity bond coverage meets ERISA minimum (10% of plan assets, min $1,000).",
          severity: "low",
        });
      }
    }

    // MEWA check
    const mewaPlans = clientPlans.filter(p => p.is_mewa);
    if (mewaPlans.length > 0) {
      alerts.push({
        type: "mewa",
        icon: FileCheck,
        title: `${client.company_name} — Form M-1 Required`,
        description: `${mewaPlans.length} MEWA plan(s) detected. Annual Form M-1 filing required.`,
        severity: "high",
      });
    }
  });

  const severityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Compliance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 6).map((alert, i) => (
              <div key={i} className={cn(
                "p-3 rounded-lg border",
                alert.severity === "high" ? "bg-destructive/5 border-destructive/15" :
                alert.severity === "medium" ? "bg-warning/5 border-warning/15" :
                "bg-muted/50 border-border"
              )}>
                <div className="flex items-start gap-2.5">
                  <alert.icon className={cn(
                    "w-4 h-4 mt-0.5 shrink-0",
                    alert.severity === "high" ? "text-destructive" :
                    alert.severity === "medium" ? "text-warning" : "text-muted-foreground"
                  )} />
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}