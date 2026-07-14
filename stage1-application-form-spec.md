# Stage 1 Application Form — Exact Questions & Answers
### For the Indian accounting talent database (worker-side seeding)

**Design goals:** completable in under 3 minutes on a phone, every question maps directly to an employer-side search filter or a quality score, and the answer options themselves do the filtering (no free text except name/links). Use a multi-step format (one question per screen, Typeform-style) — it reliably beats a single long page for completion on mobile.

---

## SCREEN 0 — Landing → Form transition line

> "This takes about 3 minutes. Shortlisted applicants get a short skills assessment by email — only verified profiles are shown to US firms."

(Sets the expectation that Stage 2 exists, so it doesn't feel like a bait-and-switch later.)

---

## SECTION A — Identity & Contact

**Q1. Full name** (text)

**Q2. Email address** (email, verified via confirmation link — this is your #1 dead-profile filter)

**Q3. WhatsApp number** (phone) — WhatsApp, not "phone," is the channel that gets responses in India. You'll use it for Stage 2 nudges.

**Q4. City you live in** (dropdown with search; capture state automatically)
*Why: employers don't care, but YOU do — it tells you which recruiting hubs (Ahmedabad, Indore, Kochi, Coimbatore, Jaipur, Pune) your ads are actually converting in.*

**Q5. LinkedIn profile URL** (optional, text)
*Scored, not required. A real LinkedIn with accounting history is a strong authenticity signal; requiring it would cost you good candidates from tier-2/3 cities.*

---

## SECTION B — Qualification & Experience

**Q6. Highest accounting qualification** (single select)
- Chartered Accountant (ICAI member)
- CA Final student / CA Inter cleared
- CMA (ICMAI or US CMA)
- ACCA
- US CPA / EA (Enrolled Agent)
- M.Com / MBA Finance
- B.Com
- Other / none of these

*Why these options: this is your primary employer filter and pricing tier. US CPA/EA holders and ICAI CAs are your premium inventory. "CA Inter cleared" is a deliberately separate option — it's a huge, underpriced talent pool (people who passed brutal exams but haven't finished the final) and exactly the "CA-track" segment the research flagged as AI-durable.*

**Q7. Years of professional accounting experience** (single select)
- Less than 1 year
- 1–3 years
- 3–5 years
- 5–10 years
- More than 10 years

**Q8. Have you worked on US or other foreign-client accounting?** (single select)
- Yes — I currently work on US clients
- Yes — I have in the past
- No — but I've been trained on US accounting/tax
- No

**Q8a. (Only shown if Q8 = yes) In what setting?** (single select)
- At an offshore/outsourcing firm (e.g. Entigrity/MYCPE, QX, KMK, Datamatics, or similar)
- As a freelancer (Upwork/Fiverr/direct clients)
- As a direct remote employee of a foreign company

*Why: "currently works on US clients at an offshore firm" is your dream profile — already trained on US standards, currently earning a fraction of what the agency bills them. This answer combination should trigger priority fast-tracking to Stage 2 within 24 hours.*

---

## SECTION C — Role & Skills (these become the employer search filters)

**Q9. Which role best describes what you're applying for?** (single select)
- Bookkeeper
- Staff Accountant
- Tax Preparer
- Tax Reviewer / Senior Tax
- Audit Support
- Payroll Specialist
- Accounts Payable / Receivable
- Controller / Virtual CFO

**Q10. Accounting software you can use confidently today** (multi-select, "confidently = could start work in it tomorrow")
- QuickBooks Online
- QuickBooks Desktop
- Xero
- NetSuite
- Sage
- Zoho Books
- Tally (only)
- None of these yet

*Why "Tally (only)" and "None" exist: Tally is the dominant Indian domestic package but nearly useless to US employers. Making it an explicit option lets Tally-only applicants self-identify honestly instead of falsely checking QuickBooks — and gives you a "trainable pipeline" segment rather than polluted data.*

**Q11. US tax software you can use confidently** (multi-select)
- Drake
- Lacerte
- ProConnect
- UltraTax CS
- CCH Axcess / ProSystem fx
- ProSeries
- TurboTax only
- None yet

**Q12. US tax forms you have actually prepared** (multi-select)
- Form 1040 (individual returns)
- Form 1120 (C-corporation)
- Form 1120-S (S-corporation)
- Form 1065 (partnership)
- Form 990 (nonprofit)
- Forms 941/940 (payroll tax)
- US sales tax filings
- None yet

*Why "actually prepared" wording: forces honesty better than "familiar with." Employers filter hard on this — a 1040+1120-S preparer is instantly hireable in tax season.*

---

## SECTION D — Availability & Expectations (the dealbreaker screens)

**Q13. What monthly salary are you looking for? (USD, full-time)** (single select)
- $300–500
- $500–800
- $800–1,200
- $1,200–1,800
- $1,800–2,500
- Above $2,500

*Why ranges, not free text: free text produces garbage ("negotiable", "as per industry"). Ranges make expectations searchable and let you spot mismatches instantly (a 1-year B.Com asking $2,500+ is a filter-out; a 5-year CA asking $1,200 is a featured profile). Note the deliberate anchor: the options START at $300 — roughly double a typical tier-2 domestic junior salary — so even your lowest band feels like a win to the applicant while looking like a bargain to a US firm.*

**Q14. Availability** (single select)
- Full-time (40 hrs/week) — this would be my only job
- Full-time, but I'd be keeping other clients/work
- Part-time (up to 20 hrs/week)

*Why the middle option exists: OnlineJobs.ph's culture is built on exclusive full-time relationships, and US firms fear moonlighting. Letting applicants declare it honestly is far better than discovering it later — and "would be my only job" becomes a filterable trust badge.*

**Q15. Which working hours can you commit to?** (single select)
- Indian business hours only (US firm gets overnight turnaround)
- Partial US overlap — I can work until ~9–10 pm IST
- Full US hours (night shift in India)

*Why: this is a top-3 employer question. The honest "India hours only" answer is still sellable — overnight turnaround is a genuine feature for tax prep — but firms doing live collaboration need the overlap filter.*

**Q16. When could you start?** (single select)
- Immediately
- Within 15 days
- 30 days (standard notice period)
- 60+ days

**Q17. Do you have a reliable work-from-home setup?** (multi-select, must check to proceed)
- [ ] Own laptop/desktop (not shared, not mobile-only)
- [ ] Reliable broadband internet
- [ ] Power backup or backup internet (hotspot)

*Why this matters more than it looks: "works from a proper home setup" vs. "applies from a phone with no computer" is one of the biggest quality separators in Indian remote-work recruiting, and US employers burned by connectivity issues ask about it constantly.*

---

## SECTION E — Source tracking & consent

**Q18. How did you hear about us?** (single select)
- Instagram/Facebook ad
- LinkedIn
- WhatsApp/Telegram group
- Referred by a friend → **Q18a: Their name/email** (text)
- Reddit
- Google search
- Other

**Q19. Consent** (checkbox, required)
> "I confirm the information above is accurate. I understand [PlatformName] is free for professionals, that employers hire and pay directly, and that misrepresenting skills or qualifications will result in permanent removal."

*Why the wording: plants the "free forever for workers" promise (your OnlineJobs.ph-style moat), sets the direct-hire expectation, and gives you clean grounds to purge liars — which you will need.*

---

## SCREEN FINAL — Confirmation

> "Application received. **Check your email now** to verify your address — unverified applications are not reviewed. Shortlisted applicants receive a short skills assessment (a writing prompt + 10-question US accounting quiz) within 3 days. Verified profiles are shown first when US firms begin hiring in [MONTH]."

---

## Scoring & Routing Logic (run this automatically)

**FAST-TRACK to Stage 2 within 24 hrs (your premium inventory):**
- Q8 = currently/previously on US clients, AND
- Q10 or Q11 includes at least one real US package (not Tally/TurboTax-only), AND
- Q13 ≤ $1,800

**STANDARD — Stage 2 within 3 days:**
- Q6 = CA / CA Inter / CMA / ACCA / M.Com AND Q7 ≥ 1–3 years, even with no US experience (trainable, honest, cheap)

**WAITLIST (polite hold email, don't reject — they're future supply):**
- Q10 = Tally only or None, AND Q8 = No
- Q17 missing own computer

**FILTER OUT (auto-archive):**
- Email never verified within 72 hrs (expect this to remove 30–40% — that's the feature working)
- Q7 = <1 year AND Q6 = B.Com/Other AND Q13 ≥ $1,200 (expectation mismatch)
- Obvious duplicate WhatsApp numbers

**Two metrics to watch weekly:**
1. Verified-email completion rate per ad creative (kills bad ads fast)
2. Fast-track % of total applicants (tells you whether your targeting is reaching offshore-firm employees or just students)

---

## Implementation Notes

- **Tooling:** Tally.so or Typeform → Airtable/Supabase. Both support conditional logic (Q8a), multi-step screens, and webhook scoring. Don't build custom yet.
- **Keep it to these 19 questions.** Every additional question costs completion rate. Resist adding "tell us about yourself" — that's Stage 2's writing prompt.
- **Do NOT ask for a resume upload in Stage 1.** Uploads tank mobile completion and give you unstructured data you can't filter. The structured answers ARE the resume; collect the PDF in Stage 2.
- **Language:** English only, deliberately — the form itself is your first English-proficiency filter.
