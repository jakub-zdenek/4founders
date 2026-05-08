import { notFound } from "next/navigation";
import type { RoleType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAnyRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ProjectAccessLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as RoleType[];
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      accessLogs: {
        include: { actor: true, asset: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();
  if (project.ownerId !== session?.user?.id && !hasAnyRole(roles, ["ADMIN", "MODERATOR"])) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Access Log</h1>
      <Card>
        <CardHeader><CardTitle>Audit trail</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Timestamp</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Asset</Th>
                <Th>Metadata</Th>
              </tr>
            </thead>
            <tbody>
              {project.accessLogs.map((log) => (
                <tr key={log.id}>
                  <Td>{log.createdAt.toISOString()}</Td>
                  <Td>{log.actor.name}</Td>
                  <Td>{log.action}</Td>
                  <Td>{log.asset?.label ?? "Project level"}</Td>
                  <Td className="max-w-xs break-words">{log.metadata ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
