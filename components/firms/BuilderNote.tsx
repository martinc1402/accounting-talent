import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { firms } from "@/content/firms";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/*
  Section 8. "Who's building this": a note, not an About page. The only human
  signal on the old page was a footer line about an Australian operator, which
  reads as a mystery to a US firm owner; this puts a face, a name, and a direct
  email in front of them. The photo and name sit as a signed byline at the top,
  the way a letter is signed, and the note reads as the letter below it.
*/
export function BuilderNote() {
  const { builder } = firms;

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="max-w-[640px]">
          <SectionHeading>{builder.heading}</SectionHeading>

          {/* Signed byline: photo left, name + role beside it. Square source, so
              object-cover needs no special position; the hairline ring gives the
              B&W photo an edge on the white band. */}
          <div className="mt-6 flex items-center gap-4">
            <Image
              src={builder.photo.src}
              alt={builder.photo.alt}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-card object-cover ring-1 ring-line"
            />
            <div>
              <p className="text-body font-medium text-ink">{builder.name}</p>
              <p className="text-small text-subtle">{builder.role}</p>
            </div>
          </div>

          {builder.body.map((para) => (
            <p key={para.slice(0, 24)} className="mt-5 text-body text-muted">
              {para}
            </p>
          ))}

          <p className="mt-5 text-body text-muted">
            {builder.contactLead}{" "}
            <a
              href={`mailto:${builder.email}`}
              className="text-navy underline underline-offset-2 hover:text-navy-deep"
            >
              {builder.email}
            </a>
            . {builder.contactTail}
          </p>

          <a
            href={builder.linkedin.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-1.5 text-caption font-medium text-navy"
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
