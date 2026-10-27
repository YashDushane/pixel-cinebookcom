import type { ReactNode } from "react";
import { PageShell } from "@/components/Layout";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl space-y-4 text-muted-foreground">
        <h1 className="text-5xl text-foreground">{title}</h1>
        {children}
      </div>
    </PageShell>
  );
}
