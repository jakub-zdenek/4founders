import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { canModerate } from "@/lib/rbac";
import { moderationCaseSchema } from "@/features/moderation/case.schema";

export async function POST(request: NextRequest) {
  try {
    const { user, roles } = await getCurrentUserContext();

    if (!canModerate(roles)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = moderationCaseSchema.parse(await request.json());

    const item = await prisma.moderationCase.create({
      data: {
        projectId: payload.projectId,
        reviewId: payload.reviewId,
        reporterId: user.id,
        assignedAdminId: user.id,
        reason: payload.reason,
      },
    });

    return NextResponse.json({ case: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
