import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>{category.description}</p>
              <p>{category._count.projects} projects</p>
              <Link href={`/categories/${category.slug}`} className="text-cyan-700 hover:underline">
                View category
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
