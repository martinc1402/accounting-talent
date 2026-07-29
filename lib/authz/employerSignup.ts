/*
  Whether a firm can create its own employer account.

  Closed at this stage, deliberately. Firms come in through the concierge brief
  on /employers, which writes an employer_leads row and creates nothing else.
  Accounts are provisioned by hand from a reviewed lead
  (scripts/provision-employer.mjs) once we decide to open up. Nobody signs
  themselves up in the meantime.

  This is the single switch for that. It gates the server action first
  (app/actions.ts createEmployerAccount) and the UI second
  (app/employer/EmployerPanel.tsx) — in that order, because a server action stays
  reachable by anyone who can craft the request no matter what the page renders.
  Hiding the form alone would not close the door.

  Flip to true to reopen self-serve signup. Nothing else needs to change: the
  action and the create form are both still here, intact.

  Deliberately not an env var. Opening employer signup is a product decision that
  should arrive in a diff and a review, not by someone changing a value in a
  dashboard.
*/
export const EMPLOYER_SIGNUP_OPEN = false;
