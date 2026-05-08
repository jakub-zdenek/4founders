import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PublicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      category: true,
      feedbackThemes: true,
      reviews: {
        include: { dimensionScores: true },
      },
    },
  });

  if (!project || project.visibilityMode !== "PUBLIC") {
    notFound();
  }

  const avg =
    project.reviews.length > 0
      ? project.reviews.reduce((acc, review) => acc + (review.weightedScore ?? 0), 0) / project.reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="mt-2 text-lg text-slate-700">{project.valueProposition}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{project.category.name}</Badge>
        <Badge>Stage: {project.stage.replaceAll("_", " ")}</Badge>
        <Badge>Avg score: {avg.toFixed(1)}/10</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>{project.problemStatement}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback Themes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {project.feedbackThemes.slice(0, 8).map((theme) => (
            <Badge key={theme.id}>{theme.theme}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
