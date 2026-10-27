import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, FieldError } from "@/components/AuthCard";
import { supabase } from "@/integrations/supabase/client";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — CineBook" },
      { name: "description", content: "Create a free CineBook account." },
      { property: "og:title", content: "Register — CineBook" },
      { property: "og:description", content: "Create a free CineBook account." },
    ],
  }),
  component: Register,
});

function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: parsed.data.fullName } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) toast.success("Account created!");
    else setSent(true);
  };

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto h-12 w-12 text-success" />
          <p className="text-muted-foreground">We sent a confirmation link to <b className="text-foreground">{form.email}</b>. Click it, then log in.</p>
          <Button asChild className="w-full"><Link to="/login">Go to Login</Link></Button>
        </div>
      </AuthCard>
    );
  }

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      <FieldError msg={errors[key]} />
    </div>
  );

  return (
    <AuthCard title="Register">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field("fullName", "Full name")}
        {field("email", "Email", "email")}
        {field("password", "Password", "password")}
        {field("confirm", "Confirm password", "password")}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account…" : "Register"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
      </p>
    </AuthCard>
  );
}
