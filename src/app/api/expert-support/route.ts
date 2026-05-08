import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { hasAnyRole } from "@/lib/rbac";
import { expertSupportSchema } from "@/features/expert/support.schema";

export async function POST(request: NextRequest) {
  try {
    const { user, roles } = await getCurrentUserContext();
    if (!hasAnyRole(roles, ["FOUNDER", "ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = expertSupportSchema.parse(await request.json());

    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (project.ownerId !== user.id && !hasAnyRole(roles, ["ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestRecord = await prisma.expertSupportRequest.create({
      data: {
        projectId: payload.projectId,
        founderId: user.id,
        requestNote: payload.requestNote,
        founderDisclosure: payload.founderDisclosure,
      },
    });

    return NextResponse.json({ request: requestRecord }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
