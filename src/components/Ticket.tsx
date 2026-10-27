import { QRCodeSVG } from "qrcode.react";
import { Poster } from "@/components/Poster";
import { formatDate, formatTime, rupees } from "@/lib/format";
import type { BookingWithShow } from "@/lib/queries";

export function Ticket({ booking }: { booking: BookingWithShow }) {
  const s = booking.shows!;
  return (
    <div className="mx-auto grid max-w-2xl overflow-hidden rounded-xl border bg-card md:grid-cols-[180px_1fr_auto]">
      <Poster slug={s.movies!.slug} title={s.movies!.title} posterUrl={s.movies!.poster_url} className="hidden md:flex md:h-full" />
      <div className="space-y-3 p-6">
        <p className="text-xs uppercase tracking-widest text-primary">CineBook e-ticket</p>
        <h2 className="text-4xl leading-none">{s.movies!.title}</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Item label="Theatre" value={`${s.theatres!.name}, ${s.theatres!.location}`} />
          <Item label="Date" value={formatDate(s.show_date)} />
          <Item label="Time" value={formatTime(s.show_time)} />
          <Item label="Seats" value={[...booking.seats].sort().join(", ")} />
          <Item label="Tickets" value={String(booking.seats.length)} />
          <Item label="Total" value={rupees(booking.total_amount)} />
          <Item label="Status" value={booking.status} />
        </dl>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 border-t border-dashed p-6 md:border-l md:border-t-0">
        <div className="rounded bg-foreground p-2"><QRCodeSVG value={booking.reference} size={110} /></div>
        <p className="font-mono text-sm font-bold">{booking.reference}</p>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
