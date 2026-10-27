import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovieCard } from "@/components/MovieCard";
import { moviesQuery, type Movie } from "@/lib/queries";
import hero from "@/assets/hero-cinema.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineBook — Book Your Movie Tickets" },
      { name: "description", content: "Find now showing and upcoming movies and book cinema seats in seconds." },
      { property: "og:title", content: "CineBook — Book Your Movie Tickets" },
      { property: "og:description", content: "Find now showing and upcoming movies and book cinema seats in seconds." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(moviesQuery),
  component: Home,
});

function Home() {
  const { data: movies } = useSuspenseQuery(moviesQuery);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const nowShowing = movies.filter((m) => m.status === "now_showing");
  const upcoming = movies.filter((m) => m.status === "upcoming");

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">Now in cinemas</p>
          <h1 className="text-6xl leading-none md:text-8xl">Book Your<br />Movie Tickets</h1>
          <p className="mt-4 max-w-md text-muted-foreground">Pick a movie, choose your seats and get your ticket instantly.</p>
          <form
            className="mt-8 flex max-w-lg gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/movies", search: { q: q.trim() || undefined } });
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies by title…" className="h-11 bg-background/80 pl-9" maxLength={80} />
            </div>
            <Button type="submit" size="lg" className="h-11">Search</Button>
          </form>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-12">
        <MovieSection title="Now Showing" movies={nowShowing} />
        <MovieSection title="Upcoming Movies" movies={upcoming} />
      </div>
    </>
  );
}

function MovieSection({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section>
      <h2 className="mb-6 border-l-4 border-primary pl-3 text-4xl">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </section>
  );
}
