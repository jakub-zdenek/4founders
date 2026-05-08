import { Badge } from "@/components/ui/badge";

export function FeedbackThemeChips({ themes }: { themes: Array<{ id: string; theme: string; count: number }> }) {
  if (!themes.length) {
    return <p className="text-sm text-slate-500">No themes yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((theme) => (
        <Badge key={theme.id}>{theme.theme} ({theme.count})</Badge>
      ))}
    </div>
  );
}
