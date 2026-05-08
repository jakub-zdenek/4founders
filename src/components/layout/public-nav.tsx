import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/categories", label: "Categories" },
  { href: "/trust-safety", label: "Trust & Safety" },
  { href: "/about", label: "Mission" },
];

export async function PublicNav() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-cyan-800">
          4Founders
        </Link>
        <nav className="hidden gap-6 text-sm text-slate-700 md:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-cyan-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/app/dashboard">
              <Button size="sm">Open App</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-slate-700 hover:text-cyan-700">
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
