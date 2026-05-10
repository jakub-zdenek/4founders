"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectCreateSchema, type ProjectCreateInput } from "@/features/projects/project.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  "Profile and motivation",
  "Area",
  "Problem",
  "Users",
  "Solution",
  "Presentation",
  "Feedback and disclosure",
  "Support needed",
  "Team building",
  "Progress and submit",
] as const;

const visibilityOptions = [
  {
    value: "PUBLIC",
    label: "Public project",
    description: "Visible publicly for broad feedback and early-user interest.",
  },
  {
    value: "LIMITED",
    label: "Semi-private project",
    description: "Visible only to approved reviewers and trusted platform members.",
  },
  {
    value: "PROTECTED",
    label: "Private review mode",
    description: "Limited disclosure with no public details until you decide to open up.",
  },
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
      productStage: "idea / early prototype",
      githubRepoUrl: "https://github.com/",
      websiteUrl: "",
      contactInfo: "",
      privateTestCredentials: "",
      founderMotivation: "",
      problemStatement: "",
      solutionApproach: "",
      differentiationStatement: "",
      preferredFeedbackFocus: "",
      presentationUrl: "",
      sharingPreference: "",
      supportNeeded: "",
      teamBuildingInterest: false,
      teamNeeds: "",
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
        <CardDescription>
          Founder-first onboarding: share only what helps reviewers understand your work and protect
          anything that should stay private.
        </CardDescription>
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
                <Label htmlFor="founderMotivation">Tell us about you, your drive, and your motivation</Label>
                <Textarea
                  id="founderMotivation"
                  rows={5}
                  placeholder="Why are you the person or team that cares enough to solve this?"
                  {...form.register("founderMotivation")}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                In the beginning, 4Founders is intentionally restricted to a few narrow areas so
                reviewers can compare projects fairly and give useful feedback.
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Choose the area you are working on</Label>
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
              <div className="space-y-2">
                <Label htmlFor="productStage">Current stage</Label>
                <Input id="productStage" {...form.register("productStage")} placeholder="idea / prototype / private beta" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problemStatement">What problem do you want to solve, and why?</Label>
                <Textarea id="problemStatement" rows={5} {...form.register("problemStatement")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="differentiationStatement">Why is this different or worth doing now?</Label>
                <Textarea id="differentiationStatement" rows={5} {...form.register("differentiationStatement")} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="targetUser">Who will benefit, and who will be the user?</Label>
              <Textarea
                id="targetUser"
                rows={5}
                placeholder="Describe the first users, their pain, and how they benefit."
                {...form.register("targetUser")}
              />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="solutionApproach">Describe how you want to solve it</Label>
                <Textarea id="solutionApproach" rows={5} {...form.register("solutionApproach")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubRepoUrl">GitHub repo or project link</Label>
                <Input id="githubRepoUrl" {...form.register("githubRepoUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website or demo link</Label>
                <Input id="websiteUrl" {...form.register("websiteUrl")} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="presentationUrl">Short video or presentation link</Label>
                <Input
                  id="presentationUrl"
                  placeholder="https://..."
                  {...form.register("presentationUrl")}
                />
                <p className="text-xs text-slate-500">
                  Present your idea to the world without exposing sensitive implementation details.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="architectureSummary">Architecture summary (optional)</Label>
                <Textarea id="architectureSummary" rows={5} {...form.register("architectureSummary")} />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="preferredFeedbackFocus">What feedback do you want?</Label>
                <Textarea id="preferredFeedbackFocus" rows={4} {...form.register("preferredFeedbackFocus")} />
              </div>
              <div className="grid gap-3">
                <Label>How much do you want to share?</Label>
                {visibilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer gap-3 rounded-lg border border-border bg-white p-4 text-sm"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...form.register("visibilityMode")}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-semibold text-slate-900">{option.label}</span>
                      <span className="text-slate-600">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sharingPreference">Disclosure notes (optional)</Label>
                <Textarea
                  id="sharingPreference"
                  rows={3}
                  placeholder="Tell reviewers what is public, what is sensitive, and what should stay private."
                  {...form.register("sharingPreference")}
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportNeeded">What help or support are you looking for?</Label>
                <Textarea id="supportNeeded" rows={5} {...form.register("supportNeeded")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact info (optional)</Label>
                  <Input id="contactInfo" {...form.register("contactInfo")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waitlistLink">Waitlist link (optional)</Label>
                  <Input id="waitlistLink" {...form.register("waitlistLink")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="privateTestCredentials">Private test credentials (optional)</Label>
                <Textarea id="privateTestCredentials" rows={3} {...form.register("privateTestCredentials")} />
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-4 text-sm">
                <input type="checkbox" {...form.register("teamBuildingInterest")} className="mt-1" />
                <span>
                  <span className="block font-semibold text-slate-900">I want to start building my team</span>
                  <span className="text-slate-600">
                    Show that you are open to collaborators, mentors, testers, or early contributors.
                  </span>
                </span>
              </label>
              <div className="space-y-2">
                <Label htmlFor="teamNeeds">What kind of people would you like to meet?</Label>
                <Textarea id="teamNeeds" rows={4} {...form.register("teamNeeds")} />
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
                After submission, reviewers will give structured feedback. You can improve the project,
                submit new versions, and see how your product progresses over time.
              </div>
              <div className="space-y-2">
                <Label htmlFor="knownWeaknesses">Known weaknesses or risks (optional)</Label>
                <Textarea id="knownWeaknesses" rows={4} {...form.register("knownWeaknesses")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="launchGoals">Launch goals (optional)</Label>
                <Textarea id="launchGoals" rows={4} {...form.register("launchGoals")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privateReviewerNotes">Private reviewer notes (optional)</Label>
                <Textarea id="privateReviewerNotes" rows={4} {...form.register("privateReviewerNotes")} />
              </div>
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
