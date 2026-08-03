import type { ReactNode } from "react";
import {
  Bank,
  Briefcase,
  Certificate,
  ChartLineUp,
  Clock,
  FileText,
  Handshake,
  Lock,
  MagnifyingGlass,
  SealCheck,
  ShieldCheck,
  Users,
} from "@phosphor-icons/react/dist/ssr";

/*
  Named icons for content-driven sections.

  Content files cannot hold a ReactNode, but they must be able to say WHICH icon
  a item wants. So content holds the name and this module owns the map.

  This replaces the positional lookup in the old Edges.tsx, which did ICONS[i]
  against the content array: reordering the copy silently reassigned every icon to
  the wrong item, and nothing in the type system or the build would have said so.
  Keying by name makes that class of mistake impossible.

  Imported from /dist/ssr so these stay server-renderable, matching every other
  Phosphor import in the codebase. Individual named imports, never the barrel: the
  whole point is that a handful of glyphs does not pull in the library.
*/
export type IconName =
  | "seal"
  | "file"
  | "users"
  | "briefcase"
  | "chart"
  | "search"
  | "shield"
  | "handshake"
  | "bank"
  | "certificate"
  | "clock"
  | "lock";

/*
  weight="light" throughout. The site's icons are all light-weight line glyphs
  (see ProfileCard's rows and the old Edges grid); the one exception is the
  SealCheck on a profile card, which is weight="fill" because it is a status
  marker rather than an ornament. Do not mix weights inside one grid.
*/
export const ICONS: Record<IconName, ReactNode> = {
  seal: <SealCheck size={22} weight="light" />,
  file: <FileText size={22} weight="light" />,
  users: <Users size={22} weight="light" />,
  briefcase: <Briefcase size={22} weight="light" />,
  chart: <ChartLineUp size={22} weight="light" />,
  search: <MagnifyingGlass size={22} weight="light" />,
  shield: <ShieldCheck size={22} weight="light" />,
  handshake: <Handshake size={22} weight="light" />,
  bank: <Bank size={22} weight="light" />,
  certificate: <Certificate size={22} weight="light" />,
  clock: <Clock size={22} weight="light" />,
  lock: <Lock size={22} weight="light" />,
};
