import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const client = await createAuthServerClient();
  if (client) await client.auth.signOut();
  return NextResponse.redirect(new URL("/", new URL(request.url).origin), { status: 303 });
}
