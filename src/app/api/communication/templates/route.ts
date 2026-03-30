import { NextResponse } from "next/server";
import { getEmailTemplates } from "@/modules/communication/queries";
import { createTemplate } from "@/modules/communication/service";
import { createTemplateSchema } from "@/modules/communication/schema";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const templates = await getEmailTemplates();
    return NextResponse.json(templates);
  } catch (err) {
    logger.error("Failed to load templates", "api.communication.templates.GET", { error: String(err) });
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const template = await createTemplate(parsed.data);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    logger.error("Failed to create template", "api.communication.templates.POST", { error: String(err) });
    return NextResponse.json(
      { error: "Şablon oluşturulamadı" },
      { status: 400 }
    );
  }
}
