import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">About the Mission</h1>
      <Card>
        <CardHeader>
          <CardTitle>Why 4Founders exists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <p>
            We help the strongest software ideas mature safely, earn credible support, and launch when they are truly ready to create impact.
          </p>
          <p>
            The platform rewards signal, consistency, and useful contribution over hype and shallow engagement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
