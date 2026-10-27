import { Link } from "@tanstack/react-router";
import { Clock, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Poster } from "@/components/Poster";
import { formatDuration, rupees } from "@/lib/format";
import type { Movie } from "@/lib/queries";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-glow">
      <div className="relative overflow-hidden">
        <Poster
          slug={movie.slug}
          title={movie.title}
          posterUrl={movie.poster_url}
          className="transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-background/80 px-2 py-1 text-sm font-semibold">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {movie.rating}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-2xl leading-none">{movie.title}</h3>
        <p className="text-sm text-primary">{movie.genre}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDuration(movie.duration_minutes)}</span>
          <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{movie.language}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{movie.description}</p>
        <p className="mt-auto pt-2 font-semibold">{rupees(movie.ticket_price)} <span className="text-xs font-normal text-muted-foreground">/ seat</span></p>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/movies/$slug" params={{ slug: movie.slug }}>View Details</Link>
          </Button>
          <Button asChild size="sm" disabled={movie.status !== "now_showing"}>
            <Link to="/book/$slug" params={{ slug: movie.slug }}>Book Tickets</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
