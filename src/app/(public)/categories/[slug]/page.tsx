import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      projects: {
        where: { visibilityMode: "PUBLIC" },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{category.name}</h1>
      <p className="text-slate-700">{category.description}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {category.projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>{project.valueProposition}</p>
              <Link href={`/projects/${project.slug}`} className="text-cyan-700 hover:underline">
                View public page
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
