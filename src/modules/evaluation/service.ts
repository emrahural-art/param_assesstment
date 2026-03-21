import { db } from "@/lib/prisma";

export async function createNote(userId: string, candidateId: string, content: string, rating?: number) {
  return db.candidateNote.create({
    data: { userId, candidateId, content, rating },
  });
}

export async function updateNote(id: string, content: string, rating?: number) {
  return db.candidateNote.update({
    where: { id },
    data: { content, rating },
  });
}

export async function deleteNote(id: string) {
  return db.candidateNote.delete({ where: { id } });
}
