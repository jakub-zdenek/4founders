import { RegisterForm, type ProfileIntent } from "@/components/forms/register-form";

export const dynamic = "force-dynamic";

function parseIntent(intent?: string): ProfileIntent {
  if (intent === "mentor" || intent === "participant" || intent === "founder") {
    return intent;
  }
  return "founder";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const params = await searchParams;

  return <RegisterForm intent={parseIntent(params.intent)} />;
}
