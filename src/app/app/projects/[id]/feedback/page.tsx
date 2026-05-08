import { notFound } from "next/navigation";
import type { RoleType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/permissions";
import { ScoreBarChart } from "@/components/charts/score-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackThemeChips } from "@/components/app/feedback-theme-chips";

export const dynamic = "force-dynamic";

export default async function ProjectFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as RoleType[];
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      reviews: { include: { dimensionScores: true, reviewer: true }, orderBy: { createdAt: "desc" } },
      feedbackThemes: true,
    },
  });

  if (!project) notFound();
  if (!canAccessProject(project, session?.user?.id ?? null, roles)) notFound();

  const grouped = new Map<string, number[]>();
  for (const review of project.reviews) {
    for (const score of review.dimensionScores) {
      grouped.set(score.dimension, [...(grouped.get(score.dimension) ?? []), score.score]);
    }
  }

  const scores = [...grouped.entries()].map(([label, values]) => ({
    label: label.replaceAll("_", " ").toLowerCase(),
    score: values.reduce((a, b) => a + b, 0) / values.length,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Feedback Workspace</h1>
      <Card>
        <CardHeader><CardTitle>Dimension score breakdown</CardTitle></CardHeader>
        <CardContent><ScoreBarChart items={scores} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Feedback themes</CardTitle></CardHeader>
        <CardContent><FeedbackThemeChips themes={project.feedbackThemes} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Structured reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {project.reviews.map((review) => (
            <div key={review.id} className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium">{review.reviewer.name} ({review.confidenceLevel})</p>
              <p><strong>What works:</strong> {review.whatWorks}</p>
              <p><strong>What is weak:</strong> {review.whatIsWeak}</p>
              <p><strong>What is unclear:</strong> {review.whatIsUnclear}</p>
              <p><strong>Highest-priority improvement:</strong> {review.highestPriorityImprovement}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
