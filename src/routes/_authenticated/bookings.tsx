import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/Layout";
import { Poster } from "@/components/Poster";
import { myBookingsQuery } from "@/lib/queries";
import { formatDate, formatTime, rupees } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — CineBook" },
      { name: "description", content: "All your CineBook movie bookings." },
      { property: "og:title", content: "My Bookings — CineBook" },
      { property: "og:description", content: "All your CineBook movie bookings." },
    ],
  }),
  component: Bookings,
});

function Bookings() {
  const { user } = Route.useRouteContext();
  const { data: bookings, isLoading } = useQuery(myBookingsQuery(user.id));

  return (
    <PageShell>
      <h1 className="mb-8 text-5xl">My Bookings</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !bookings?.length ? (
        <div className="rounded-xl border border-dashed py-20 text-center">
          <TicketIcon className="mx-auto mb-4 h-12 w-12 text-primary" />
          <p className="text-lg">No bookings yet — your next movie night is waiting!</p>
          <Button asChild className="mt-6"><Link to="/movies">Browse Movies</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const s = b.shows!;
            return (
              <div key={b.id} className="flex gap-4 rounded-xl border bg-card p-4 transition hover:border-primary">
                <Poster slug={s.movies!.slug} title={s.movies!.title} posterUrl={s.movies!.poster_url} className="w-20 shrink-0 rounded text-xs [&_span]:text-sm" />
                <div className="flex flex-1 flex-col gap-1 text-sm md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-primary">{b.reference}</p>
                    <h2 className="text-2xl leading-none">{s.movies!.title}</h2>
                    <p className="text-muted-foreground">{s.theatres!.name} · {formatDate(s.show_date)} · {formatTime(s.show_time)}</p>
                    <p>Seats: {[...b.seats].sort().join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    <span className="rounded bg-success/20 px-2 py-0.5 text-xs capitalize text-success">{b.status}</span>
                    <span className="text-lg font-bold">{rupees(b.total_amount)}</span>
                    <Button asChild size="sm" variant="outline"><Link to="/ticket/$reference" params={{ reference: b.reference }}>View / Print</Link></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
