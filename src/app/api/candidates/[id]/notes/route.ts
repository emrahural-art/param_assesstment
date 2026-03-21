import { NextResponse } from "next/server";
import { z } from "zod";
import { createNote } from "@/modules/evaluation/service";
import { db } from "@/lib/prisma";

const noteSchema = z.object({
  content: z.string().min(1),
  rating: z.number().min(1).max(10).optional(),
  userId: z.string().min(1),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const notes = await db.candidateNote.findMany({
      where: { candidateId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const note = await createNote(
      parsed.data.userId,
      id,
      parsed.data.content,
      parsed.data.rating
    );
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Not eklenemedi" }, { status: 400 });
  }
}
