import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.project.findMany({
    where: {
      visibilityMode: "PUBLIC",
      isFeaturedPublic: true,
    },
    include: { category: true },
    take: 4,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-16">
      <section className="rounded-2xl border border-border bg-white p-8 md:p-12">
        <Badge className="bg-cyan-50 text-cyan-700">Trusted Launch Platform</Badge>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          Helping the best ideas grow, launch, and change the world.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-700">
          A trusted platform where early software founders get structured feedback, protect their ideas,
          improve their products, and earn the support needed to reach the market with real impact.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button size="lg">Start as Founder</Button>
          </Link>
          <Link href="/how-it-works">
            <Button size="lg" variant="outline">
              How It Works
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["For Founders", "Protect sensitive work while getting high-signal feedback and a clear launch path."],
          ["For Reviewers", "Contribute structured reviews that are weighted by quality and trust."],
          ["For Experts", "Help strong products finalize before go-live with focused technical guidance."],
        ].map(([title, text]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Core Differentiators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Progressive disclosure with founder-controlled visibility</p>
            <p>- Structured rubric feedback over hype metrics</p>
            <p>- Reputation-weighted reviewer credibility</p>
            <p>- Expert finalization for pre-launch readiness</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trust and Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>- Asset-level access permissions and access logs</p>
            <p>- Protected-by-default disclosure policy</p>
            <p>- Moderation workflows and suspicious activity review</p>
            <p>- Founder approval path for deeper disclosure requests</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Featured Public Projects</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.valueProposition}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge>{project.category.name}</Badge>
                <p className="text-slate-600">Stage: {project.stage.replaceAll("_", " ")}</p>
                <Link href={`/projects/${project.slug}`} className="text-cyan-700 hover:underline">
                  View project
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
