import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MovieCard } from "@/components/MovieCard";
import { PageShell } from "@/components/Layout";
import { moviesQuery } from "@/lib/queries";

export const Route = createFileRoute("/movies/")({
  validateSearch: z.object({ q: z.string().max(80).optional() }),
  head: () => ({
    meta: [
      { title: "All Movies — CineBook" },
      { name: "description", content: "Browse every movie on CineBook and search by title." },
      { property: "og:title", content: "All Movies — CineBook" },
      { property: "og:description", content: "Browse every movie on CineBook and search by title." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(moviesQuery),
  component: MoviesPage,
});

function MoviesPage() {
  const { data: movies } = useSuspenseQuery(moviesQuery);
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/movies/" });
  const filtered = movies.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <PageShell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="text-5xl">Movies</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => navigate({ search: { q: e.target.value || undefined }, replace: true })}
            placeholder="Search by title…"
            className="pl-9"
            maxLength={80}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No movies match "{q}".</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </PageShell>
  );
}
