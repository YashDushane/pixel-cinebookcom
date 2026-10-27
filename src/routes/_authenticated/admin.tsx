import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { moviesQuery, type Movie } from "@/lib/queries";
import { formatDate, formatTime, rupees } from "@/lib/format";

// Only users with the "admin" role may open this page.
// The database also blocks non-admins from changing data (row level security).
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CineBook" },
      { name: "description", content: "Manage movies, theatres, shows and bookings." },
      { property: "og:title", content: "Admin Dashboard — CineBook" },
      { property: "og:description", content: "Manage movies, theatres, shows and bookings." },
    ],
  }),
  component: Admin,
});

const theatresQ = { queryKey: ["theatres"], queryFn: async () => (await supabase.from("theatres").select("*").order("name")).data ?? [] };
const showsQ = {
  queryKey: ["admin-shows"],
  queryFn: async () =>
    (await supabase.from("shows").select("*, movies(title), theatres(name)").gte("show_date", new Date().toISOString().slice(0, 10)).order("show_date").order("show_time").limit(300)).data ?? [],
};
const bookingsQ = {
  queryKey: ["admin-bookings"],
  queryFn: async () => (await supabase.from("bookings").select("*, shows(show_date, show_time, movies(title), theatres(name))").order("created_at", { ascending: false })).data ?? [],
};

function Admin() {
  const { data: bookings = [] } = useQuery(bookingsQ);
  const revenue = bookings.reduce((sum, b) => sum + b.total_amount, 0);
  return (
    <PageShell>
      <h1 className="mb-6 text-5xl">Admin Dashboard</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Stat label="Total bookings" value={String(bookings.length)} />
        <Stat label="Demo revenue" value={rupees(revenue)} />
      </div>
      <Tabs defaultValue="movies">
        <TabsList className="flex-wrap">
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="theatres">Theatres</TabsTrigger>
          <TabsTrigger value="shows">Shows & Prices</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="movies"><MoviesAdmin /></TabsContent>
        <TabsContent value="theatres"><TheatresAdmin /></TabsContent>
        <TabsContent value="shows"><ShowsAdmin /></TabsContent>
        <TabsContent value="bookings">
          <Table head={["Reference", "Movie", "Theatre", "Show", "Seats", "Amount"]}>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-2 font-mono">{b.reference}</td>
                <td className="p-2">{b.shows?.movies?.title}</td>
                <td className="p-2">{b.shows?.theatres?.name}</td>
                <td className="p-2">{b.shows && `${formatDate(b.shows.show_date)} ${formatTime(b.shows.show_time)}`}</td>
                <td className="p-2">{b.seats.join(", ")}</td>
                <td className="p-2">{rupees(b.total_amount)}</td>
              </tr>
            ))}
          </Table>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-bold text-primary">{value}</p></div>;
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted"><tr>{head.map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const emptyMovie = { slug: "", title: "", genre: "", duration_minutes: 120, language: "English", rating: 7, description: "", poster_url: "", ticket_price: 200, status: "now_showing" };

