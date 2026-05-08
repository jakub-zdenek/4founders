import { Badge } from "@/components/ui/badge";

const styleMap: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  IMPROVING: "bg-amber-100 text-amber-700",
  CATEGORY_STRONG: "bg-emerald-100 text-emerald-700",
  LAUNCH_CANDIDATE: "bg-indigo-100 text-indigo-700",
  EXPERT_FINALIZATION: "bg-violet-100 text-violet-700",
  READY_FOR_GO_LIVE: "bg-cyan-100 text-cyan-700",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge className={styleMap[value] ?? ""}>{value.replaceAll("_", " ")}</Badge>;
}
