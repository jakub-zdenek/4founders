"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LaunchAssessmentForm({ projectId, supportRequestId }: { projectId: string; supportRequestId?: string }) {
  const [blockers, setBlockers] = useState("");
  const [fixes, setFixes] = useState("");
  const [recommendation, setRecommendation] = useState("READY_WITH_FIXES");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    setState("saving");
    const response = await fetch("/api/expert-support/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        supportRequestId,
        blockers,
        fixes,
        recommendation,
      }),
    });

    setState(response.ok ? "done" : "error");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Readiness Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Blockers</Label>
          <Textarea rows={3} value={blockers} onChange={(e) => setBlockers(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Fixes</Label>
          <Textarea rows={3} value={fixes} onChange={(e) => setFixes(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Recommendation</Label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="NOT_READY">Not ready</option>
            <option value="READY_WITH_FIXES">Ready with fixes</option>
            <option value="READY_FOR_GO_LIVE">Ready for go-live</option>
          </select>
        </div>
        <Button onClick={submit} disabled={state === "saving"}>{state === "saving" ? "Submitting..." : "Save assessment"}</Button>
        {state === "done" && <p className="text-sm text-emerald-700">Assessment saved.</p>}
        {state === "error" && <p className="text-sm text-red-600">Failed to save.</p>}
      </CardContent>
    </Card>
  );
}
