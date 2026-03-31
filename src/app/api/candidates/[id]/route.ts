import { NextResponse } from "next/server";
import { getCandidateById } from "@/modules/candidates/queries";
import { updateCandidate, deleteCandidate } from "@/modules/candidates/service";
import { logger } from "@/lib/logger";
import { requireAuth, AuthError, authErrorResponse } from "@/lib/api-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    return NextResponse.json({ error: "Aday bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request, "candidates:write");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await updateCandidate(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    logger.error("Failed to update candidate", "api.candidates.PUT", { error: String(err) });
    return NextResponse.json({ error: "Aday güncellenemedi" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request, "candidates:delete");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

  const { id } = await params;

  try {
    await deleteCandidate(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete candidate", "api.candidates.DELETE", { error: String(err) });
    return NextResponse.json({ error: "Aday silinemedi" }, { status: 400 });
  }
}
