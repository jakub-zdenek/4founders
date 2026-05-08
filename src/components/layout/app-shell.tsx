import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import type { RoleType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { canExpert, canModerate, canReview } from "@/lib/rbac";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const roles = (session?.user?.roles ?? []) as RoleType[];
  const appLinks = [
    { href: "/app/dashboard", label: "Dashboard", visible: true },
    { href: "/app/projects", label: "Projects", visible: true },
    { href: "/app/reviews", label: "Reviews", visible: canReview(roles) },
    { href: "/app/expert", label: "Expert", visible: canExpert(roles) },
    { href: "/app/moderation", label: "Moderation", visible: canModerate(roles) },
    { href: "/app/profile", label: "Profile", visible: true },
    { href: "/app/settings", label: "Settings", visible: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-white p-5">
          <Link href="/" className="text-lg font-semibold text-cyan-800">
            4Founders
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role}>{role.replaceAll("_", " ")}</Badge>
            ))}
          </div>
          <nav className="mt-6 space-y-2">
            {appLinks.filter((item) => item.visible).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="mt-8"
          >
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Sign out
            </Button>
          </form>
        </aside>
        <section className="p-6">{children}</section>
      </div>
    </div>
  );
}
