import { auth } from "@/lib/auth";
import type { RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canModerate } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModerationCaseForm } from "@/components/forms/moderation-case-form";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as RoleType[];

  if (!canModerate(roles)) {
    return <p className="text-sm text-slate-600">Admin or moderator access is required.</p>;
  }

  const [cases, flaggedReviews, suspiciousActivity, approvalQueue, categories, reviewerProfiles] = await Promise.all([
    prisma.moderationCase.findMany({ include: { project: true, reporter: true }, orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ where: { status: "FLAGGED" }, include: { project: true }, take: 10 }),
    prisma.accessLog.findMany({ where: { action: { contains: "protected" } }, include: { actor: true, project: true }, take: 10, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { stage: "UNDER_REVIEW" }, take: 8, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.reviewerProfile.findMany({ include: { user: true }, orderBy: { trustScore: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <ModerationCaseForm />
        <Card>
          <CardHeader><CardTitle>Submission approval queue</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {approvalQueue.map((project) => (
              <p key={project.id}>- {project.name}</p>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Active moderation cases</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {cases.map((item) => (
            <div key={item.id} className="rounded-md border border-border p-3">
              <p className="font-medium">{item.project?.name ?? "General"} · {item.status}</p>
              <p>Reporter: {item.reporter.name}</p>
              <p>{item.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Flagged reviews</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {flaggedReviews.map((review) => <p key={review.id}>- {review.project.name} ({review.id})</p>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Suspicious activity</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {suspiciousActivity.map((log) => <p key={log.id}>- {log.project?.name ?? "Unknown project"}: {log.action} by {log.actor.name}</p>)}
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Category management</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {categories.map((category) => <p key={category.id}>- {category.name}</p>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Trust and reputation controls</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {reviewerProfiles.map((profile) => (
              <p key={profile.id}>- {profile.user.name}: trust {profile.trustScore}, reputation {profile.reputationScore}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
