import { firms } from "@/content/firms";
import { HonestStage } from "@/components/marketing/HonestStage";

/*
  Section 10: where we actually are. Now a thin call to the shared HonestStage,
  which is also what /accountants renders.

  This and TheHonestPart were structural twins carrying a byte-identical promise
  <dl>, which is exactly the arrangement where one gets softened and the other
  does not. Sharing the component does not by itself keep the two admissions
  honest, but it does mean a change to the SHAPE of this section cannot land on
  one page only.

  The thing that keeps it honest is still the copy, and the rule has not changed:
  a firm owner evaluating us will read /accountants within about two clicks, where
  we tell accountants there is no job waiting for them today. Saying something
  softer here than we say there is the one move that would discredit both pages at
  once. `honest.admission` is the sentence that does that work here.

  This page carries the "what it does not get you" list, which the old version did
  not have. It is where the page absorbs the claims retired from elsewhere: no
  guaranteed hire, no working search today, no employment relationship. The last
  of those used to live in the Edges section's legal disclaimer.
*/
export function HonestStatus() {
  const { honest } = firms;

  return (
    <HonestStage
      heading={honest.heading}
      lede={honest.lede}
      body={honest.body}
      admission={honest.admission}
      expectIntro={honest.expectIntro}
      expect={honest.expect}
      notIntro={honest.notIntro}
      not={honest.not}
    />
  );
}
