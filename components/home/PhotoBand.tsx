import Image from "next/image";
import { photoBand } from "@/content/home";

/*
  A full-bleed photograph, purely to break the scroll.

  Between "Who we're looking for" and "Where we are right now" the page runs
  thousands of pixels of near-continuous text, and that is where it dies. This is
  the same job Spark's full-bleed team photo does.

  No overlay, no caption, no claim. It is a firm partner reading paperwork, which
  is to say the person on the other end of this: the one who will eventually hire
  you. Atmosphere, not evidence. The moment it carries a caption it starts
  implying a customer we do not have.

  Height-capped rather than aspect-ratio'd, because the source is 1600px wide and
  a tall full-bleed crop would soften it on a large screen.
*/
export function PhotoBand() {
  return (
    <section className="relative h-[280px] w-full sm:h-[360px] lg:h-[440px]">
      {/* The band is far wider than the source is tall, so object-cover crops
          hard vertically. Centred, that crop lands below the subject's eyes and
          cuts the top of his head off. Pulling the focal point up to 20% keeps
          the face in frame at every width. */}
      <Image
        src={photoBand.src}
        alt={photoBand.alt}
        fill
        sizes="100vw"
        className="object-cover object-[center_20%]"
      />
    </section>
  );
}
