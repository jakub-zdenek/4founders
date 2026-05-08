"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ExpertSupportRequestForm({ projectId }: { projectId: string }) {
  const [requestNote, setRequestNote] = useState("");
  const [founderDisclosure, setFounderDisclosure] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    setState("saving");
    const response = await fetch("/api/expert-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, requestNote, founderDisclosure }),
    });
    setState(response.ok ? "done" : "error");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Expert Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Support request note</Label>
          <Textarea rows={4} value={requestNote} onChange={(e) => setRequestNote(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Founder disclosure constraints (optional)</Label>
          <Textarea rows={3} value={founderDisclosure} onChange={(e) => setFounderDisclosure(e.target.value)} />
        </div>
        <Button onClick={submit} disabled={state === "saving"}>
          {state === "saving" ? "Sending..." : "Request support"}
        </Button>
        {state === "done" && <p className="text-sm text-emerald-700">Request submitted.</p>}
        {state === "error" && <p className="text-sm text-red-600">Request failed.</p>}
      </CardContent>
    </Card>
  );
}
