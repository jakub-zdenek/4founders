import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "4Founders",
  description: "Trusted launch-readiness platform for early software founders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
