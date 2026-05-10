"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ProfileIntent = "founder" | "mentor" | "participant";

type ScreenId =
  | "account"
  | "founderMotivation"
  | "credibility"
  | "supportApproach"
  | "supportAreas"
  | "passion"
  | "review";

type Screen = {
  id: ScreenId;
  title: string;
  description: string;
};

const intentCopy: Record<
  ProfileIntent,
  {
    title: string;
    description: string;
    button: string;
  }
> = {
  founder: {
    title: "Founder onboarding",
    description: "Move screen by screen from profile to protected project workflow.",
    button: "Create founder profile",
  },
  mentor: {
    title: "Mentor onboarding",
    description: "Build trust first, then explain how and where you can support founders.",
    button: "Create mentor profile",
  },
  participant: {
    title: "Participant onboarding",
    description: "Show how you can test, contribute, learn, and support promising ideas.",
    button: "Create participant profile",
  },
};

const screensByIntent: Record<ProfileIntent, Screen[]> = {
  founder: [
    {
      id: "account",
      title: "Create your profile",
      description: "Start with the basics. We use this to create your founder account.",
    },
    {
      id: "founderMotivation",
      title: "Your drive and motivation",
      description: "Tell us why this problem matters to you and why you want to build.",
    },
    {
      id: "review",
      title: "Review and create profile",
      description: "Confirm your founder profile. After this, you will continue into the project workflow.",
    },
  ],
  mentor: [
    {
      id: "account",
      title: "Create your profile",
      description: "Start with the basics. Founders need to know who is offering support.",
    },
    {
      id: "credibility",
      title: "Why should founders believe you?",
      description: "Share evidence, experience, lessons learned, or proof that you can help.",
    },
    {
      id: "supportApproach",
      title: "How can you support?",
      description: "Describe the practical help you can provide.",
    },
    {
      id: "supportAreas",
      title: "Where can you support?",
      description: "Choose the areas where your experience is most useful and link GitHub for credibility.",
    },
    {
      id: "passion",
      title: "What do you like to support?",
      description: "Passion is a key signal. Tell founders what kind of problems energize you.",
    },
    {
      id: "review",
      title: "Review and create profile",
      description: "Confirm your mentor profile before it is created.",
    },
  ],
  participant: [
    {
      id: "account",
      title: "Create your profile",
      description: "Start with the basics. This creates your participant account.",
    },
    {
      id: "supportApproach",
      title: "How can you support?",
      description: "Tell founders whether you can test, review, document, design, or contribute.",
    },
    {
      id: "supportAreas",
      title: "Where can you support?",
      description: "Choose the areas where you want to participate and link GitHub if useful.",
    },
    {
      id: "passion",
      title: "What do you like to support?",
      description: "Share the kinds of ideas, tools, or missions you want to be close to.",
    },
    {
      id: "review",
      title: "Review and create profile",
      description: "Confirm your participant profile before it is created.",
    },
  ],
};

function readForm(form: HTMLFormElement) {
  const values: Record<string, string> = {};
  for (const [key, value] of new FormData(form).entries()) {
    values[key] = String(value);
  }
  return values;
}

function profileSummary(intent: ProfileIntent, values: Record<string, string>) {
  if (intent === "founder") {
    return [
      ["Name", values.name],
      ["Email", values.email],
      ["Drive and motivation", values.founderMotivation],
      ["Next step", "Continue into the founder project workflow."],
    ];
  }

  if (intent === "mentor") {
    return [
      ["Name", values.name],
      ["Email", values.email],
      ["Why founders should believe you", values.credibilityStatement],
      ["How you can support", values.supportApproach],
      ["Support areas", values.supportAreas],
      ["GitHub credibility", values.githubUrl || "Not provided"],
      ["Passion", values.passionStatement],
    ];
  }

  return [
    ["Name", values.name],
    ["Email", values.email],
    ["How you can support", values.supportApproach],
    ["Support areas", values.supportAreas],
    ["GitHub credibility", values.githubUrl || "Not provided"],
    ["Passion", values.passionStatement],
  ];
}

