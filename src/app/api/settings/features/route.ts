import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { isSystemAdmin } from "@/lib/permissions";
import { logger } from "@/lib/logger";
import { auditLog } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isSystemAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
    return NextResponse.json(flags);
  } catch (err) {
    logger.error("Failed to load feature flags", "api.settings.features", { error: String(err) });
    return NextResponse.json({ error: "Veri yüklenemedi" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isSystemAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, enabled } = body as { key: string; enabled: boolean };

    if (!key || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Geçersiz parametre" }, { status: 400 });
    }

    const flag = await db.featureFlag.update({
      where: { key },
      data: { enabled },
    });

    auditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: enabled ? "FEATURE_ENABLED" : "FEATURE_DISABLED",
      entity: "FeatureFlag",
      entityId: flag.id,
      metadata: { key, enabled },
    });

    return NextResponse.json(flag);
  } catch (err) {
    logger.error("Failed to update feature flag", "api.settings.features", { error: String(err) });
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}
