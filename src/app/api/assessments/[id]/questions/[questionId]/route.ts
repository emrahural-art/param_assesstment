import { NextResponse } from "next/server";
import { updateQuestion, deleteQuestion } from "@/modules/assessments/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const { questionId } = await params;
  const body = await request.json();

  try {
    const question = await updateQuestion(questionId, body);
    return NextResponse.json(question);
  } catch {
    return NextResponse.json(
      { error: "Soru güncellenemedi" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const { questionId } = await params;

  try {
    await deleteQuestion(questionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Soru silinemedi" },
      { status: 400 }
    );
  }
}
