import { honest } from "@/content/home";
import { HonestStage } from "@/components/marketing/HonestStage";

/*
  Where we are right now, accountant side. Now a thin call to the shared
  HonestStage, which the employer page also renders.

  This and HonestStatus were structural twins carrying a byte-identical promise
  <dl>, which is exactly the arrangement where one gets softened and the other
  does not. Sharing the component means a change to the SHAPE of this section
  cannot land on one page only.

  What keeps it honest is still the copy. `honest.admission` ("There is no job
  waiting for you today.") is the sentence the whole brand rests on, and its
  employer-side counterpart says the equivalent thing to firms. Softening either
  one while the other stands is the single move that would discredit both pages.

  This page carries the "what you should not expect" list, which is where the
  pay-to-rank promise and the no-invented-listings promise are made in the
  negative. They are stronger there than anywhere else on the page, because a
  reader who has been burned by this market is scanning for exactly them.
*/
export function TheHonestPart() {
  return (
    <HonestStage
      heading={honest.h2}
      lede={honest.lede}
      body={honest.body}
      admission={honest.admission}
      expectIntro={honest.expectIntro}
      expect={honest.expect}
      notIntro={honest.notIntro}
      not={honest.not}
      band="mist"
    />
  );
}
