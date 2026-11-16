import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { siteUrl } from "@/lib/siteUrl";
import CursorCharm from "@/components/CursorCharm";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  // 700 is unused anywhere (no font-bold); 500/600 cover every display use.
  weight: ["500", "600"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  // 600 is used by the metric values (font-mono + font-semibold); without
  // the real file the browser faux-bolds them.
  weight: ["400", "500", "600"],
});

const siteTitle = "Ankit Bharadva";
const siteDescription =
  "Portfolio of Ankit Bharadva, a Computer Engineering student building machine learning, data and Generative AI systems. Four projects on show; the rest start sealed behind the evil eye — remove the nazar to read the case study.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: "/" },
  // Google Search Console ownership verification (URL-prefix property).
  verification: { google: "hC5h1gBsli435g-th-BE_WOycBLeV6DB9OdrUaKQkrM" },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: siteTitle,
    locale: "en_IN",
    type: "website",
    // og:image comes from app/opengraph-image.tsx (Next picks it up
    // automatically for this segment).
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    // No creator handle: he has none on record, so none is claimed.
    // twitter:image falls back to the og:image above.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Analytics />
        <CursorCharm />
      </body>
    </html>
  );
}
