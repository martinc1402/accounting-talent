/*
  Next.js 16 proxy (formerly middleware): refreshes the Supabase auth cookie on
  every navigable request so getUser() in Server Components sees a live session.
  Auth only — it does not authorize anything (that happens per-route via
  getViewer + the policy layer). If Supabase auth env is unset it is a no-op.

  The matcher excludes static assets and image files so auth work never blocks
  CSS/JS/images.
*/
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Touch getUser() to trigger a token refresh + cookie rewrite when needed.
  try {
    await supabase.auth.getUser();
  } catch {
    // Never let an auth hiccup break navigation.
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static image/asset files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
