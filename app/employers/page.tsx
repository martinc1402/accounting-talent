import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { WaitlistForm } from "@/components/firms/WaitlistForm";
import { firms } from "@/content/firms";

export const metadata: Metadata = {
  title: {
    absolute:
      "Hire Indian Accountants Directly, No Agency Markup | AccountingTalent.in",
  },
  description:
    "A vetted database of Indian bookkeepers, staff accountants and US tax preparers. Direct hire, flat subscription, no per-hire fees. Launching Q4 2026.",
};

/*
  One screen. Its only job is capturing emails and validating demand, so the
  page ends at the waitlist. There is nothing below it to scroll to.
*/
export default function ForFirmsPage() {
  return (
    <>
      <Nav active="/employers" />

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 pt-14 pb-16 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7">
            <h1 className="display display-hero text-ink">
              {firms.h1}
            </h1>

            <p className="mt-7 max-w-[60ch] text-lede text-muted">
              {firms.sub}
            </p>

            <dl className="mt-12">
              {firms.proof.map((point) => (
                <div key={point.title} className="border-t border-line py-7">
                  <dt className="text-body font-medium text-navy">
                    {point.title}
                  </dt>
                  <dd className="mt-2 max-w-[62ch] text-body text-muted">
                    {point.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-[3/2] overflow-hidden rounded-card bg-mist">
                <Image
                  src={firms.image.src}
                  alt={firms.image.alt}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-6 rounded-card bg-mist p-7">
                <h2 className="display display-step text-ink">
                  {firms.waitlist.heading}
                </h2>
                <p className="mt-3 max-w-[38ch] text-small text-muted">
                  {firms.waitlist.body}
                </p>

                <div className="mt-6">
                  <WaitlistForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
