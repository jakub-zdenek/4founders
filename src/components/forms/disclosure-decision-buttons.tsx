"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DisclosureDecisionButtons({ requestId }: { requestId: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function decide(approved: boolean) {
    setState("saving");

    const response = await fetch(`/api/visibility/request/${requestId}/decision`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });

    setState(response.ok ? "done" : "error");
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => void decide(true)} disabled={state === "saving"}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => void decide(false)} disabled={state === "saving"}>
        Reject
      </Button>
      {state === "done" && <span className="text-xs text-emerald-700">Saved</span>}
      {state === "error" && <span className="text-xs text-red-600">Failed</span>}
    </div>
  );
}
