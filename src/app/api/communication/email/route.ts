import { NextResponse } from "next/server";
import { sendCandidateEmail } from "@/modules/communication/service";
import { sendEmailSchema } from "@/modules/communication/schema";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = sendEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const result = await sendCandidateEmail(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    logger.error("Failed to send email", "api.communication.email", { error: String(err) });
    return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 400 });
  }
}
