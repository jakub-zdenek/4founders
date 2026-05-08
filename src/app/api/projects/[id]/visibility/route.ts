import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { hasAnyRole } from "@/lib/rbac";

const visibilitySchema = z.object({
  visibilityMode: z.enum(["PUBLIC", "LIMITED", "PROTECTED", "EXPERT_ONLY"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { user, roles } = await getCurrentUserContext();

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (project.ownerId !== user.id && !hasAnyRole(roles, ["ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = visibilitySchema.parse(await request.json());

    const updated = await prisma.project.update({
      where: { id },
      data: {
        visibilityMode: payload.visibilityMode,
        visibilityPolicy: {
          upsert: {
            create: { defaultVisibility: payload.visibilityMode },
            update: { defaultVisibility: payload.visibilityMode },
          },
        },
      },
    });

    return NextResponse.json({ project: updated });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
