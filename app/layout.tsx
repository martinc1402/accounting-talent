import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
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
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accountingtalent.in"),
  title: {
    default: "Work Directly for US Accounting Firms | AccountingTalent.in",
    template: "%s | AccountingTalent.in",
  },
  description:
    "A direct-hire platform where US CPA firms find and hire India-based accounting professionals. Free for accountants, permanently. No agency, no commission, no cut of your salary.",
  openGraph: {
    title: "Work Directly for US Accounting Firms",
    description:
      "US CPA firms hire you directly. No agency takes a cut. Free for accounting professionals, permanently.",
    url: "https://accountingtalent.in",
    siteName: "AccountingTalent.in",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#131f5b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">{children}</body>
    </html>
  );
}
