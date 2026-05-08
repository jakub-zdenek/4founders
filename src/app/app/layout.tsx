import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <AppShell>{children}</AppShell>;
}
