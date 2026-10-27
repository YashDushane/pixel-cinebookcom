import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clapperboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <Clapperboard className="h-7 w-7 text-primary" />
      <span className="font-display text-3xl tracking-wider">
        Cine<span className="text-primary">Book</span>
      </span>
    </Link>
  );
}

const linkClass = "text-sm font-medium text-muted-foreground transition hover:text-foreground";
const activeProps = { className: "text-foreground" };

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const links = (
    <>
      <Link to="/" className={linkClass} activeProps={activeProps} activeOptions={{ exact: true }} onClick={() => setOpen(false)}>Home</Link>
      <Link to="/movies" className={linkClass} activeProps={activeProps} onClick={() => setOpen(false)}>Movies</Link>
      <Link to="/bookings" className={linkClass} activeProps={activeProps} onClick={() => setOpen(false)}>My Bookings</Link>
      {isAdmin && <Link to="/admin" className={linkClass} activeProps={activeProps} onClick={() => setOpen(false)}>Admin</Link>}
    </>
  );

  const authButtons = user ? (
    <Button variant="outline" size="sm" onClick={logout}><LogOut /> Logout</Button>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
      <Button asChild size="sm"><Link to="/register">Register</Link></Button>
    </>
  );

  return (
    <header className="no-print sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">{links}</nav>
        <div className="hidden items-center gap-2 md:flex">{authButtons}</div>
        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-4 border-t px-4 py-4 md:hidden">
          {links}
          <div className="flex gap-2">{authButtons}</div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <Logo />
        <nav className="flex gap-6">
          <Link to="/about" className={linkClass}>About Us</Link>
          <Link to="/contact" className={linkClass}>Contact</Link>
          <Link to="/help" className={linkClass}>Help</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CineBook · College project demo</p>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-7xl px-4 py-10 animate-in fade-in duration-500">{children}</main>;
}
