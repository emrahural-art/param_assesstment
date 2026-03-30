import { NextResponse } from "next/server";
import { getEmailTemplateById } from "@/modules/communication/queries";
import {
  updateTemplate,
  deleteTemplate,
} from "@/modules/communication/service";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const template = await getEmailTemplateById(id);
    if (!template) {
      return NextResponse.json(
        { error: "Şablon bulunamadı" },
        { status: 404 }
      );
    }
    return NextResponse.json(template);
  } catch (err) {
    logger.error("Failed to load template", "api.communication.templates.GET", { error: String(err) });
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const template = await updateTemplate(id, body);
    return NextResponse.json(template);
  } catch (err) {
    logger.error("Failed to update template", "api.communication.templates.PUT", { error: String(err) });
    return NextResponse.json(
      { error: "Şablon güncellenemedi" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteTemplate(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete template", "api.communication.templates.DELETE", { error: String(err) });
    return NextResponse.json(
      { error: "Şablon silinemedi" },
      { status: 400 }
    );
  }
}
