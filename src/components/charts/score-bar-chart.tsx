"use client";

import { cn } from "@/lib/utils";

export function ScoreBarChart({
  items,
}: {
  items: Array<{ label: string; score: number }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{item.label}</span>
            <span>{item.score.toFixed(1)}/10</span>
          </div>
          <div className="h-2 rounded bg-slate-200">
            <div
              className={cn("h-2 rounded bg-cyan-700")}
              style={{ width: `${Math.min(100, item.score * 10)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
