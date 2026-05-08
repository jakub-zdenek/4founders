import { notFound } from "next/navigation";
import type { RoleType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAnyRole } from "@/lib/rbac";
import { VersionSubmissionForm } from "@/components/forms/version-submission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProjectVersionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as RoleType[];

  const project = await prisma.project.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });

  if (!project) notFound();
  if (project.ownerId !== session?.user?.id && !hasAnyRole(roles, ["ADMIN"])) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{project.name} Versions</h1>
      <VersionSubmissionForm projectId={project.id} />
      <Card>
        <CardHeader><CardTitle>Version history</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {project.versions.map((version) => (
            <div key={version.id} className="rounded-md border border-border p-3">
              <p className="font-medium">v{version.versionNumber}</p>
              <p className="text-sm text-slate-700">{version.changelog}</p>
              <p className="text-xs text-slate-500">{version.createdAt.toISOString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
