import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id ?? "" },
    include: {
      userRoles: { include: { role: true } },
      userBadges: { include: { badge: true } },
      reputationEvents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!user) {
    return <p className="text-sm">No profile found.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader><CardTitle>{user.name}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{user.email}</p>
          <div className="flex flex-wrap gap-2">
            {user.userRoles.map((entry) => <Badge key={entry.id}>{entry.role.type}</Badge>)}
          </div>
          <div className="flex flex-wrap gap-2">
            {user.userBadges.map((entry) => <Badge key={entry.id}>{entry.badge.label}</Badge>)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Reputation events</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {user.reputationEvents.map((event) => (
            <p key={event.id}>- {event.delta > 0 ? "+" : ""}{event.delta} · {event.reason}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
