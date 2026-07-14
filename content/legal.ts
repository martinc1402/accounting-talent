import { CONTACT_EMAIL, LAUNCH_WORKER, OPERATOR } from "./site";

/*
  ⚠️ DRAFT. NOT LEGALLY REVIEWED.

  This text was written from the facts stated in site-structure-and-copy.md
  (operator is Kaya Virtual, an Australian sole trader; profiles are shown only
  to subscribed US employers; data is never sold; deletion on request). It is a
  plain-language starting point, not advice, and it has not been read by a
  lawyer.

  Before launch this needs review by someone qualified on: Indian DPDP Act
  2023 obligations for processing Indian residents' data, Australian Privacy
  Act obligations for the operating entity, and cross-border transfer of
  personal data from India to the US and Australia.
*/

export const updated = "13 July 2026";

export type LegalSection = {
  heading: string;
  body: string[];
};

export const privacy: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `AccountingTalent.in is a talent database operated by ${OPERATOR}. We are not a staffing agency, not an employer, and not a party to any employment agreement you may enter into with a firm you meet through us.`,
      `You can reach us at ${CONTACT_EMAIL}.`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      "When you apply, we collect the answers you give us: your name, email address, WhatsApp number, city, and optionally a LinkedIn URL. We also collect your professional details: qualification, years of experience, US-client experience, role, software skills, US\u00A0tax\u00A0forms prepared, salary expectation, availability, working hours, notice period, and whether you have a working home setup.",
      "We record how you heard about us, and if an advertisement brought you here, the campaign it came from.",
      "We do not ask for your PAN, Aadhaar, bank details, or any payment information. We will never ask you for money.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "Every question on the application form maps to something a US\u00A0accounting firm will search for, or to a check on whether the profile is genuine. That is the whole purpose of the database.",
      "We use your email to verify that you are a real applicant, and your WhatsApp number to reach you about the skills assessment.",
    ],
  },
  {
    heading: "Who sees your profile",
    body: [
      "Your profile is shown to US\u00A0accounting firms that hold a paid subscription to the database. It is not public, it is not indexed by search engines, and it is not visible to people who have not paid and been verified.",
      "We do not sell your data. We do not share it with advertisers, data brokers, or third-party recruiters.",
    ],
  },
  {
    heading: "Where your data is held",
    body: [
      "Your data is stored on servers operated by our infrastructure providers, which may be located outside India, including in the United States and Europe. By applying you consent to this transfer.",
      "Subscribed employers who view your profile are typically located in the United States.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep your profile for as long as you want to be listed. If your email is never verified, we archive the application after 72 hours and it is not reviewed.",
      "If you ask us to delete your profile, we delete it.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      `Email ${CONTACT_EMAIL} and we will show you what we hold about you, correct anything wrong, or delete your profile entirely. There is no exit interview and no penalty. We aim to respond within 30 days.`,
      "You can withdraw from the database at any time, including after a firm has contacted you.",
    ],
  },
];

export const terms: LegalSection[] = [
  {
    heading: "What this service is",
    body: [
      "AccountingTalent.in lists accounting professionals in India so that accounting firms in the United States can find them and hire them directly.",
      "We are a database. We are not your employer, not your agent, and not a party to whatever agreement you and a firm reach. We do not negotiate your salary, guarantee you a job, or take a commission from your pay.",
    ],
  },
  {
    heading: "It is free for professionals",
    body: [
      "Listing yourself on AccountingTalent.in is free, and will remain free. Our revenue comes from firms paying for access to the database.",
      "We will never charge you a fee, a commission, a deposit, or a cut of your salary. If anyone contacts you claiming to represent us and asks you for money, it is not us. Please tell us about it.",
    ],
  },
  {
    heading: "Be accurate",
    body: [
      "You must answer the application honestly. Do not claim qualifications you do not hold or software you cannot use. Firms test these things in interviews, and misrepresenting your skills or qualifications will result in your profile being removed permanently.",
      "You may only create one profile, and it must be your own.",
    ],
  },
  {
    heading: "There is no job today",
    body: [
      `We open the database to US\u00A0firms in ${LAUNCH_WORKER}. Applying now does not entitle you to a job, an interview, or contact from any firm. If that date changes, we will email you and tell you so.`,
      "Salary figures shown anywhere on this site are typical or illustrative. They are not offers and not promises.",
    ],
  },
  {
    heading: "Your own tax and legal position",
    body: [
      "If a US\u00A0firm hires you, you deal with them directly and you are responsible for your own tax, GST, and regulatory obligations in India. We publish general guidance, but we are a platform, not tax advisors. For your personal situation, consult a chartered accountant.",
    ],
  },
  {
    heading: "Ending it",
    body: [
      "You can delete your profile at any time by emailing us. We may remove a profile that breaks these terms, and we may stop offering the service.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      `${OPERATOR} operates this service. These terms are governed by the law of the operator's jurisdiction, and by any consumer or data-protection rights you hold in India that cannot be excluded by agreement.`,
    ],
  },
];
