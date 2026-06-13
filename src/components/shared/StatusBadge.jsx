import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  pending_review: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  na: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground",
  prospect: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground",
  final: "bg-primary/10 text-primary border-primary/20",
  filed: "bg-success/10 text-success border-success/20",
  distributed: "bg-success/10 text-success border-success/20",
  archived: "bg-muted text-muted-foreground",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground",
};

const labels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  pending_review: "Pending Review",
  completed: "Completed",
  overdue: "Overdue",
  na: "N/A",
  active: "Active",
  inactive: "Inactive",
  prospect: "Prospect",
  draft: "Draft",
  final: "Final",
  filed: "Filed",
  distributed: "Distributed",
  archived: "Archived",
  terminated: "Terminated",
  pending: "Pending",
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function StatusBadge({ status, className }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {labels[status] || status?.replace(/_/g, " ")}
    </Badge>
  );
}