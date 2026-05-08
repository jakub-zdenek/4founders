"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function VotePanel({ projectId }: { projectId: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function vote(type: "CONFIDENCE" | "IMPROVEMENT") {
    setState("saving");

    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        type,
        value: 8,
        confidence: 7,
      }),
    });

    setState(response.ok ? "done" : "error");
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => void vote("CONFIDENCE")}>Confidence vote</Button>
      <Button size="sm" variant="outline" onClick={() => void vote("IMPROVEMENT")}>Improvement vote</Button>
      {state === "done" && <span className="text-xs text-emerald-700">Vote recorded</span>}
      {state === "error" && <span className="text-xs text-red-600">Vote failed</span>}
    </div>
  );
}
