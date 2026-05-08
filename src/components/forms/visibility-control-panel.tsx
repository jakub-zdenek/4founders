"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VisibilityControlPanel({ projectId, defaultVisibility }: { projectId: string; defaultVisibility: string }) {
  const [mode, setMode] = useState(defaultVisibility);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function save() {
    setState("saving");
    const response = await fetch(`/api/projects/${projectId}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibilityMode: mode }),
    });

    setState(response.ok ? "done" : "error");
  }

  return (
    <Card>
      <CardHeader><CardTitle>Visibility control panel</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm">
          <option value="PUBLIC">Public</option>
          <option value="LIMITED">Limited</option>
          <option value="PROTECTED">Protected</option>
          <option value="EXPERT_ONLY">Expert-only</option>
        </select>
        <Button onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving..." : "Save visibility"}</Button>
        {state === "done" && <p className="text-sm text-emerald-700">Visibility updated.</p>}
        {state === "error" && <p className="text-sm text-red-600">Failed to update visibility.</p>}
      </CardContent>
    </Card>
  );
}
