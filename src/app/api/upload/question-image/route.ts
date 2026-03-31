import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { requireAuth, AuthError, authErrorResponse } from "@/lib/api-auth";
import { validateFileSignature, mimeToFileType } from "@/lib/file-validation";

const UPLOAD_DIR = join(process.cwd(), "public", "images", "exam");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    await requireAuth(request, "assessments:write");
  } catch (e) {
    return authErrorResponse(e as AuthError);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya formatı. PNG, JPEG, SVG, WebP veya GIF kullanın." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const expectedType = mimeToFileType(file.type);
    if (expectedType && !validateFileSignature(bytes, expectedType)) {
      return NextResponse.json(
        { error: "Geçersiz dosya içeriği: dosya bildirilen formata uymuyor" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const fileName = `${randomUUID()}.${ext}`;

    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(bytes);
    await writeFile(join(UPLOAD_DIR, fileName), buffer);

    return NextResponse.json({ url: `/images/exam/${fileName}` });
  } catch (err) {
    logger.error("Failed to upload question image", "api.upload.question-image", { error: String(err) });
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
