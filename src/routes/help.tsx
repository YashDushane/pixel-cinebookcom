import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — CineBook" },
      { name: "description", content: "How to book movie tickets on CineBook." },
      { property: "og:title", content: "Help — CineBook" },
      { property: "og:description", content: "How to book movie tickets on CineBook." },
    ],
  }),
  component: () => (
    <InfoPage title="Help">
      <ol className="list-decimal space-y-2 pl-5">
        <li>Register an account and confirm your email.</li>
        <li>Open a movie and press Book Tickets.</li>
        <li>Choose a theatre, date, showtime and number of seats.</li>
        <li>Tap green seats to select them (yellow). Red seats are already booked.</li>
        <li>Review the summary and press Confirm Booking.</li>
        <li>Print your ticket or find it later in My Bookings.</li>
      </ol>
    </InfoPage>
  ),
});
