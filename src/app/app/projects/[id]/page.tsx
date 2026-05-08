import Link from "next/link";
import { notFound } from "next/navigation";
import type { RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessProject } from "@/lib/permissions";
import { StageTimeline } from "@/components/app/stage-timeline";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpertSupportRequestForm } from "@/components/forms/expert-support-request-form";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      category: true,
      versions: { orderBy: { versionNumber: "desc" } },
      reviews: true,
      feedbackThemes: true,
    },
  });

  if (!project) notFound();

  const roles = (session?.user?.roles ?? []) as RoleType[];
  const allowed = canAccessProject(project, session?.user?.id ?? null, roles);
  if (!allowed) notFound();

  const avgScore =
    project.reviews.length > 0
      ? project.reviews.reduce((acc, review) => acc + (review.weightedScore ?? 0), 0) / project.reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-slate-700">{project.valueProposition}</p>
        </div>
        <StatusBadge value={project.stage} />
      </div>

      <StageTimeline currentStage={project.stage} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Category</CardTitle></CardHeader>
          <CardContent>{project.category.name}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
          <CardContent>{project.visibilityMode.replaceAll("_", " ")}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average score</CardTitle></CardHeader>
          <CardContent>{avgScore.toFixed(1)}/10</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Navigation</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <Link href={`/app/projects/${project.id}/versions`} className="text-cyan-700 hover:underline">Versions</Link>
          <Link href={`/app/projects/${project.id}/visibility`} className="text-cyan-700 hover:underline">Visibility</Link>
          <Link href={`/app/projects/${project.id}/feedback`} className="text-cyan-700 hover:underline">Feedback</Link>
          <Link href={`/app/projects/${project.id}/access-log`} className="text-cyan-700 hover:underline">Access log</Link>
        </CardContent>
      </Card>

      <ExpertSupportRequestForm projectId={project.id} />
    </div>
  );
}
