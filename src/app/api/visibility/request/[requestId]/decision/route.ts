import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { hasAnyRole } from "@/lib/rbac";

const decisionSchema = z.object({
  approved: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> },
) {
  try {
    const { requestId } = await context.params;
    const { user, roles } = await getCurrentUserContext();
    const payload = decisionSchema.parse(await request.json());

    const disclosure = await prisma.disclosureRequest.findUnique({
      where: { id: requestId },
      include: { project: true },
    });

    if (!disclosure) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = disclosure.project.ownerId === user.id;
    if (!isOwner && !hasAnyRole(roles, ["ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.disclosureRequest.update({
      where: { id: requestId },
      data: {
        approved: payload.approved,
        decidedById: user.id,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ request: updated });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
