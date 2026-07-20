import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 11. "Who's building this": a note, not an About page. The only human
  signal on the old page was a footer line about an Australian operator; this puts
  a face, a name, and a direct email in front of a firm owner.

  It sits in a navy card on the white section (a blue box in the white box), which
  echoes the profile-card language elsewhere on the page: navy body, cream type,
  photo. Fitting, since this is Martin's own profile. Cream tones throughout for
  contrast on the navy.
*/
export function BuilderNote() {
  const { builder } = firms;

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="max-w-[920px] rounded-[1.75rem] bg-navy p-8 shadow-[0_24px_60px_-20px_rgba(19,31,91,0.35)] sm:p-10 lg:p-12">
          <SectionHeading tone="white">{builder.heading}</SectionHeading>

          {/* Signed byline: photo left, name + role beside it. */}
          <div className="mt-6 flex items-center gap-5">
            <Image
              src={builder.photo.src}
              alt={builder.photo.alt}
              width={104}
              height={104}
              className="size-[104px] shrink-0 rounded-card object-cover ring-1 ring-white/15"
            />
            <div>
              <p className="text-body font-medium text-paper">{builder.name}</p>
              <p className="text-small text-paper/65">{builder.role}</p>
            </div>
          </div>

          {builder.body.map((para) => (
            <p
              key={para.slice(0, 24)}
              className="mt-5 max-w-[62ch] text-body text-paper/80"
            >
              {para}
            </p>
          ))}

          <p className="mt-5 max-w-[62ch] text-body text-paper/80">
            {builder.contactLead}{" "}
            <a
              href={`mailto:${builder.email}`}
              className="text-paper underline underline-offset-2 hover:text-white"
            >
              {builder.email}
            </a>
            . {builder.contactTail}
          </p>

          <a
            href={builder.linkedin.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-1.5 text-caption font-medium text-paper hover:text-white"
          >
            {builder.linkedin.label}
            <ArrowUpRight
              size={14}
              weight="light"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </Container>
    </section>
  );
}
