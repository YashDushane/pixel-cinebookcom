import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, FieldError } from "@/components/AuthCard";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Login — CineBook" },
      { name: "description", content: "Log in to CineBook to book movie tickets." },
      { property: "og:title", content: "Login — CineBook" },
      { property: "og:description", content: "Log in to CineBook to book movie tickets." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    // only allow same-site paths
    const to = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/movies";
    navigate({ to });
  };

  return (
    <AuthCard title="Login">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FieldError msg={errors["email"]} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FieldError msg={errors["password"]} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in…" : "Login"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to CineBook? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
      </p>
    </AuthCard>
  );
}
