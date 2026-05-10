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
      founderProfile: true,
      reviewerProfile: true,
      expertProfile: true,
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
      {user.founderProfile && (
        <Card>
          <CardHeader><CardTitle>Founder profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p><strong>Tagline:</strong> {user.founderProfile.tagline ?? "Not set"}</p>
            <p><strong>Drive and motivation:</strong> {user.founderProfile.motivation ?? "Not set"}</p>
            <p><strong>Support needed:</strong> {user.founderProfile.supportNeeded ?? "Not set"}</p>
            <p><strong>Team building:</strong> {user.founderProfile.teamBuildingInterest ? "Interested" : "Not marked yet"}</p>
          </CardContent>
        </Card>
      )}
      {user.expertProfile && (
        <Card>
          <CardHeader><CardTitle>Mentor profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p><strong>Why founders should believe you:</strong> {user.expertProfile.credibilityStatement ?? "Not set"}</p>
            <p><strong>How you can support:</strong> {user.expertProfile.supportApproach ?? "Not set"}</p>
            <p><strong>Support areas:</strong> {user.expertProfile.supportAreas ?? user.expertProfile.specialty}</p>
            <p><strong>GitHub:</strong> {user.expertProfile.githubUrl ? <a href={user.expertProfile.githubUrl} className="text-cyan-700 hover:underline">{user.expertProfile.githubUrl}</a> : "Not set"}</p>
            <p><strong>Passion:</strong> {user.expertProfile.passionStatement ?? "Not set"}</p>
          </CardContent>
        </Card>
      )}
      {user.reviewerProfile && (
        <Card>
          <CardHeader><CardTitle>Participant profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p><strong>How you can support:</strong> {user.reviewerProfile.supportApproach ?? "Not set"}</p>
            <p><strong>Support areas:</strong> {user.reviewerProfile.supportAreas ?? "Not set"}</p>
            <p><strong>GitHub:</strong> {user.reviewerProfile.githubUrl ? <a href={user.reviewerProfile.githubUrl} className="text-cyan-700 hover:underline">{user.reviewerProfile.githubUrl}</a> : "Not set"}</p>
            <p><strong>Passion:</strong> {user.reviewerProfile.passionStatement ?? "Not set"}</p>
          </CardContent>
        </Card>
      )}
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
