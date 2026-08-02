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
  Site-wide defaults, now firm-facing. These used to sell the accountant side
  because "/" was the accountant page; that page is /accountants and carries its
  own worker metadata, so the defaults follow the homepage.

  This matters more than it looks. The old /employers route documented the exact
  failure in reverse: a firm owner sharing the employer page previewed the
  accountant pitch, because the root OG sold the worker side. Any route that does
  not override these now inherits the firm framing, which is the right default
  when the firm page is the front door.

  locale is en_US to match: US accounting firms are the audience for "/", and
  /accountants sets en_IN back for its own readers.

  [TODO: OG IMAGE]. There is no opengraph-image anywhere in the repo, so shares
  render as a text card. Generating one via ImageResponse means committing a
  Newsreader font binary (satori needs real font data and cannot read a CSS font
  stack), which is a call to make deliberately rather than in passing.
*/
export const metadata: Metadata = {
  metadataBase: new URL("https://accountingtalent.in"),
  title: {
    default:
      "Hire Vetted Indian Accountants for Your US Firm | AccountingTalent.in",
    template: "%s | AccountingTalent.in",
  },
  description:
    "A verified database of India-based accounting professionals for US CPA firms. Search, request an introduction, and hire directly. No staffing agency and no monthly per-seat markup.",
  openGraph: {
    title: "Hire Vetted Indian Accountants for Your US Firm",
    description:
      "Search a verified database of Indian bookkeepers, tax preparers and accountants. Interview and hire them directly, with no agency markup and no exclusivity.",
    url: "https://accountingtalent.in",
    siteName: "AccountingTalent.in",
    locale: "en_US",
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
