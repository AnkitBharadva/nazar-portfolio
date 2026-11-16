import type { Metadata } from "next";
import Portfolio from "@/components/Portfolio";
import { getSiteData } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Secret admin entry: the homepage with the sign-in dialog open. Nothing
 * on the site links here, it is not in the sitemap, and it is noindex so
 * search engines never list it. It is deliberately NOT in robots.txt —
 * listing it there would advertise the path. The passcode is still the
 * real lock; this page only hides the door.
 */
export const metadata: Metadata = {
  title: "Ankit Bharadva",
  robots: { index: false, follow: false },
};

export default async function Nazar() {
  const data = await getSiteData();
  return <Portfolio initialData={data} openLogin />;
}