function MoviesAdmin() {
  const qc = useQueryClient();
  const { data: movies = [] } = useQuery(moviesQuery);
  const [form, setForm] = useState<typeof emptyMovie & { id?: string }>(emptyMovie);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.genre.trim()) return toast.error("Title and genre are required");
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = { ...form, slug, poster_url: form.poster_url || null };
    delete payload.id;
    const { error } = form.id
      ? await supabase.from("movies").update(payload).eq("id", form.id)
      : await supabase.from("movies").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Movie updated" : "Movie added");
    setForm(emptyMovie);
    qc.invalidateQueries({ queryKey: ["movies"] });
  };

  const remove = async (m: Movie) => {
    if (!confirm(`Delete ${m.title}? Its shows and bookings will also be deleted.`)) return;
    const { error } = await supabase.from("movies").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Movie deleted");
    qc.invalidateQueries({ queryKey: ["movies"] });
  };

  const f = (key: keyof typeof emptyMovie, label: string, type = "text") => (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={String(form[key] ?? "")} onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="mt-4 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
        {f("title", "Title")}{f("genre", "Genre")}{f("language", "Language")}
        {f("duration_minutes", "Duration (min)", "number")}{f("rating", "Rating", "number")}{f("ticket_price", "Ticket price (₹)", "number")}
        {f("poster_url", "Poster image URL (optional)")}
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="now_showing">Now showing</SelectItem><SelectItem value="upcoming">Upcoming</SelectItem></SelectContent>
          </Select>
        </div>
        {f("description", "Short description")}
        <div className="flex gap-2 md:col-span-3">
          <Button type="submit">{form.id ? "Save changes" : "Add movie"}</Button>
          {form.id && <Button type="button" variant="outline" onClick={() => setForm(emptyMovie)}>Cancel</Button>}
        </div>
      </form>
      <Table head={["Title", "Genre", "Price", "Status", ""]}>
        {movies.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2">{m.title}</td><td className="p-2">{m.genre}</td><td className="p-2">{rupees(m.ticket_price)}</td><td className="p-2">{m.status}</td>
            <td className="p-2 text-right">
              <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setForm({ ...m, poster_url: m.poster_url ?? "", rating: Number(m.rating) })}><Pencil /></Button>
              <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(m)}><Trash2 className="text-destructive" /></Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function TheatresAdmin() {
  const qc = useQueryClient();
  const { data: theatres = [] } = useQuery(theatresQ);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["theatres"] }); qc.invalidateQueries({ queryKey: ["shows"] }); };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Theatre name is required");
    const { error } = await supabase.from("theatres").insert({ name: name.trim(), location: location.trim() });
    if (error) return toast.error(error.message);
    setName(""); setLocation(""); toast.success("Theatre added"); refresh();
  };
  const rename = async (id: string, old: string) => {
    const n = prompt("New theatre name", old);
    if (!n?.trim()) return;
    const { error } = await supabase.from("theatres").update({ name: n.trim() }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this theatre and all its shows?")) return;
    const { error } = await supabase.from("theatres").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div>
      <form onSubmit={add} className="mt-4 flex flex-col gap-2 rounded-xl border bg-card p-4 md:flex-row">
        <Input placeholder="Theatre name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
        <Input placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} />
        <Button type="submit">Add theatre</Button>
      </form>
      <Table head={["Name", "City", ""]}>
        {theatres.map((t) => (
          <tr key={t.id} className="border-t">
            <td className="p-2">{t.name}</td><td className="p-2">{t.location}</td>
            <td className="p-2 text-right">
              <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => rename(t.id, t.name)}><Pencil /></Button>
              <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(t.id)}><Trash2 className="text-destructive" /></Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function ShowsAdmin() {
  const qc = useQueryClient();
  const { data: movies = [] } = useQuery(moviesQuery);
  const { data: theatres = [] } = useQuery(theatresQ);
  const { data: shows = [] } = useQuery(showsQ);
  const [form, setForm] = useState({ movie_id: "", theatre_id: "", show_date: "", show_time: "", price: 200 });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-shows"] }); qc.invalidateQueries({ queryKey: ["shows"] }); };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.movie_id || !form.theatre_id || !form.show_date || !form.show_time) return toast.error("Fill in all show fields");
    if (form.price < 1) return toast.error("Price must be positive");
    const { error } = await supabase.from("shows").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Show added"); refresh();
  };
  const setPrice = async (id: string, old: number) => {
    const p = Number(prompt("New ticket price (₹)", String(old)));
    if (!p || p < 1) return;
    const { error } = await supabase.from("shows").update({ price: p }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this show? Bookings for it are removed too.")) return;
    const { error } = await supabase.from("shows").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div>
      <form onSubmit={add} className="mt-4 grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-6">
        <Select value={form.movie_id} onValueChange={(v) => setForm({ ...form, movie_id: v })}>
          <SelectTrigger><SelectValue placeholder="Movie" /></SelectTrigger>
          <SelectContent>{movies.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={form.theatre_id} onValueChange={(v) => setForm({ ...form, theatre_id: v })}>
          <SelectTrigger><SelectValue placeholder="Theatre" /></SelectTrigger>
          <SelectContent>{theatres.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" value={form.show_date} onChange={(e) => setForm({ ...form, show_date: e.target.value })} />
        <Input type="time" value={form.show_time} onChange={(e) => setForm({ ...form, show_time: e.target.value })} />
        <Input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} aria-label="Price" />
        <Button type="submit">Add show</Button>
      </form>
      <Table head={["Movie", "Theatre", "Date", "Time", "Price", ""]}>
        {shows.map((s) => (
          <tr key={s.id} className="border-t">
            <td className="p-2">{s.movies?.title}</td><td className="p-2">{s.theatres?.name}</td>
            <td className="p-2">{formatDate(s.show_date)}</td><td className="p-2">{formatTime(s.show_time)}</td><td className="p-2">{rupees(s.price)}</td>
            <td className="p-2 text-right">
              <Button size="icon" variant="ghost" aria-label="Edit price" onClick={() => setPrice(s.id, s.price)}><Pencil /></Button>
              <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(s.id)}><Trash2 className="text-destructive" /></Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
