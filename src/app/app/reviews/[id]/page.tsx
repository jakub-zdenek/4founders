import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      project: true,
      reviewer: true,
      dimensionScores: true,
    },
  });

  if (!review) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Review Detail</h1>
      <Card>
        <CardHeader><CardTitle>{review.project.name}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Reviewer:</strong> {review.reviewer.name}</p>
          <p><strong>Confidence:</strong> {review.confidenceLevel}</p>
          <p><strong>What works:</strong> {review.whatWorks}</p>
          <p><strong>What is weak:</strong> {review.whatIsWeak}</p>
          <p><strong>What is unclear:</strong> {review.whatIsUnclear}</p>
          <p><strong>Highest-priority improvement:</strong> {review.highestPriorityImprovement}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Dimension scores</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {review.dimensionScores.map((score) => (
            <p key={score.id}>- {score.dimension.replaceAll("_", " ")}: {score.score}/10</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
