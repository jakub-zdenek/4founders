"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReviewSchema, type CreateReviewInput } from "@/features/reviews/review.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const dimensions = [
  "PROBLEM_CLARITY",
  "VALUE_PROPOSITION_CLARITY",
  "PRODUCT_USABILITY",
  "TECHNICAL_QUALITY",
  "DOCUMENTATION_QUALITY",
  "DIFFERENTIATION",
  "ADOPTION_READINESS",
  "LAUNCH_READINESS",
  "IMPROVEMENT_RESPONSIVENESS",
  "TRUST_AND_SAFETY_HYGIENE",
] as const;

export function ReviewSubmissionForm({
  projectId,
  versionId,
}: {
  projectId: string;
  versionId?: string;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      projectId,
      projectVersionId: versionId,
      confidenceLevel: "MEDIUM",
      whatWorks: "",
      whatIsWeak: "",
      whatIsUnclear: "",
      highestPriorityImprovement: "",
      scores: dimensions.map((dimension) => ({
        dimension,
        score: 7,
        rationale: "Evidence and product behavior support this score.",
      })),
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Structured Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
            });
          })}
        >
          <div className="space-y-2">
            <Label>What works</Label>
            <Textarea rows={3} {...form.register("whatWorks")} />
          </div>
          <div className="space-y-2">
            <Label>What is weak</Label>
            <Textarea rows={3} {...form.register("whatIsWeak")} />
          </div>
          <div className="space-y-2">
            <Label>What is unclear</Label>
            <Textarea rows={3} {...form.register("whatIsUnclear")} />
          </div>
          <div className="space-y-2">
            <Label>Highest-priority improvement</Label>
            <Textarea rows={3} {...form.register("highestPriorityImprovement")} />
          </div>
          <Button type="submit" disabled={pending}>{pending ? "Submitting..." : "Submit review"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
