import { notFound } from "next/navigation";
import type { RoleType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAnyRole } from "@/lib/rbac";
import { VisibilityControlPanel } from "@/components/forms/visibility-control-panel";
import { DisclosureDecisionButtons } from "@/components/forms/disclosure-decision-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProjectVisibilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as RoleType[];
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      visibilityPolicy: true,
      disclosureRequests: {
        include: { requester: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();
  if (project.ownerId !== session?.user?.id && !hasAnyRole(roles, ["ADMIN"])) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visibility and Disclosure</h1>
      <VisibilityControlPanel projectId={project.id} defaultVisibility={project.visibilityMode} />
      <Card>
        <CardHeader><CardTitle>Progressive disclosure policy</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>- Product description: {project.visibilityPolicy?.productDescriptionLevel ?? "LIMITED"}</p>
          <p>- Screenshots: {project.visibilityPolicy?.screenshotsLevel ?? "PROTECTED"}</p>
          <p>- Walkthrough video: {project.visibilityPolicy?.walkthroughVideoLevel ?? "PROTECTED"}</p>
          <p>- Demo link: {project.visibilityPolicy?.demoLinkLevel ?? "LIMITED"}</p>
          <p>- Private build access: {project.visibilityPolicy?.privateBuildAccessLevel ?? "EXPERT_ONLY"}</p>
          <p>- Architecture notes: {project.visibilityPolicy?.architectureNotesLevel ?? "EXPERT_ONLY"}</p>
          <p>- GitHub visibility: {project.visibilityPolicy?.githubVisibilityLevel ?? "EXPERT_ONLY"}</p>
          <p>- Roadmap: {project.visibilityPolicy?.roadmapLevel ?? "PROTECTED"}</p>
          <p>- Differentiating features: {project.visibilityPolicy?.differentiatingFeaturesLevel ?? "PROTECTED"}</p>
          <p>- Deployment details: {project.visibilityPolicy?.deploymentDetailsLevel ?? "EXPERT_ONLY"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Disclosure requests</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {project.disclosureRequests.map((request) => (
            <div key={request.id} className="rounded-md border border-border p-3">
              <p className="font-medium">Requester: {request.requester.name}</p>
              <p>Requested level: {request.requestedLevel.replaceAll("_", " ")}</p>
              <p>Status: {request.approved == null ? "Pending" : request.approved ? "Approved" : "Rejected"}</p>
              {request.notes && <p className="text-slate-600">{request.notes}</p>}
              {request.approved == null && <DisclosureDecisionButtons requestId={request.id} />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
