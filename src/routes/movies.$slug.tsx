import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Globe, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/Layout";
import { Poster } from "@/components/Poster";
import { movieQuery, showsQuery } from "@/lib/queries";
import { formatDate, formatDuration, formatTime, rupees } from "@/lib/format";

export const Route = createFileRoute("/movies/$slug")({
  loader: async ({ context, params }) => {
    const movie = await context.queryClient.ensureQueryData(movieQuery(params.slug));
    if (!movie) throw notFound();
    return { title: movie.title, description: movie.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — CineBook` : "Movie — CineBook" },
      { name: "description", content: loaderData?.description ?? "Movie details on CineBook" },
      { property: "og:title", content: loaderData ? `${loaderData.title} — CineBook` : "Movie — CineBook" },
      { property: "og:description", content: loaderData?.description ?? "Movie details on CineBook" },
    ],
  }),
  notFoundComponent: () => <PageShell><p className="text-center">Movie not found. <Link to="/movies" className="text-primary">Back to movies</Link></p></PageShell>,
  component: MovieDetails,
});

function MovieDetails() {
  const { slug } = Route.useParams();
  const { data: movie } = useSuspenseQuery(movieQuery(slug));
  const { data: shows = [] } = useQuery({ ...showsQuery(movie!.id), enabled: !!movie });
  if (!movie) return null;

  const theatres = [...new Map(shows.map((s) => [s.theatres!.id, s.theatres!])).values()];
  const dates = [...new Set(shows.map((s) => s.show_date))];
  const times = [...new Set(shows.map((s) => s.show_time))].sort();

  return (
    <PageShell>
      <div className="grid gap-10 md:grid-cols-[320px_1fr]">
        <Poster slug={movie.slug} title={movie.title} posterUrl={movie.poster_url} className="rounded-lg shadow-glow" />
        <div className="space-y-6">
          <div>
            <p className="text-primary">{movie.genre}</p>
            <h1 className="text-6xl leading-none">{movie.title}</h1>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" />{movie.rating}/10</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDuration(movie.duration_minutes)}</span>
            <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{movie.language}</span>
          </div>
          <p className="max-w-2xl text-lg">{movie.description}</p>
          <p className="text-2xl font-semibold">{rupees(movie.ticket_price)} <span className="text-sm font-normal text-muted-foreground">per seat</span></p>

          {movie.status === "upcoming" ? (
            <p className="rounded-md border border-primary/40 bg-accent p-4">Coming soon — bookings open closer to release.</p>
          ) : (
            <>
              <Info title="Theatres">
                {theatres.map((t) => (
                  <span key={t.id} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"><MapPin className="h-3.5 w-3.5 text-primary" />{t.name}, {t.location}</span>
                ))}
              </Info>
              <Info title="Available dates">
                {dates.map((d) => <span key={d} className="rounded-md border px-3 py-1.5 text-sm">{formatDate(d)}</span>)}
              </Info>
              <Info title="Showtimes">
                {times.map((t) => <span key={t} className="rounded-md border px-3 py-1.5 text-sm">{formatTime(t)}</span>)}
              </Info>
              <Button asChild size="lg" className="shadow-glow">
                <Link to="/book/$slug" params={{ slug: movie.slug }}>Book Tickets</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-2xl">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
