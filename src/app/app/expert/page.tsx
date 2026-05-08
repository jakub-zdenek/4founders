import { auth } from "@/lib/auth";
import type { RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canExpert } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LaunchAssessmentForm } from "@/components/forms/launch-assessment-form";

export const dynamic = "force-dynamic";

export default async function ExpertPage() {
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as RoleType[];

  if (!canExpert(roles)) {
    return <p className="text-sm text-slate-600">Senior expert access is required.</p>;
  }

  const requests = await prisma.expertSupportRequest.findMany({
    include: {
      project: true,
      founder: true,
      assessments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const current = requests[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Expert Support Workspace</h1>
      <Card>
        <CardHeader><CardTitle>Support request inbox</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {requests.map((request) => (
            <div key={request.id} className="rounded-md border border-border p-3">
              <p className="font-medium">{request.project.name}</p>
              <p>Founder: {request.founder.name}</p>
              <p>Status: {request.status}</p>
              <p>{request.requestNote}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {current && <LaunchAssessmentForm projectId={current.projectId} supportRequestId={current.id} />}
    </div>
  );
}
