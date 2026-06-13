import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.07] -translate-y-6 translate-x-6", stat.color)} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-heading font-bold mt-1.5">{stat.value}</p>
              {stat.sub && <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>}
            </div>
            <div className={cn("p-2 rounded-lg", stat.color, "bg-opacity-10")}>
              <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}