import { NextResponse } from "next/server";
import { updateNote, deleteNote } from "@/modules/evaluation/service";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { noteId } = await params;
  const body = await request.json();

  try {
    const note = await updateNote(noteId, body.content, body.rating);
    return NextResponse.json(note);
  } catch (err) {
    logger.error("Failed to update note", "api.candidates.notes.PUT", { error: String(err) });
    return NextResponse.json(
      { error: "Not güncellenemedi" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { noteId } = await params;

  try {
    await deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete note", "api.candidates.notes.DELETE", { error: String(err) });
    return NextResponse.json(
      { error: "Not silinemedi" },
      { status: 400 }
    );
  }
}
