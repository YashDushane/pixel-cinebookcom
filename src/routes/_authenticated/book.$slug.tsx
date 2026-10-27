import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/Layout";
import { SeatMap } from "@/components/SeatMap";
import { supabase } from "@/integrations/supabase/client";
import { bookedSeatsQuery, movieQuery, showsQuery } from "@/lib/queries";
import { calcTotal, formatDate, formatTime, MAX_SEATS, rupees, toggleSeat } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/book/$slug")({
  head: () => ({
    meta: [
      { title: "Book Tickets — CineBook" },
      { name: "description", content: "Choose theatre, showtime and seats." },
      { property: "og:title", content: "Book Tickets — CineBook" },
      { property: "og:description", content: "Choose theatre, showtime and seats." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: movie, isLoading } = useQuery(movieQuery(slug));
  const { data: shows = [] } = useQuery({ ...showsQuery(movie?.id ?? ""), enabled: !!movie });

  const [theatreId, setTheatreId] = useState("");
  const [date, setDate] = useState("");
  const [showId, setShowId] = useState("");
  const [seatCount, setSeatCount] = useState(2);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "summary">("select");
  const [submitting, setSubmitting] = useState(false);

  const theatres = useMemo(() => [...new Map(shows.map((s) => [s.theatres!.id, s.theatres!])).values()], [shows]);
  const dates = useMemo(() => [...new Set(shows.filter((s) => s.theatre_id === theatreId).map((s) => s.show_date))], [shows, theatreId]);
  const times = shows.filter((s) => s.theatre_id === theatreId && s.show_date === date);
  const show = shows.find((s) => s.id === showId);

  useEffect(() => { if (!theatreId && theatres[0]) setTheatreId(theatres[0].id); }, [theatres, theatreId]);
  useEffect(() => { if (dates.length && !dates.includes(date)) setDate(dates[0]); }, [dates, date]);
  useEffect(() => { setShowId(""); setSelected([]); }, [theatreId, date]);
  useEffect(() => { setSelected([]); }, [showId]);

  const { data: booked = new Set<string>() } = useQuery({ ...bookedSeatsQuery(showId), enabled: !!showId });

  if (isLoading) return <PageShell><p className="text-muted-foreground">Loading…</p></PageShell>;
  if (!movie) return <PageShell><p>Movie not found. <Link to="/movies" className="text-primary">Back</Link></p></PageShell>;
  if (movie.status !== "now_showing")
    return <PageShell><p>{movie.title} is coming soon — bookings are not open yet.</p></PageShell>;

  const price = show?.price ?? movie.ticket_price;
  const total = calcTotal(selected.length, price);

  const confirm = async () => {
    setSubmitting(true);
    // The database checks seat availability and saves the booking in one safe step.
    const { data, error } = await supabase.rpc("book_seats", { _show_id: showId, _seats: selected });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      qc.invalidateQueries({ queryKey: ["booked-seats", showId] });
      setSelected([]);
      setStep("select");
      return;
    }
    toast.success("Booking confirmed!");
    qc.invalidateQueries({ queryKey: ["bookings"] });
    navigate({ to: "/ticket/$reference", params: { reference: data.reference } });
  };

  if (step === "summary" && show) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg rounded-xl border bg-card p-6 shadow-glow">
          <h1 className="mb-4 text-4xl">Booking Summary</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Booking ID</dt><dd>Generated after confirmation</dd>
            <dt className="text-muted-foreground">Movie</dt><dd className="font-semibold">{movie.title}</dd>
            <dt className="text-muted-foreground">Theatre</dt><dd>{show.theatres!.name}, {show.theatres!.location}</dd>
            <dt className="text-muted-foreground">Date & time</dt><dd>{formatDate(show.show_date)} · {formatTime(show.show_time)}</dd>
            <dt className="text-muted-foreground">Seats</dt><dd>{[...selected].sort().join(", ")}</dd>
            <dt className="text-muted-foreground">Tickets</dt><dd>{selected.length} × {rupees(price)}</dd>
            <dt className="text-muted-foreground">Total</dt><dd className="text-xl font-bold text-primary">{rupees(total)}</dd>
          </dl>
          <p className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Demo checkout: no real payment is taken and no card details are collected.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep("select")} disabled={submitting}>Back</Button>
            <Button className="flex-1" onClick={confirm} disabled={submitting}>{submitting ? "Confirming…" : "Confirm Booking"}</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-5xl">{movie.title}</h1>
      <p className="mb-8 text-muted-foreground">Choose your show and seats</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Theatre</Label>
          <Select value={theatreId} onValueChange={setTheatreId}>
            <SelectTrigger><SelectValue placeholder="Choose theatre" /></SelectTrigger>
            <SelectContent>{theatres.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}, {t.location}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Select value={date} onValueChange={setDate}>
            <SelectTrigger><SelectValue placeholder="Choose date" /></SelectTrigger>
            <SelectContent>{dates.map((d) => <SelectItem key={d} value={d}>{formatDate(d)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Number of seats</Label>
          <Select value={String(seatCount)} onValueChange={(v) => { setSeatCount(Number(v)); setSelected([]); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({ length: MAX_SEATS }, (_, i) => <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Label>Showtime</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {times.length === 0 && <p className="text-sm text-muted-foreground">No shows for this date.</p>}
          {times.map((s) => (
            <button
              key={s.id}
              onClick={() => setShowId(s.id)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm transition hover:border-primary",
                showId === s.id && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {formatTime(s.show_time)}
            </button>
          ))}
        </div>
      </div>

      {show ? (
        <div className="mt-10 rounded-xl border bg-card p-4 md:p-8">
          <SeatMap booked={booked} selected={selected} onToggle={(seat) => {
            const next = toggleSeat(selected, seat, booked, seatCount);
            if (next === selected && !booked.has(seat)) toast.info(`You chose ${seatCount} seat(s). Deselect one or change the number.`);
            setSelected(next);
          }} />
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row">
            <div>
              <p className="text-sm text-muted-foreground">Selected seats ({selected.length}/{seatCount})</p>
              <p className="font-semibold">{selected.length ? [...selected].sort().join(", ") : "None yet"}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">{selected.length} × {rupees(price)}</p>
              <p className="text-3xl font-bold text-primary">{rupees(total)}</p>
            </div>
            <Button size="lg" disabled={selected.length !== seatCount} onClick={() => setStep("summary")}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">Pick a showtime to see the seats.</p>
      )}
    </PageShell>
  );
}
