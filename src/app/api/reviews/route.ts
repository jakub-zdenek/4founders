import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { canReview } from "@/lib/rbac";
import { createReviewSchema } from "@/features/reviews/review.schema";

export async function GET() {
  try {
    const { roles } = await getCurrentUserContext();
    if (!canReview(roles)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const reviews = await prisma.review.findMany({
      include: {
        project: { select: { id: true, name: true, slug: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, roles } = await getCurrentUserContext();
    if (!canReview(roles)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payload = createReviewSchema.parse(await request.json());

    const average = payload.scores.reduce((acc, score) => acc + score.score, 0) / payload.scores.length;

    const review = await prisma.review.create({
      data: {
        projectId: payload.projectId,
        projectVersionId: payload.projectVersionId,
        reviewerId: user.id,
        confidenceLevel: payload.confidenceLevel,
        whatWorks: payload.whatWorks,
        whatIsWeak: payload.whatIsWeak,
        whatIsUnclear: payload.whatIsUnclear,
        highestPriorityImprovement: payload.highestPriorityImprovement,
        weightedScore: average,
        dimensionScores: {
          createMany: {
            data: payload.scores.map((item) => ({
              dimension: item.dimension,
              score: item.score,
              rationale: item.rationale,
            })),
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
