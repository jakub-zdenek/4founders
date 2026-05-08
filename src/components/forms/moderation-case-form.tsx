"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ModerationCaseForm() {
  const [projectId, setProjectId] = useState("");
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    setState("saving");
    const response = await fetch("/api/moderation/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, reason }),
    });

    setState(response.ok ? "done" : "error");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Moderation Case</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          placeholder="Project ID"
          className="h-10 w-full rounded-md border border-border px-3 text-sm"
        />
        <Textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
        <Button onClick={submit} disabled={state === "saving"}>
          {state === "saving" ? "Saving..." : "Create case"}
        </Button>
        {state === "done" && <p className="text-sm text-emerald-700">Case created.</p>}
        {state === "error" && <p className="text-sm text-red-600">Failed to create case.</p>}
      </CardContent>
    </Card>
  );
}
