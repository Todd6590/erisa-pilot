import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = {
  completed: "hsl(152, 55%, 40%)",
  in_progress: "hsl(215, 60%, 28%)",
  pending_review: "hsl(38, 92%, 50%)",
  not_started: "hsl(215, 10%, 75%)",
  overdue: "hsl(0, 72%, 51%)",
};

const LABELS = {
  completed: "Completed",
  in_progress: "In Progress",
  pending_review: "Pending Review",
  not_started: "Not Started",
  overdue: "Overdue",
};

export default function ComplianceOverview({ tasks }) {
  const statusCounts = {};
  tasks.forEach(t => {
    if (t.status === "na") return;
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const data = Object.entries(statusCounts).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    fill: COLORS[key] || "#ccc",
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No tasks to display</p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={32}
                    outerRadius={56}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Tasks"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {data.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}