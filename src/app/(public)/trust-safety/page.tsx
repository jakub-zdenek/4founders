import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrustSafetyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trust & Safety</h1>
      <Card>
        <CardHeader>
          <CardTitle>Protection-first design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>- Protected-by-default visibility controls</p>
          <p>- Asset-level access permissions and download restrictions</p>
          <p>- Access logs and suspicious activity review</p>
          <p>- Moderation and accountability for misuse reports</p>
        </CardContent>
      </Card>
    </div>
  );
}
