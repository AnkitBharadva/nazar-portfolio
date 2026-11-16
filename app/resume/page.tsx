import type { Metadata } from "next";
import ResumePage from "@/components/ResumePage";
import { getSiteData } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume — Ankit Bharadva",
  description:
    "Resume of Ankit Bharadva, a Computer Engineering student at Gujarat Technological University, Ahmedabad — 23 projects in machine learning, data and Generative AI, and two hackathon honours, all verified against the repos.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Resume — Ankit Bharadva",
    description:
      "Resume of Ankit Bharadva — Computer Engineering student, 23 projects, two hackathon honours.",
    url: "/resume",
    siteName: "Ankit Bharadva",
    locale: "en_IN",
    type: "website",
    // og:image comes from app/opengraph-image.tsx (nearest in the tree)
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume — Ankit Bharadva",
    description:
      "Resume of Ankit Bharadva — Computer Engineering student, 23 projects, two hackathon honours.",
  },
};

export default async function Resume() {
  const data = await getSiteData();
  return <ResumePage data={data} />;
}
