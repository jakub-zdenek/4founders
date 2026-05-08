import { cn } from "@/lib/utils";

const stages = [
  "DRAFT",
  "UNDER_REVIEW",
  "IMPROVING",
  "CATEGORY_STRONG",
  "LAUNCH_CANDIDATE",
  "EXPERT_FINALIZATION",
  "READY_FOR_GO_LIVE",
] as const;

export function StageTimeline({ currentStage }: { currentStage: string }) {
  const currentIndex = stages.indexOf(currentStage as (typeof stages)[number]);

  return (
    <div className="grid gap-2 md:grid-cols-7">
      {stages.map((stage, index) => (
        <div
          key={stage}
          className={cn(
            "rounded-md border px-2 py-2 text-center text-xs",
            index <= currentIndex
              ? "border-cyan-200 bg-cyan-50 text-cyan-700"
              : "border-slate-200 bg-white text-slate-500",
          )}
        >
          {stage.replaceAll("_", " ")}
        </div>
      ))}
    </div>
  );
}
