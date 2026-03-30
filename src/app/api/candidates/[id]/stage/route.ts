import { NextResponse } from "next/server";
import { moveApplication } from "@/modules/pipeline/service";
import { moveApplicationSchema } from "@/modules/pipeline/schema";
import { logger } from "@/lib/logger";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const parsed = moveApplicationSchema.safeParse({
    applicationId: body.applicationId ?? id,
    newStage: body.newStage,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const application = await moveApplication(parsed.data.applicationId, parsed.data.newStage);
    return NextResponse.json(application);
  } catch (err) {
    logger.error("Failed to update candidate stage", "api.candidates.stage", { error: String(err) });
    return NextResponse.json({ error: "Aşama güncellenemedi" }, { status: 400 });
  }
}
