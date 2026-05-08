import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { canExpert } from "@/lib/rbac";

const assessmentSchema = z.object({
  projectId: z.string().cuid(),
  supportRequestId: z.string().cuid().optional(),
  blockers: z.string().min(5),
  fixes: z.string().min(5),
  recommendation: z.enum(["NOT_READY", "READY_WITH_FIXES", "READY_FOR_GO_LIVE"]),
  founderFollowUp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user, roles } = await getCurrentUserContext();
    if (!canExpert(roles)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = assessmentSchema.parse(await request.json());

    const assessment = await prisma.launchReadinessAssessment.create({
      data: {
        projectId: payload.projectId,
        expertId: user.id,
        supportRequestId: payload.supportRequestId,
        blockers: payload.blockers,
        fixes: payload.fixes,
        recommendation: payload.recommendation,
        founderFollowUp: payload.founderFollowUp,
      },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
