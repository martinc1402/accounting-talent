export type FaqItem = {
  // Stable, kebab-case. Drives the /faq deep-link anchors, the JSON-LD, AND the
  // `id` prop on the faq_opened analytics event. Renaming one silently splits its
  // history in the dashboard, so treat these as an interface rather than as copy.
  id?: string;
  q: string;
  a: string[];
};

/*
  The order here IS the render order on both /faq and /accountants, which now
  show the same list. It answers the fifteen questions the accountant page is
  built around, in roughly the order an accountant asks them: what it costs, what
  it gets me, what is public, what I have to produce, how I am ranked, how I leave.

  `homepageFaq` is gone. It pinned four questions by id for a short-FAQ block on
  /accountants that showed four of twelve and linked to /faq for the rest. The
  page now carries the full list, so the short version was one more place for the
  copy to drift out of step. If a short FAQ ever comes back, pin by id again
  rather than slicing: reordering this array must not silently change which
  questions a page shows.
*/
export const faq: FaqItem[] = [
  {
    id: "free",
    q: "Is AccountingTalent free for accountants?",
    a: [
      "Yes, permanently. Creating a profile is free, applying is free, being verified is free, and receiving a message from an employer is free. There is no stage at which we ask an accountant for money.",
      "US firms pay us for hiring access. That is the entire business. If anyone ever asks you for money to join, to be verified, or to be introduced to a firm, it is not us.",
    ],
  },
  {
    id: "salary",
    q: "Does AccountingTalent take part of my salary?",
    a: [
      "No. Not a percentage, not a finder's fee, not a monthly cut. You and the employer agree compensation directly and every rupee of it is yours, for as long as you work there.",
      "This is the difference between this and an offshore staffing arrangement, where a monthly seat rate is charged for as long as you work for the client and only part of it reaches you.",
    ],
  },
  {
    id: "guarantee",
    q: "Does joining guarantee a job?",
    a: [
      "No, and we are not going to pretend otherwise. There is no job waiting for you today. We are building the employer side of the network, and joining now means you have a profile ready and are visible as US firms begin taking part.",
      "What it does get you: your feedback shaping what gets built, a place in the Work Proof pilots when they open, and one honest email a month about where things stand, including the months when there is no news.",
    ],
  },
  {
    id: "currently-employed",
    q: "Can my current employer see my profile?",
    a: [
      "This is the case the privacy model was designed for. Your profile is not published publicly and it is not indexed by search engines: that setting is off by default and you turn it on, not us.",
      "Only verified firms can see profiles at all, and what they see does not include your full name, your photograph or your contact details. Your employment history appears without identifying your current employer. Nobody browsing can work out who you are, and nothing reaches a firm until you agree to it.",
    ],
  },
  {
    id: "what-is-public",
    q: "What information will be public?",
    a: [
      "By default: your role and years of experience, your region rather than your exact address, your software and the depth you claim in each, your industry and US exposure, your availability and hours of overlap, your compensation expectation, and which checks you have completed with the date of each.",
      "Not public by default: your photograph (off unless you turn it on), your full name, your email, your phone number and your LinkedIn. Search-engine indexing is also off by default.",
      "This is enforced on the server, in lib/authz, not by hiding fields in a page. A firm that is not entitled to a field does not receive it at all.",
    ],
  },
  {
    id: "work-proof",
    q: "What is Work Proof?",
    a: [
      "Evidence of how you approach accounting work, rather than a description of jobs you have held. The intended set is anonymised work samples, synthetic bookkeeping exercises, reconciliation and month-end-close scenarios, and reporting or spreadsheet tasks.",
      "What exists today is narrower: a written account of a real problem you solved, and a ten-question exam on US tax and accounting. Both are marked by a person. The exercises and work samples are still being built, and assessment results are not yet displayed on profiles.",
    ],
  },
  {
    id: "client-work",
    q: "Can I upload client work?",
    a: [
      "No. Never upload anything that identifies a client or contains their information: not a real trial balance, not a real return, not a screenshot with a client name in the corner. It would breach your obligations to them and it is not what this is for.",
      "Work Proof is built around synthetic and anonymised data for exactly this reason. Where you want to describe real work, describe the problem and what you did about it without the identifying detail. Anything containing client-identifiable information will be rejected.",
    ],
  },
  {
    id: "vouches",
    q: "How do professional vouches work?",
    a: [
      "They are not built yet, and no profile carries one today. This is the plan rather than a description of something live.",
      "The intent is that you ask a former colleague, manager or client to verify one specific capability they actually saw: that they worked with you on month-end close, that they can confirm your QuickBooks work, that they managed you in a client-facing role. A named person confirming one particular thing, rather than a one-click endorsement from someone who never worked with you.",
    ],
  },
  {
    id: "us-experience",
    q: "Do I need US accounting experience?",
    a: [
      "No. It is the single strongest signal to the firms we talk to, and it is not a requirement. Fundamentals are the hard part and US tax software is learnable.",
      "If you have not worked US files, be accurate about it rather than stretching the description. The checks and the evidence are the whole product, and a claim that does not survive an interview costs you more here than an honest gap would.",
    ],
  },
  {
    id: "qualification",
    q: "Do I need to be a Chartered Accountant?",
    a: [
      "No. The application does not require any specific qualification, and no part of the product ranks you on one. CAs, CA Inter and finalists, CMAs, ACCAs, M.Coms, and accountants qualified by experience are all in scope.",
      "What matters is what you can show: the software you actually work in, the work you have actually done, and your written English.",
    ],
  },
  {
    id: "ranking",
    q: "How are accountants ranked in search?",
    a: [
      "On relevance to what the firm is looking for: skills, software, experience, availability and hours of overlap, the evidence on your profile, and how recently you confirmed that it is still accurate.",
      "Not on posting frequency, not on follower counts, and not on payment. Keeping your confirmations current is the one thing genuinely within your control, which is why the profile asks you to reconfirm availability rather than letting it quietly age.",
    ],
  },
  {
    id: "hide-compensation",
    q: "Can I hide my compensation expectations?",
    a: [
      "Yes, from your profile settings. It is shown by default, because firms filter on it and a profile without it gets passed over more often, but it is your call and you can turn it off.",
      "Hiding it does not remove it from the application: we still use it to decide which roles are worth putting in front of you.",
    ],
  },
  {
    id: "pro-ranking",
    q: "Will paying for Pro improve my ranking?",
    a: [
      "No. Pro is not available and is not being sold, and if it ever ships it will be presentation and insight tools: analytics, exports, a custom profile address.",
      "Ranking is not for sale here, to anyone, at any price. A network where the top results are whoever paid the most is not worth a firm's time, which means it is not worth yours either.",
    ],
  },
  {
    id: "contact",
    q: "How will employers contact me?",
    a: [
      "Through us first, never directly. A firm that wants to talk to you requests an introduction against your profile. We ask you, and nothing about you reaches them unless you agree.",
      "Being exact about how that works today: the request is recorded in the system, but we come to you by email to ask rather than through a button in your dashboard, because the accept-or-decline control is still being built. Either way, the answer is yours and a firm cannot reach you without it.",
      "Once you accept, they get your contact details and you deal with each other directly. You interview, you negotiate your own salary, and they pay you.",
    ],
  },
  {
    id: "delete",
    q: "Can I delete or unpublish my profile?",
    a: [
      "Yes, both, at any time and without asking anyone. From your dashboard you can pause your profile, which takes it out of view for firms while keeping everything you have built, or delete it outright.",
      "There is no exclusivity, no notice period and no lock-in. Use us alongside anything else you are doing.",
    ],
  },
  {
    id: "legal",
    q: "Am I an employee of AccountingTalent?",
    a: [
      "No. We are not your employer and we are not a party to any agreement between you and a firm. You contract with the firm directly, on terms the two of you agree.",
      "How you should handle tax and compliance on what you earn depends on your circumstances and is a question for your own advisor. We cannot advise you on it.",
    ],
  },
  {
    id: "data",
    q: "What do you do with my data?",
    a: [
      "We use it to build your profile and to show relevant firms that you exist. We do not sell it, and we do not pass it to anyone outside the platform without your agreement.",
      "Your contact details are released only when you agree to an introduction. You can ask us to delete everything we hold about you at any time, and we will.",
    ],
  },
];


