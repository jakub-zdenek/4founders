import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { canReview } from "@/lib/rbac";

const voteSchema = z.object({
  projectId: z.string().cuid(),
  type: z.enum(["COMPARATIVE", "CONFIDENCE", "IMPROVEMENT"]),
  value: z.number().int().min(1).max(10),
  confidence: z.number().int().min(1).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const { user, roles } = await getCurrentUserContext();

    if (!canReview(roles)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = voteSchema.parse(await request.json());

    const vote = await prisma.vote.create({
      data: {
        projectId: payload.projectId,
        userId: user.id,
        type: payload.type,
        value: payload.value,
        confidence: payload.confidence,
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
