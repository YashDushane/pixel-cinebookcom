import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/Layout";
import { Ticket } from "@/components/Ticket";
import { bookingQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/ticket/$reference")({
  head: () => ({
    meta: [
      { title: "Your Ticket — CineBook" },
      { name: "description", content: "Your CineBook movie ticket." },
      { property: "og:title", content: "Your Ticket — CineBook" },
      { property: "og:description", content: "Your CineBook movie ticket." },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { reference } = Route.useParams();
  const { data: booking, isLoading } = useQuery(bookingQuery(reference));

  if (isLoading) return <PageShell><p className="text-muted-foreground">Loading ticket…</p></PageShell>;
  if (!booking) return <PageShell><p className="text-center">Ticket not found. <Link to="/bookings" className="text-primary">My Bookings</Link></p></PageShell>;

  return (
    <PageShell>
      <div className="no-print mb-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="text-5xl">Booking Confirmed</h1>
        <p className="text-muted-foreground">Show this ticket at the cinema entrance.</p>
      </div>
      <Ticket booking={booking} />
      <div className="no-print mt-8 flex justify-center gap-3">
        <Button onClick={() => window.print()}><Printer /> Print Ticket</Button>
        <Button asChild variant="outline"><Link to="/bookings">My Bookings</Link></Button>
      </div>
    </PageShell>
  );
}
