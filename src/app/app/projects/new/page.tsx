import { prisma } from "@/lib/prisma";
import { ProjectWizard } from "@/components/forms/project-wizard";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Project Submission Wizard</h1>
      <ProjectWizard categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
