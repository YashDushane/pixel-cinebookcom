import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CineBook" },
      { name: "description", content: "Get in touch with the CineBook team." },
      { property: "og:title", content: "Contact — CineBook" },
      { property: "og:description", content: "Get in touch with the CineBook team." },
    ],
  }),
  component: () => (
    <InfoPage title="Contact">
      <p>Email: support@cinebook.example</p>
      <p>Phone: +91 00000 00000</p>
      <p className="text-xs">(Sample contact details for the demo.)</p>
    </InfoPage>
  ),
});
