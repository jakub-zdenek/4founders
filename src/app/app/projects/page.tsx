import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";
import { LeaderboardCard } from "@/components/app/leaderboard-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const myProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    include: {
      category: true,
      reviews: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const bestInCategoryRaw = await prisma.project.findMany({
    where: { visibilityMode: "PUBLIC" },
    include: { category: true, reviews: true },
    take: 12,
  });

  const bestInCategory = bestInCategoryRaw
    .map((p) => ({
      id: p.id,
      name: p.name,
      stage: p.stage,
      category: p.category.name,
      score:
        p.reviews.length > 0
          ? p.reviews.reduce((a, b) => a + (b.weightedScore ?? 0), 0) / p.reviews.length
          : 0,
    }))
    .sort((a, b) => b.score - a.score);

  const fastestImprovers = await prisma.project.findMany({
    where: { visibilityMode: "PUBLIC" },
    include: { category: true, versions: true, reviews: true },
    take: 12,
  });

  const strongestDocGains = fastestImprovers
    .map((p) => ({
      id: p.id,
      name: p.name,
      stage: p.stage,
      category: p.category.name,
      score: Math.min(10, (p.versions.length - 1) * 1.5 + (p.reviews[0]?.weightedScore ?? 6)),
    }))
    .sort((a, b) => b.score - a.score);

  const confidenceValue = { LOW: 5.5, MEDIUM: 7, HIGH: 8.8 } as const;
  const highestReviewerConfidence = bestInCategoryRaw
    .map((p) => ({
      id: p.id,
      name: p.name,
      stage: p.stage,
      category: p.category.name,
      score:
        p.reviews.length > 0
          ? p.reviews.reduce(
              (acc, review) => acc + confidenceValue[review.confidenceLevel],
              0,
            ) / p.reviews.length
          : 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/app/projects/new" className="text-sm font-medium text-cyan-700 hover:underline">
          New project
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {myProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{project.valueProposition}</p>
              <div className="flex items-center gap-2">
                <StatusBadge value={project.stage} />
                <span className="text-slate-500">{project.category.name}</span>
              </div>
              <Link href={`/app/projects/${project.id}`} className="text-cyan-700 hover:underline">Open project workspace</Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderboardCard title="Best in Category" projects={bestInCategory} />
        <LeaderboardCard title="Fastest Improvers" projects={strongestDocGains} />
        <LeaderboardCard title="Highest Reviewer Confidence" projects={highestReviewerConfidence} />
        <LeaderboardCard title="Top Launch Candidates" projects={bestInCategory.filter((p) => ["LAUNCH_CANDIDATE", "EXPERT_FINALIZATION", "READY_FOR_GO_LIVE"].includes(p.stage))} />
      </div>
    </div>
  );
}
