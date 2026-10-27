import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — CineBook" },
      { name: "description", content: "About the CineBook movie ticket booking project." },
      { property: "og:title", content: "About Us — CineBook" },
      { property: "og:description", content: "About the CineBook movie ticket booking project." },
    ],
  }),
  component: () => (
    <InfoPage title="About Us">
      <p>CineBook is a movie ticket booking website built as a college project. Browse movies, pick a theatre and showtime, choose seats on a live seat map and get a printable e-ticket.</p>
      <p>Payments are a demo only — no real money is charged.</p>
    </InfoPage>
  ),
});
