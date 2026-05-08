import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorksPage() {
  const steps = [
    "Founder submits project with protected-by-default visibility.",
    "Reviewers evaluate using rubric-based structured feedback.",
    "Founder iterates versions and tracks improvements over time.",
    "Top projects receive expert finalization before launch.",
    "Only launch-ready products earn broad public visibility.",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">How 4Founders Works</h1>
      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Card key={step}>
            <CardHeader>
              <CardTitle>Step {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700">{step}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