export function RegisterForm({ intent }: { intent: ProfileIntent }) {
  const router = useRouter();
  const [screenIndex, setScreenIndex] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = intentCopy[intent];
  const screens = screensByIntent[intent];
  const screen = screens[screenIndex];
  const isFirstScreen = screenIndex === 0;
  const isLastScreen = screenIndex === screens.length - 1;

  function saveScreen(form: HTMLFormElement) {
    const nextValues = readForm(form);
    setDraft((current) => ({ ...current, ...nextValues }));
    return { ...draft, ...nextValues };
  }

  function goNext(form: HTMLFormElement | null) {
    if (!form || !form.reportValidity()) return;
    saveScreen(form);
    setError(null);
    setScreenIndex((value) => Math.min(screens.length - 1, value + 1));
  }

  function goBack(form: HTMLFormElement | null) {
    if (form) saveScreen(form);
    setError(null);
    setScreenIndex((value) => Math.max(0, value - 1));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    setLoading(true);
    setError(null);

    const values = saveScreen(event.currentTarget);
    const email = values.email ?? "";
    const password = values.password ?? "";
    const payload = {
      name: values.name ?? "",
      email,
      password,
      intent,
      founderMotivation: values.founderMotivation ?? "",
      credibilityStatement: values.credibilityStatement ?? "",
      supportApproach: values.supportApproach ?? "",
      supportAreas: values.supportAreas ?? "",
      githubUrl: values.githubUrl ?? "",
      passionStatement: values.passionStatement ?? "",
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/sign-in");
      return;
    }

    router.push(body.redirectPath ?? "/app/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Screen {screenIndex + 1} of {screens.length}
            </p>
          </div>
        </div>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
          <div className="mt-4 rounded-full bg-slate-100 p-1">
            <div
              className="h-2 rounded-full bg-cyan-700 transition-all"
              style={{ width: `${((screenIndex + 1) / screens.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                {screen.title}
              </p>
              <p className="mt-2 text-sm text-slate-600">{screen.description}</p>
            </div>

            {screen.id === "account" && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required defaultValue={draft.name ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required defaultValue={draft.email ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    defaultValue={draft.password ?? ""}
                  />
                </div>
              </div>
            )}

            {screen.id === "founderMotivation" && (
              <div className="space-y-2">
                <Label htmlFor="founderMotivation">Your drive and motivation</Label>
                <Textarea
                  id="founderMotivation"
                  name="founderMotivation"
                  rows={6}
                  required
                  defaultValue={draft.founderMotivation ?? ""}
                  placeholder="Tell us why you care about the problem you want to solve."
                />
              </div>
            )}

            {screen.id === "credibility" && (
              <div className="space-y-2">
                <Label htmlFor="credibilityStatement">Why should founders believe you can help?</Label>
                <Textarea
                  id="credibilityStatement"
                  name="credibilityStatement"
                  rows={6}
                  required
                  defaultValue={draft.credibilityStatement ?? ""}
                  placeholder="Share your experience, evidence, lessons learned, or wins you can help others avoid/repeat."
                />
              </div>
            )}

            {screen.id === "supportApproach" && (
              <div className="space-y-2">
                <Label htmlFor="supportApproach">How can you support?</Label>
                <Textarea
                  id="supportApproach"
                  name="supportApproach"
                  rows={5}
                  required
                  defaultValue={draft.supportApproach ?? ""}
                  placeholder="Mentoring, product feedback, code review, testing, introductions, docs, UX review..."
                />
              </div>
            )}

            {screen.id === "supportAreas" && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportAreas">In which area can you support?</Label>
                  <Input
                    id="supportAreas"
                    name="supportAreas"
                    required
                    defaultValue={draft.supportAreas ?? ""}
                    placeholder="AI tools, frontend UX, infrastructure, developer productivity..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub link for credibility</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    defaultValue={draft.githubUrl ?? ""}
                    placeholder="https://github.com/your-handle"
                  />
                </div>
              </div>
            )}

            {screen.id === "passion" && (
              <div className="space-y-2">
                <Label htmlFor="passionStatement">What do you like to support?</Label>
                <Textarea
                  id="passionStatement"
                  name="passionStatement"
                  rows={5}
                  required
                  defaultValue={draft.passionStatement ?? ""}
                  placeholder="Your passion matters. Tell founders what kind of ideas, people, or problems energize you."
                />
              </div>
            )}

            {screen.id === "review" && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Profile information to save</p>
                <div className="grid gap-3">
                  {profileSummary(intent, draft).map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-slate-900">{label}</p>
                      <p className="mt-1 whitespace-pre-wrap text-slate-700">{value || "Not provided"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isFirstScreen || loading}
                onClick={(event) => goBack(event.currentTarget.form)}
              >
                Previous screen
              </Button>
              {isLastScreen ? (
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : copy.button}
                </Button>
              ) : (
                <Button type="button" disabled={loading} onClick={(event) => goNext(event.currentTarget.form)}>
                  Next screen
                </Button>
              )}
            </div>
          </form>

          <div className="mt-5 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Choose a different path</p>
            <div className="flex flex-wrap gap-2">
              {(["mentor", "participant", "founder"] as ProfileIntent[]).map((option) => (
                <Link
                  key={option}
                  href={`/register?intent=${option}`}
                  className={`rounded-full border px-3 py-1 ${
                    intent === option
                      ? "border-cyan-700 bg-cyan-50 text-cyan-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {option}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account? <Link href="/sign-in" className="text-cyan-700">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
