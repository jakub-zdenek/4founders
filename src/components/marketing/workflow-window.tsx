"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Workflow = {
  title: string;
  audience: string;
  steps: string[];
};

export function WorkflowWindow({ workflows }: { workflows: Workflow[] }) {
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const workflow = workflows[workflowIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === workflow.steps.length - 1;

  function selectWorkflow(index: number) {
    setWorkflowIndex(index);
    setStepIndex(0);
  }

  return (
    <section className="space-y-5">
      <div>
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Guided workflows</Badge>
        <h2 className="mt-3 text-3xl font-bold text-slate-950">Choose a path, then move screen by screen</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Each workflow opens in its own focused window so people know exactly what to share,
          why it matters, and what happens next.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">4Founders onboarding</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
            <div className="grid gap-2">
              {workflows.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => selectWorkflow(index)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    workflowIndex === index
                      ? "border-cyan-700 bg-cyan-50 text-cyan-950"
                      : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200"
                  }`}
                >
                  <span className="block font-semibold">{item.title}</span>
                  <span className="text-xs">{item.audience}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Screen {stepIndex + 1} of {workflow.steps.length}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">{workflow.title}</h3>
              </div>
              <div className="min-w-40 rounded-full bg-slate-100 p-1">
                <div
                  className="h-2 rounded-full bg-cyan-700 transition-all"
                  style={{ width: `${((stepIndex + 1) / workflow.steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50/50 p-6">
              <p className="text-sm font-semibold text-slate-500">This screen asks the user to:</p>
              <p className="mt-3 text-2xl font-semibold leading-snug text-slate-950">{workflow.steps[stepIndex]}</p>
            </div>

            <div className="mt-6 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {workflow.steps.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-lg border p-3 ${
                    index === stepIndex
                      ? "border-cyan-700 bg-cyan-50 text-cyan-950"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="font-semibold">Screen {index + 1}:</span> {step}
                </div>
              ))}
            </div>

            <div className="mt-7 flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isFirstStep}
                onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
              >
                Previous screen
              </Button>
              <Button
                type="button"
                disabled={isLastStep}
                onClick={() => setStepIndex((value) => Math.min(workflow.steps.length - 1, value + 1))}
              >
                Next screen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
