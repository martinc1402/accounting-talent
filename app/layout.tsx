import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import "./globals.css";

/*
  Spark uses ABC Arizona Mix (display) and Basis Grotesque (body), both
  commercially licensed. Newsreader and Geist are the closest freely
  licensed equivalents. To swap in the real faces later, replace these two
  loaders: the rest of the site reads them through CSS variables only.
*/
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  // Italic is loaded so the display serif can carry a real italic (the employer
  // hero pull-line), rather than the browser synthesising a slant from the roman.
  style: ["normal", "italic"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

/*
  Site-wide defaults, now job-seeker-facing. "/" is the paid job-search
  membership for Indian accountants, so the defaults follow it: en_IN, and any
  route that does not override them previews the job-seeker pitch.

  The previous defaults were the US-firm pitch (en_US). That page now lives at
  /employers and sets its own metadata and en_US explicitly, so a firm sharing
  /employers still previews firm copy. /accountants sets its own too.

  [TODO: OG IMAGE]. There is no opengraph-image anywhere in the repo, so shares
  render as a text card. Generating one via ImageResponse means committing a
  Newsreader font binary (satori needs real font data and cannot read a CSS font
  stack), which is a call to make deliberately rather than in passing.
*/
export const metadata: Metadata = {
  metadataBase: new URL("https://accountingtalent.in"),
  title: {
    default:
      "Remote & Overseas Accounting Jobs for Indian Accountants | AccountingTalent.in",
    template: "%s | AccountingTalent.in",
  },
  description:
    "Accounting jobs from employers' own career pages: remote roles open to India and overseas roles that mention visa sponsorship. No recruiters, no salary cut.",
  openGraph: {
    title: "Remote and overseas accounting jobs, straight from employers' career pages.",
    description:
      "For Indian CAs, CMAs, ACCAs and accountants. Remote roles open to India and roles abroad that mention visa sponsorship, in the US, Canada, UK, Australia and the Gulf.",
    url: "https://accountingtalent.in",
    siteName: "AccountingTalent.in",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#131f5b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Meta Pixel only exists in production with a configured id. Anywhere else
  // (preview, local, unset id) MetaPixel is never rendered, so no script, no
  // noscript, and no network — nothing to execute or opt out of.
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const pixelEnabled =
    process.env.VERCEL_ENV === "production" && Boolean(pixelId);

  return (
    <html
      lang="en"
      className={`${geist.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        {children}
        {/* Vercel Web Analytics: self-detects the environment (no-ops off Vercel
            / in dev), so it renders unconditionally. Custom events fire via
            lib/analytics.ts. Enable Web Analytics in the Vercel dashboard. */}
        <Analytics />
        {pixelEnabled && <MetaPixel pixelId={pixelId!} />}
      </body>
    </html>
  );
}
