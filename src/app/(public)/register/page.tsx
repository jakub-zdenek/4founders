"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileIntent = "founder" | "mentor" | "participant";

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

function readIntentFromUrl(): ProfileIntent {
  const intent = new URLSearchParams(window.location.search).get("intent");
  if (intent === "mentor" || intent === "participant" || intent === "founder") {
    return intent;
  }
  return "founder";
}

export default function RegisterPage() {
  const router = useRouter();
  const [intent, setIntent] = useState<ProfileIntent>("founder");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = intentCopy[intent];

  useEffect(() => {
    setIntent(readIntentFromUrl());
  }, []);

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
    <div className="mx-auto max-w-md">
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : copy.button}
            </Button>
          </form>
          <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Choose a different path</p>
            <div className="flex flex-wrap gap-2">
              {(["mentor", "participant", "founder"] as ProfileIntent[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIntent(option)}
                  className={`rounded-full border px-3 py-1 ${
                    intent === option
                      ? "border-cyan-700 bg-cyan-50 text-cyan-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {option}
                </button>
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
