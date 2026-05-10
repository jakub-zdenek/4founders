import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const paths = [
  {
    title: "I am a mentor",
    href: "/register?intent=mentor",
    eyebrow: "Share experience",
    quote:
      "I believe the ultimate measurement of individual impact is how many others they inspired, lifted, or motivated to positively change the world we live in.",
    cta: "Create mentor profile",
  },
  {
    title: "I want to test, participate, and gain experience",
    href: "/register?intent=participant",
    eyebrow: "Join early",
    quote:
      "I want to help test, give useful feedback, and be one of the early adopters who helps promising ideas become real products.",
    cta: "Create participant profile",
  },
  {
    title: "I have a great idea or problem to solve",
    href: "/register?intent=founder",
    eyebrow: "Build with support",
    quote:
      "We believe the world belongs to the crazy ones, because the people who are crazy enough to think they can change the world are the ones who do.",
    cta: "Create founder profile",
  },
];

const onboardingWorkflows = [
  {
    title: "Mentor profile",
    steps: [
      "Create a profile.",
      "Explain why founders should believe you can help.",
      "Describe how you can support.",
      "Choose the areas where you can support.",
      "Link GitHub to show credibility.",
      "Share what you like to support, because passion is key.",
    ],
  },
  {
    title: "Founder path",
    steps: [
      "Create a profile and tell us your drive and motivation.",
      "Choose a restricted starting area.",
      "Explain the problem you want to solve and why.",
      "Describe who benefits and who the user is.",
      "Explain how you want to solve it.",
      "Add a short video or presentation.",
      "Choose public, semi-private, or private review mode.",
      "Tell us what help and support you need.",
      "Tell us if you want to start building a team.",
      "Improve from feedback and see your progress over time.",
    ],
  },
  {
    title: "Participant profile",
    steps: [
      "Create a profile.",
      "Describe how you can support.",
      "Choose the areas where you can support.",
      "Link GitHub to show credibility.",
      "Share what you like to support, because passion is key.",
    ],
  },
];

export default async function HomePage() {
  const featured = await prisma.project
    .findMany({
      where: {
        visibilityMode: "PUBLIC",
        isFeaturedPublic: true,
      },
      include: { category: true },
      take: 4,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(245,158,11,0.18),transparent_26%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(12,74,110,0.9))]" />
          <div className="relative">
            <Badge className="bg-cyan-100 text-cyan-900 hover:bg-cyan-100">Large-scale collaboration</Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-black uppercase leading-[0.98] tracking-tight md:text-6xl">
              The ultimate advantage of humans is their ability to collaborate at large scale.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-cyan-50">
              We believe the future is open source, academic research, and finding new ways to solve
              existing problems.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#choose-path">
                <Button size="lg" className="bg-white text-slate-950 hover:bg-cyan-50">
                  Choose your path
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10">
                  How it works
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Mission statement</p>
            <h2 className="mt-4 text-2xl font-bold leading-tight">This is a beautiful problem we want to solve.</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-100">
              <p>
                There are people who succeed and build something great. Now they want to give back,
                support others, and share their experience.
              </p>
              <p>
                There are also people with brilliant ideas who want to change the world, succeed,
                and make an impact, but they need help, guidance, and support. We want to connect them.
              </p>
              <p>
                And there are people who want to learn, gain experience, and work on great ideas.
                Today, there is no trusted place for all of them to meet each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="choose-path" className="grid gap-5 md:grid-cols-3">
        {paths.map((path) => (
          <Card key={path.title} className="group flex h-full flex-col border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
            <CardHeader>
              <Badge className="w-fit bg-amber-50 text-amber-800 hover:bg-amber-50">{path.eyebrow}</Badge>
              <CardTitle className="mt-3 text-2xl leading-tight">{path.title}</CardTitle>
              <CardDescription className="text-base leading-7">{path.quote}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={path.href}>
                <Button className="w-full justify-between">
                  {path.cta}
                  <span aria-hidden="true">-&gt;</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-5">
        <div>
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Onboarding workflows</Badge>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">Three ways to join the collaboration layer</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Each path collects the information needed to build trust, protect sensitive ideas, and
            match people with the right kind of support.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {onboardingWorkflows.map((workflow) => (
            <Card key={workflow.title} className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>{workflow.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-slate-700">
                  {workflow.steps.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-800">
                        {workflow.steps.indexOf(item) + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
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
