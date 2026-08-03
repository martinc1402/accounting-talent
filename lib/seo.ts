import type { Metadata } from "next";

/*
  One place to build a marketing page's metadata.

  Both landing pages hand-wrote the same openGraph block with three of six fields
  differing, and both used `title: { absolute }` to bypass the root template. That
  is four near-identical objects that have to be edited together and never were.

  `title` is set absolute deliberately. The root layout defines a "%s |
  AccountingTalent.in" template, and these two pages carry the site name inside
  their own titles already, so the template would render it twice.

  NO OG IMAGE, still. app/layout.tsx carries the standing [TODO: OG IMAGE] and its
  reason: generating one with satori needs a font binary committed to the repo.
  Until that happens `twitter.card` stays summary_large_image with no image, so
  shares render as text cards. That is a known gap, not an oversight, and this
  helper is where the fix would land for both pages at once.
*/
export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  locale = "en_US",
}: {
  title: string;
  description: string;
  /** Root-relative, e.g. "/accountants". Used for both canonical and og:url. */
  path: string;
  ogTitle: string;
  ogDescription: string;
  /** en_IN on the accountant page: that audience is in India. */
  locale?: "en_US" | "en_IN";
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `https://accountingtalent.in${path === "/" ? "" : path}`,
      siteName: "AccountingTalent.in",
      locale,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
