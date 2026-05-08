"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectCreateSchema, type ProjectCreateInput } from "@/features/projects/project.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  "Basic project info",
  "Category",
  "GitHub connection",
  "Visibility mode",
  "Assets and access levels",
  "Feedback goals",
  "Review and submit",
] as const;

export function ProjectWizard({ categories }: { categories: Array<{ id: string; name: string }> }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const defaultCategory = categories[0]?.id ?? "";

  const form = useForm<ProjectCreateInput>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      visibilityMode: "PROTECTED",
      categoryId: defaultCategory,
      name: "",
      valueProposition: "",
      targetUser: "",
      productStage: "pre-launch",
      githubRepoUrl: "https://github.com/",
      websiteUrl: "",
      contactInfo: "",
      privateTestCredentials: "",
      problemStatement: "",
      differentiationStatement: "",
      preferredFeedbackFocus: "",
      architectureSummary: "",
      launchGoals: "",
      knownWeaknesses: "",
      privateReviewerNotes: "",
      waitlistLink: "",
    },
  });

  const canGoBack = step > 0;
  const canGoNext = step < steps.length - 1;

  async function submit(values: ProjectCreateInput) {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Submission failed");
      setLoading(false);
      return;
    }

    const body = await response.json();
    router.push(`/app/projects/${body.project.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Step {step + 1}: {steps[step]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input id="name" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valueProposition">One-line value proposition</Label>
                <Input id="valueProposition" {...form.register("valueProposition")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="targetUser">Target user</Label>
                <Input id="targetUser" {...form.register("targetUser")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="productStage">Product stage</Label>
                <Input id="productStage" {...form.register("productStage")} placeholder="pre-launch" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                {...form.register("categoryId")}
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="githubRepoUrl">GitHub repo</Label>
                <Input id="githubRepoUrl" {...form.register("githubRepoUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website or demo link</Label>
                <Input id="websiteUrl" {...form.register("websiteUrl")} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="visibilityMode">Visibility mode</Label>
              <select
                id="visibilityMode"
                {...form.register("visibilityMode")}
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
              >
                <option value="PUBLIC">Public</option>
                <option value="LIMITED">Limited</option>
                <option value="PROTECTED">Protected</option>
                <option value="EXPERT_ONLY">Expert-only</option>
              </select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="architectureSummary">Architecture summary (optional)</Label>
              <Textarea id="architectureSummary" rows={5} {...form.register("architectureSummary")} />
              <Label htmlFor="contactInfo">Contact info (optional)</Label>
              <Input id="contactInfo" {...form.register("contactInfo")} />
              <Label htmlFor="privateTestCredentials">Private test credentials (optional)</Label>
              <Textarea id="privateTestCredentials" rows={3} {...form.register("privateTestCredentials")} />
              <Label htmlFor="privateReviewerNotes">Private reviewer notes (optional)</Label>
              <Textarea id="privateReviewerNotes" rows={5} {...form.register("privateReviewerNotes")} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <Label htmlFor="preferredFeedbackFocus">Preferred feedback focus</Label>
              <Textarea id="preferredFeedbackFocus" rows={4} {...form.register("preferredFeedbackFocus")} />
              <Label htmlFor="problemStatement">Problem statement</Label>
              <Textarea id="problemStatement" rows={4} {...form.register("problemStatement")} />
              <Label htmlFor="differentiationStatement">Differentiation statement</Label>
              <Textarea id="differentiationStatement" rows={4} {...form.register("differentiationStatement")} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3 rounded-md border border-border bg-slate-50 p-4 text-sm text-slate-700">
              <p>Review your project details and submit for structured evaluation.</p>
              <p>Default behavior keeps sensitive materials protected until you choose to disclose more.</p>
              <p>You can submit improved versions from the project versions page.</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between">
            <Button type="button" variant="outline" disabled={!canGoBack} onClick={() => setStep((x) => Math.max(0, x - 1))}>
              Back
            </Button>
            {canGoNext ? (
              <Button type="button" onClick={() => setStep((x) => Math.min(steps.length - 1, x + 1))}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit project"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
