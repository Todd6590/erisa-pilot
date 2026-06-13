import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarClock, AlertTriangle, ChevronRight } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import StatusBadge from "../shared/StatusBadge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const taskTypeLabels = {
  form_5500: "Form 5500",
  schedule_a: "Schedule A",
  form_m1: "Form M-1",
  spd: "SPD",
  smm: "SMM",
  sbc: "SBC",
  sar: "SAR",
  wrap_document: "Wrap Document",
  plan_document: "Plan Document",
  fidelity_bond: "Fidelity Bond",
  form_5558_extension: "Form 5558",
  cobra_notice: "COBRA Notice",
  hipaa_notice: "HIPAA Notice",
  medicare_part_d_notice: "Medicare Part D",
  whcra_notice: "WHCRA Notice",
  newborns_notice: "Newborns Notice",
  chipra_notice: "CHIPRA Notice",
  aca_reporting_1094: "ACA 1094-C",
  aca_reporting_1095: "ACA 1095-C",
  pcori_fee: "PCORI Fee",
  annual_enrollment: "Annual Enrollment",
  plan_audit: "Plan Audit",
  other: "Other",
};

export default function UpcomingDeadlines({ tasks, clients }) {
  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c.company_name; });

  const upcoming = tasks
    .filter(t => t.due_date && t.status !== "completed" && t.status !== "na")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" />
            Upcoming Deadlines
          </CardTitle>
          <Link to="/compliance" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No upcoming deadlines</p>
        ) : (
          <div className="space-y-1">
            {upcoming.map((task) => {
              const daysLeft = differenceInDays(new Date(task.due_date), new Date());
              const isOverdue = isPast(new Date(task.due_date));
              return (
                <div key={task.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}
                      <p className="text-sm font-medium truncate">{task.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {clientMap[task.client_id] || "Unknown"} · {taskTypeLabels[task.task_type] || task.task_type}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={cn(
                      "text-xs font-medium",
                      isOverdue ? "text-destructive" : daysLeft <= 14 ? "text-warning" : "text-muted-foreground"
                    )}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(task.due_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}