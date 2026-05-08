import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { hasAnyRole } from "@/lib/rbac";
import { createVersionSchema } from "@/features/projects/version.schema";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { user, roles } = await getCurrentUserContext();

    if (!hasAnyRole(roles, ["FOUNDER", "ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.ownerId !== user.id && !hasAnyRole(roles, ["ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = createVersionSchema.parse({ ...(await request.json()), projectId: id });

    const latest = await prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { versionNumber: "desc" },
    });

    const version = await prisma.projectVersion.create({
      data: {
        projectId: id,
        versionNumber: (latest?.versionNumber ?? 0) + 1,
        changelog: payload.changelog,
        launchGoals: payload.launchGoals,
        knownWeaknesses: payload.knownWeaknesses,
        privateReviewerNotes: payload.privateReviewerNotes,
        waitlistLink: payload.waitlistLink || null,
      },
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
