import { LAUNCH_WORKER } from "./site";

export type FaqItem = {
  q: string;
  a: string[];
};

/*
  The first four entries are the homepage short-FAQ. /faq renders the whole
  list. Reordering here reorders both.
*/
export const faq: FaqItem[] = [
  {
    q: "Is this really free?",
    a: [
      "Yes, permanently, for accounting professionals. US\u00A0firms pay a subscription to search the database. If anyone ever asks you for money to join, it is not us.",
    ],
  },
  {
    q: "I don't have US\u00A0experience. Should I still apply?",
    a: [
      "Yes, if you are a CA, CA\u00A0Inter, CMA, or an experienced accountant. Many US\u00A0firms train strong fundamentals. You will be in the trainable pool, shown to firms that hire for potential.",
    ],
  },
  {
    q: "How would a US\u00A0firm pay me?",
    a: [
      "Directly, in USD, via international transfer or payment platforms. This is the same way thousands of Indian freelancers and remote workers are paid today.",
      "We are also building payment tooling that handles the FIRC paperwork you need for GST and tax filing.",
    ],
  },
  {
    q: "Do I have to work US\u00A0night hours?",
    a: [
      "No. Many roles (bookkeeping, tax\u00A0prep) work fine on Indian hours with overnight turnaround. Roles needing live collaboration pay more for evening overlap. You declare your preference in the application.",
    ],
  },
  {
    q: "What is the verification assessment?",
    a: [
      "A short written prompt (describe an accounting problem you solved) plus 10 questions on US\u00A0accounting and tax basics. It takes about 20 minutes.",
      "It exists because Verified is what makes US\u00A0firms trust the database, and what gets you hired faster.",
    ],
  },
  {
    q: "What if I only know Tally?",
    a: [
      "Apply anyway and answer honestly. You will join the training pipeline. We will point you to free QuickBooks Online certification (Intuit's is free) and you can upgrade your profile once you complete it.",
      "Do not claim software you cannot use. Firms test in interviews, and false claims get profiles removed permanently.",
    ],
  },
  {
    q: "Is this legal? Do I need a company or GST registration?",
    a: [
      "Working for a foreign client as an Indian freelancer or contractor is legal and common. Depending on your income you may need GST registration. Exports of services are zero-rated, but the paperwork (FIRC and FIRA) matters.",
      "We publish plain-language guides on this before launch, and our payment tooling is being built to generate the right documentation automatically.",
      "We are a platform, not tax advisors. For your personal situation, consult a CA. You probably know one.",
    ],
  },
  {
    q: "Can I apply if I'm currently employed at an offshore firm?",
    a: [
      "Yes. Your profile is not public to everyone: only paying, verified US\u00A0firms can browse it. You control what identifying detail appears, and you choose when to respond to contact.",
    ],
  },
  {
    q: "What does referring a friend actually get me?",
    a: [
      "For the first 90 days after employer launch, both you and the person you referred sort above equivalent profiles in firm search results. That is the whole promise, stated plainly.",
    ],
  },
  {
    q: "What happens to my data?",
    a: [
      "It is shown only to subscribed US\u00A0employers, never sold, and deletable on request. The full policy is on our Privacy and Terms page.",
    ],
  },
  {
    q: "When do US\u00A0firms actually start hiring?",
    a: [
      `We open the database to US\u00A0accounting firms in ${LAUNCH_WORKER}. There is no job waiting for you today, and we are not going to pretend otherwise. If that date slips, we will email you and say so.`,
    ],
  },
];

export const homepageFaq = faq.slice(0, 4);
