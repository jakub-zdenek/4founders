import Link from "next/link";
import { auth } from "@/lib/auth";
import type { RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessByVisibility } from "@/lib/permissions";
import { canReview } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewSubmissionForm } from "@/components/forms/review-submission-form";
import { VotePanel } from "@/components/forms/vote-panel";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const session = await auth();
  const { projectId } = await searchParams;
  const roles = (session?.user?.roles ?? []) as RoleType[];

  if (!canReview(roles)) {
    return <p className="text-sm text-slate-600">Reviewer access is required.</p>;
  }

  const projects = await prisma.project.findMany({
    include: {
      category: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const accessible = projects.filter((project) =>
    canAccessByVisibility(project.visibilityMode, roles, project.ownerId === session?.user?.id),
  );

  const selectedProject = accessible.find((project) => project.id === projectId) ?? accessible[0];

  const reviews = await prisma.review.findMany({
    where: { reviewerId: session?.user?.id ?? "" },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reviewer Workspace</h1>

      <Card>
        <CardHeader><CardTitle>Accessible projects</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {accessible.map((project) => (
            <div key={project.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-slate-500">{project.category.name} · {project.visibilityMode}</p>
              </div>
              <Link href={`/app/reviews?projectId=${project.id}`} className="text-cyan-700 hover:underline">
                Review
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedProject && (
        <div className="space-y-4">
          <ReviewSubmissionForm projectId={selectedProject.id} versionId={selectedProject.versions[0]?.id} />
          <Card>
            <CardHeader><CardTitle>Voting</CardTitle></CardHeader>
            <CardContent>
              <VotePanel projectId={selectedProject.id} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>My submitted reviews</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <p>{review.project.name}</p>
              <Link href={`/app/reviews/${review.id}`} className="text-cyan-700 hover:underline">Open</Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
