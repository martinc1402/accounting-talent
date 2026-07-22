-- Candidate profile POLISH fields: the last few structured values the refined
-- /candidates/[id] profile renders but nothing populates yet. Companion to 0008
-- (which backed the profile body); this backs the hero proof-point row, the
-- role-specific experience line, the English assessment date, and the portrait
-- focal point.
--
-- PREPARATION, not backfill. Every column is nullable and nothing populates them
-- yet, so existing rows are untouched and each element renders only when its
-- source is present (see lib/profile/candidate.ts). Additive and idempotent:
-- `add column if not exists`, safe to re-run. A curation tool (not this
-- migration) will fill them.

-- Hero proof-point row: the scannable stats above the fold ("300+ / US returns
-- per season", "40+ / clients managed", "~30% / fewer reviewer notes"). jsonb
-- array of { value, label } — candidate-supplied highlights, kept jsonb because
-- it is display-only, read whole with the row, and never queried across
-- candidates. Distinct from employment_history bullets (the narrative source);
-- this is the curated summary. Null / empty => the evidence row is omitted.
alter table applications add column if not exists highlights jsonb;

-- Role-specific qualifier for the hero experience phrase. experience_years_num
-- (0007) gives the generic "4 years' experience"; a tax candidate reads better as
-- "4 years' US tax experience". This holds only the focus ("US tax"), composed as
-- "{n} years' {experience_focus} experience". Do NOT derive it from employment
-- history. Null => the generic phrase is used.
alter table applications add column if not exists experience_focus text;

-- Date the English proficiency was assessed, shown beside the "English
-- communication · Advanced" verification row. english_level (0007) is the level;
-- this is when it was assessed. Kept separate from the identity / qualification /
-- reference timestamps because English is assessed, not document-verified. Null
-- => the row shows the level with no date (still reads cleanly).
alter table applications add column if not exists english_assessed_at timestamptz;

-- Portrait focal point as a CSS object-position value ("center 20%"), so a face
-- that sits high or off-centre stays framed at every width. photo_url (0007) is
-- the image; this only tunes the crop. Null => the component's default
-- ("center 22%") is used.
alter table applications add column if not exists photo_focal text;
