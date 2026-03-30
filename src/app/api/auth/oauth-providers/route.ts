import { NextResponse } from "next/server";

/** İstemcinin Google girişini göstermesi için (gizli anahtar sızdırmadan). */
export async function GET() {
  const google = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  return NextResponse.json({ google });
}
