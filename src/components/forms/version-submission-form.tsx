"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function VersionSubmissionForm({ projectId }: { projectId: string }) {
  const [changelog, setChangelog] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    setState("saving");
    const response = await fetch(`/api/projects/${projectId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        changelog,
      }),
    });

    setState(response.ok ? "done" : "error");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Improved Version</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={4} value={changelog} onChange={(e) => setChangelog(e.target.value)} placeholder="What improved in this version?" />
        <Button onClick={submit} disabled={state === "saving"}>
          {state === "saving" ? "Submitting..." : "Submit version"}
        </Button>
        {state === "done" && <p className="text-sm text-emerald-700">Version submitted.</p>}
        {state === "error" && <p className="text-sm text-red-600">Failed to submit version.</p>}
      </CardContent>
    </Card>
  );
}
