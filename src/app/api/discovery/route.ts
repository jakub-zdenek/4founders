import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [bestInCategory, fastestImprovers, topLaunchCandidates] = await Promise.all([
    prisma.project.findMany({
      where: { visibilityMode: "PUBLIC" },
      include: { category: true, reviews: true },
      orderBy: [{ stage: "desc" }, { updatedAt: "desc" }],
      take: 12,
    }),
    prisma.project.findMany({
      where: { visibilityMode: "PUBLIC" },
      include: { versions: true, category: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    prisma.project.findMany({
      where: {
        visibilityMode: "PUBLIC",
        stage: { in: ["LAUNCH_CANDIDATE", "EXPERT_FINALIZATION", "READY_FOR_GO_LIVE"] },
      },
      include: { category: true, reviews: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  return NextResponse.json({
    bestInCategory,
    fastestImprovers,
    topLaunchCandidates,
  });
}
