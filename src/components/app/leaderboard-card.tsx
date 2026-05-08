import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";

export function LeaderboardCard({
  title,
  projects,
}: {
  title: string;
  projects: Array<{ id: string; name: string; stage: string; score: number; category: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.slice(0, 5).map((project) => (
          <div key={project.id} className="rounded-md border border-border p-3">
            <p className="font-medium">{project.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge value={project.stage} />
              <span className="text-xs text-slate-500">{project.category}</span>
              <span className="ml-auto text-sm font-semibold">{project.score.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
