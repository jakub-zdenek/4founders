import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session?.user?.id ?? "" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-md border border-border p-3">
              <p className="font-medium">{notification.title}</p>
              <p>{notification.body}</p>
              <p className="text-xs text-slate-500">{notification.createdAt.toISOString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
