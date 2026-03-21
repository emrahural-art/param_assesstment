import { NextResponse } from "next/server";
import { getCandidateById } from "@/modules/candidates/queries";
import { updateCandidate, deleteCandidate } from "@/modules/candidates/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    return NextResponse.json({ error: "Aday bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await updateCandidate(id, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Aday güncellenemedi" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await deleteCandidate(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Aday silinemedi" }, { status: 400 });
  }
}
