import { NextResponse } from "next/server";
import { getCandidates } from "@/modules/candidates/queries";
import { createCandidate } from "@/modules/candidates/service";
import { createCandidateSchema } from "@/modules/candidates/schema";
import { toCandidateDTOList } from "@/modules/candidates/mapper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as "ACTIVE" | "ARCHIVED" | "ANONYMIZED") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    listingId: searchParams.get("listingId") ?? undefined,
  };

  try {
    const candidates = await getCandidates(filters);
    return NextResponse.json(toCandidateDTOList(candidates));
  } catch {
    return NextResponse.json({ error: "Veritabanı bağlantısı kurulamadı" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const candidate = await createCandidate({
      ...parsed.data,
      consentAt: new Date(),
    });
    return NextResponse.json(candidate, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 409 });
  }
}
