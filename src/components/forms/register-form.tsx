"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ProfileIntent = "founder" | "mentor" | "participant";

const intentCopy: Record<
  ProfileIntent,
  {
    title: string;
    description: string;
    button: string;
  }
> = {
  founder: {
    title: "Create Founder Profile",
    description: "Start a protected project workflow for an idea or problem you want to solve.",
    button: "Create founder profile",
  },
  mentor: {
    title: "Create Mentor Profile",
    description: "Join as a senior mentor who can support founders with experience, guidance, and launch judgment.",
    button: "Create mentor profile",
  },
  participant: {
    title: "Create Participant Profile",
    description: "Join as an early tester, reviewer, and contributor who wants to learn by helping promising ideas improve.",
    button: "Create participant profile",
  },
};

export function RegisterForm({ intent }: { intent: ProfileIntent }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = intentCopy[intent];

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const payload = {
      name: String(formData.get("name") ?? ""),
      email,
      password,
      intent,
      founderMotivation: String(formData.get("founderMotivation") ?? ""),
      credibilityStatement: String(formData.get("credibilityStatement") ?? ""),
      supportApproach: String(formData.get("supportApproach") ?? ""),
      supportAreas: String(formData.get("supportAreas") ?? ""),
      githubUrl: String(formData.get("githubUrl") ?? ""),
      passionStatement: String(formData.get("passionStatement") ?? ""),
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
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit(new FormData(event.currentTarget));
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            {intent === "founder" && (
              <div className="space-y-2">
                <Label htmlFor="founderMotivation">Your drive and motivation</Label>
                <Textarea
                  id="founderMotivation"
                  name="founderMotivation"
                  rows={5}
                  required
                  placeholder="Tell us why you care about the problem you want to solve."
                />
              </div>
            )}
            {intent === "mentor" && (
              <div className="space-y-2">
                <Label htmlFor="credibilityStatement">Why should founders believe you can help?</Label>
                <Textarea
                  id="credibilityStatement"
                  name="credibilityStatement"
                  rows={5}
                  required
                  placeholder="Share your experience, evidence, lessons learned, or wins you can help others avoid/repeat."
                />
              </div>
            )}
            {(intent === "mentor" || intent === "participant") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="supportApproach">How can you support?</Label>
                  <Textarea
                    id="supportApproach"
                    name="supportApproach"
                    rows={4}
                    required
                    placeholder="Mentoring, product feedback, code review, testing, introductions, docs, UX review..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportAreas">In which area can you support?</Label>
                  <Input
                    id="supportAreas"
                    name="supportAreas"
                    required
                    placeholder="AI tools, frontend UX, infrastructure, developer productivity..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub link for credibility</Label>
                  <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/your-handle" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passionStatement">What do you like to support?</Label>
                  <Textarea
                    id="passionStatement"
                    name="passionStatement"
                    rows={4}
                    required
                    placeholder="Your passion matters. Tell founders what kind of ideas, people, or problems energize you."
                  />
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : copy.button}
            </Button>
          </form>
          <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
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
