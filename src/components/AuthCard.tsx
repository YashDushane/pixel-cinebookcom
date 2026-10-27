import type { ReactNode } from "react";
import { Logo } from "@/components/Layout";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-glow animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="mb-6 text-center text-4xl">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? <p className="mt-1 text-sm text-destructive">{msg}</p> : null;
}
