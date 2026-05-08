import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";
import { FeedbackThemeChips } from "@/components/app/feedback-theme-chips";
import { ScoreBarChart } from "@/components/charts/score-bar-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    include: {
      feedbackThemes: true,
      versions: true,
      reviews: {
        include: { dimensionScores: true },
        orderBy: { createdAt: "desc" },
      },
      accessLogs: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeProjects = projects.length;
  const unresolvedIssues = await prisma.moderationCase.count({
    where: {
      status: { in: ["OPEN", "INVESTIGATING"] },
      project: { ownerId: userId },
    },
  });

  const allScores = projects
    .flatMap((project) => project.reviews)
    .flatMap((review) => review.dimensionScores);

  const byDimension = new Map<string, number[]>();
  for (const score of allScores) {
    const key = score.dimension;
    byDimension.set(key, [...(byDimension.get(key) ?? []), score.score]);
  }

  const dimensionAverages = [...byDimension.entries()].map(([label, scores]) => ({
    label: label.replaceAll("_", " ").toLowerCase(),
    score: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  const sortedDimensions = [...dimensionAverages].sort((a, b) => b.score - a.score);
  const strengths = sortedDimensions.slice(0, 3);
  const weaknesses = sortedDimensions.slice(-3).reverse();

  const hasLaunchCandidate = projects.some((project) => project.stage === "LAUNCH_CANDIDATE");
  const hasStrongPublicSignal = projects.some(
    (project) =>
      ["CATEGORY_STRONG", "LAUNCH_CANDIDATE", "EXPERT_FINALIZATION", "READY_FOR_GO_LIVE"].includes(project.stage) &&
      project.reviews.length > 0 &&
      project.reviews.reduce((acc, review) => acc + (review.weightedScore ?? 0), 0) / project.reviews.length >= 8,
  );

  const recommendation = hasLaunchCandidate
    ? "Request expert support"
    : hasStrongPublicSignal
      ? "Go public"
      : projects.some((project) => project.visibilityMode === "PROTECTED")
        ? "Open limited visibility"
        : "Stay protected";

  const accessAlerts = projects
    .flatMap((project) => project.accessLogs.map((log) => ({ ...log, projectName: project.name })))
    .slice(0, 5);

  const improvementProgress =
    projects.length > 0
      ? projects.reduce((acc, project) => acc + Math.max(0, project.versions.length - 1), 0) / projects.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Founder Dashboard</h1>
        <Link href="/app/projects/new" className="text-sm font-medium text-cyan-700 hover:underline">
          Submit new project
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Active projects</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{activeProjects}</CardContent></Card>
        <Card><CardHeader><CardTitle>Unresolved issues</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{unresolvedIssues}</CardContent></Card>
        <Card><CardHeader><CardTitle>Recommendation</CardTitle></CardHeader><CardContent className="text-lg font-semibold">{recommendation}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Improvement progress</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          Average iteration cycles per project: {improvementProgress.toFixed(1)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current stage by project</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <span>{project.name}</span>
              <StatusBadge value={project.stage} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Score by dimension</CardTitle></CardHeader>
          <CardContent>
            <ScoreBarChart items={dimensionAverages.map((d) => ({ label: d.label, score: d.score }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top strengths / weaknesses</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-2 font-semibold">Strengths</p>
              {strengths.map((s) => <p key={s.label}>- {s.label} ({s.score.toFixed(1)})</p>)}
            </div>
            <div>
              <p className="mb-2 font-semibold">Weaknesses</p>
              {weaknesses.map((w) => <p key={w.label}>- {w.label} ({w.score.toFixed(1)})</p>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Feedback themes</CardTitle></CardHeader>
        <CardContent>
          <FeedbackThemeChips themes={projects.flatMap((p) => p.feedbackThemes).slice(0, 12)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Access log alerts</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          {accessAlerts.map((log) => (
            <p key={log.id}>- {log.projectName}: {log.action} at {log.createdAt.toISOString()}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
