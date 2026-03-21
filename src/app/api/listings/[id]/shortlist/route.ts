import { NextResponse } from "next/server";
import { getShortlist } from "@/modules/evaluation/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const shortlist = await getShortlist(id);
    return NextResponse.json(shortlist);
  } catch {
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}