/*
  The employer FAQ, rendered on the homepage under #faq. Same FaqItem shape and
  the same Accordion component the worker pages use. Kept separate from `faq`
  (the worker FAQ) because the two audiences ask different questions and /faq
  should not show firm-side answers. Ids are stable kebab-case: they are the
  deep-link anchors AND the `id` prop on the faq_opened analytics event, so
  renaming one silently splits its history.

  REWRITTEN FOR THE NETWORK MODEL. The previous version was written for the
  "annual database access plus a per-hire success fee, opens late 2026" offer,
  and before that for a concierge offer. Prices, the launch gate and the success
  fee are all gone. Plan prices now live in content/passport.ts (employerPlans)
  and are quoted here in `cost`; if they move, both move.

  THIS FILE ABSORBED THE RETIRED PAPERWORK SECTION. content/firms.ts used to
  carry an `edges` block (contractor template, confidentiality annexure,
  client-consent wording, paying someone in India) rendered by Edges.tsx, under a
  standing [TODO: LEGAL REVIEW]. That section had no place in the new structure,
  but its content is the part a firm most needs and the TODO travelled with it
  rather than being deleted. It is now spread across `who-employs`, `payroll`,
  `confidentiality` and `security-compliance` below.

  [TODO: LEGAL REVIEW] on `who-employs`, `payroll`, `confidentiality` and
  `security-compliance`. They name IRS Section 7216 and PCAOB/AICPA expectations
  and describe consent language we supply. The wording is deliberately "we
  provide a starting point, you and your advisor decide" and MUST NOT drift into
  telling a firm what satisfies its obligations. Language to keep out of these
  answers: "compliant", "meets", "satisfies", "covers you", "ensures",
  "protects you". content/legal.ts carries the same flag.

  Dashes conformed to the site convention (no em dashes; ranges use "to" or a
  plain hyphen; an em-dash pause becomes a comma, colon, or parentheses).
*/
export const employerFaq: FaqItem[] = [
  {
    id: "browse-before-paying",
    q: "Can I browse accountants before paying?",
    a: [
      "Yes, and you can do it without an account. What is available today is full example profiles showing exactly what a real one contains, plus the candidates we put in front of you directly once we know what you are hiring for.",
      "Open search across the whole network, with filters, is being built and is not live yet. We would rather say that plainly than let you plan a busy season around a search box that does not exist.",
    ],
  },
  {
    id: "public-profile",
    q: "What can I see on a public profile?",
    a: [
      "Enough to decide whether to talk, and not enough to go around us. You see the role and years of experience, region, software and the depth claimed in each, industry and US accounting exposure, availability and hours of overlap, compensation expectation, and which checks have been completed with the date of each.",
      "You do not see the accountant's full name, photograph, email, phone number or employer history in identifiable form. Those are released when an introduction is accepted, and the accountant decides that, not us. This is enforced server side in lib/authz, not by hiding fields in the page.",
    ],
  },
  {
    id: "work-proof",
    q: "What is Work Proof?",
    a: [
      "Evidence of how someone approaches accounting work, rather than a description of jobs they have held. The intended set is anonymised work samples, synthetic bookkeeping exercises, reconciliation and month-end-close scenarios, and reporting or spreadsheet tasks.",
      "What exists today is narrower and worth being exact about: a written account of a real problem the accountant solved, and a ten-question exam on US tax and accounting. Both are marked by a person. The exercises and work samples are still being built, and assessment results are not yet displayed on profiles.",
      "Accountants are told never to upload client-identifiable or confidential material, and Work Proof is designed around synthetic and anonymised data for that reason.",
    ],
  },
  {
    id: "what-verified-means",
    q: "What does “verified” mean?",
    a: [
      "It means one specific check was completed on one specific date, and nothing beyond that. There are three: identity, an English writing assessment, and qualification. Each is stamped by a person after reviewing what the accountant provided, and each shows its own date on the profile.",
      "There is deliberately no single “verified accountant” badge, because that would suggest everything on the profile has been checked and it has not. We do not run reference checks, criminal-record or credit checks, or right-to-work screening. If your firm needs any of those, run them as part of your own process.",
    ],
  },
  {
    id: "first-post-free",
    q: "Is the first role post really free?",
    a: [
      "Yes, and there is no card involved at any point in it. The honest detail is that self-serve posting is not built yet, so today it works by you telling us the role in the form on this page and us setting it up with you.",
      "That is slower than a form you fill in yourself, and it is also why the roles we do set up tend to be better written. When self-serve posting ships, the first one stays free.",
    ],
  },
  {
    id: "free-introduction",
    q: "What is included in the free introduction?",
    a: [
      "A verified firm gets one introduction at no cost. You request it against a specific accountant, we ask them, and if they accept you receive their identity and contact details and can take the conversation off the platform entirely.",
      "The accountant can decline, and some do. An introduction is a request, not a purchase, and we are not willing to sell you access to somebody who has not agreed to it.",
    ],
  },
  {
    id: "after-hiring-pass",
    q: "What happens after my 30-day Hiring Pass ends?",
    a: [
      "It stops. There is no automatic renewal and nothing to cancel, because there is no subscription running in the background.",
      "Anyone you already contacted stays contactable: an accepted introduction is not revoked when a pass lapses, and any conversation you have moved to email is yours. What ends is new contact access and the broader search and filtering tools.",
    ],
  },
  {
    id: "who-employs",
    q: "Does AccountingTalent employ the accountants?",
    a: [
      "No. You engage them directly. Most firms take the accountant on as an independent contractor who invoices them; some move a long-term hire onto an employer-of-record platform. How you classify and structure that relationship is a decision for your firm and your own advisor.",
      "AccountingTalent is not the employer, not a party to your agreement, and takes no part of what you pay the accountant.",
    ],
  },
  {
    id: "payroll",
    q: "Does AccountingTalent handle payroll or compliance?",
    a: [
      "No. We do not run payroll, withhold or remit tax, or act as an employer of record, and we do not take on your firm's compliance obligations.",
      "Paying an accountant in India works the same way as paying any overseas contractor. Most firms use an international transfer service or a contractor-payment platform that handles conversion and keeps the paperwork together; some wire directly. We can share how firms do this in practice and what documentation is worth keeping.",
      "What your firm is required to collect, report and withhold is a question for your own accountant and counsel. Worker classification, cross-border payment and tax treatment vary by jurisdiction and by firm, and we are not your advisor on any of it.",
    ],
  },
  {
    id: "agencies",
    q: "Can recruitment agencies use the platform?",
    a: [
      "Not as employers. The network exists so that firms and accountants deal with each other directly, and an agency listing accountants it intends to re-let at a margin is the arrangement this is built to avoid.",
      "If you are an agency and think there is a version of this that works for everyone, write to us rather than signing up as a firm. We would rather have the conversation than find out later.",
    ],
  },
  {
    id: "no-suitable-candidates",
    q: "What if I cannot find suitable candidates?",
    a: [
      "Tell us, because at this size that is genuinely useful information rather than a support ticket. The network is early and there are roles it cannot fill yet.",
      "A Hiring Pass carries a stated guarantee: find at least three people you would genuinely consider interviewing, or you get another 30 days at no cost. If we cannot get you to three in that time either, we will say so rather than sell you a second pass.",
    ],
  },
  {
    id: "curated-shortlist",
    q: "How does the Curated Shortlist service work?",
    a: [
      "We do the search and the first screen. It starts with a conversation about the role, and usually some work on the role definition itself, because most offshore hires go wrong at the job description rather than at the interview.",
      "You get five recommended people with availability confirmed before you see them, interview coordination, and one replacement shortlist if the first set misses. It is US$750 per shortlist, and it includes a 30-day Hiring Pass once passes are live.",
    ],
  },
  {
    id: "salary-markup",
    q: "Are accountant salaries marked up?",
    a: [
      "No. You and the accountant agree compensation between you, and the whole of it goes to them. We never take a percentage of anyone's salary, at any point, and there is no per-seat monthly margin.",
      "This is the single clearest difference from an offshore staffing arrangement, where a monthly seat rate is charged for as long as the person works for you and only part of it reaches them. Our revenue is the plans on this page and nothing else.",
    ],
  },
  {
    id: "agency-or-platform",
    q: "Is AccountingTalent a recruitment agency or a software platform?",
    a: [
      "Mostly a platform, and honestly a bit of both right now. The product is a professional network where accountants build a verifiable record and firms find them through it, and that is what is being built.",
      "But the network is early, so some of what we do is hands-on: introductions prepared by hand, shortlists put together by a person, roles written with you. The Curated Shortlist is openly a service rather than software. As search and posting ship, more of it becomes something you do yourself.",
      "For the avoidance of doubt in either direction: we are not a staffing agency, not an employer, and not a party to any agreement between you and an accountant.",
    ],
  },
  {
    id: "confidentiality",
    q: "What about client confidentiality and consent?",
    a: [
      "This is the question worth getting right before you hire, not after. If you disclose client tax return information to a preparer outside the United States, IRS Section 7216 sets out consent requirements, and consent generally has to be obtained in writing from the client before the disclosure. Firms doing audit or attest work also have PCAOB and AICPA confidentiality expectations to meet, and state boards may add their own.",
      "Your firm holds those obligations. We do not take them on and cannot discharge them for you. What we can provide is a starting point: draft client-consent wording and a confidentiality and data-handling annexure you can put in front of your own counsel.",
      "Have your advisors review anything we give you before you rely on it. These are templates, not legal advice, and whether they fit your firm's circumstances is a judgment only your advisors can make.",
    ],
  },
  {
    id: "security-compliance",
    q: "What security measures should my firm put in place?",
    a: [
      "Treat a remote accountant the way careful firms treat any remote staff: a signed confidentiality agreement, least-privilege access to systems rather than a shared login, multi-factor authentication, sensible device and password policies, and a written plan for how access is revoked and data is returned or destroyed when an engagement ends.",
      "Employment, contractor classification, taxpayer-data consent, and professional obligations vary by firm and jurisdiction. We are not your legal, tax, or compliance advisor; obtain advice appropriate to your circumstances.",
    ],
  },
];
