import Portfolio from "@/components/Portfolio";
import { getSiteData } from "@/lib/store";
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getSiteData();
  const { profile } = data;

  // Structured data: Person + WebSite, verified facts only — name, site
  // URL, public profiles, student status, and the five stated interests.
  // The `<` escape keeps admin-editable strings (interests) from ever
  // breaking out of the script tag. sameAs lists only profiles that are
  // actually set, so clearing one in admin drops it here too.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: profile.name,
        url: siteUrl,
        sameAs: [profile.github, profile.kaggle ?? "", profile.huggingface ?? "", profile.linkedin ?? ""].filter(
          Boolean,
        ),
        jobTitle: "Computer Engineering Student",
        knowsAbout: profile.interests,
      },
      {
        "@type": "WebSite",
        name: "Ankit Bharadva",
        url: siteUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Portfolio initialData={data} />
    </>
  );
}
