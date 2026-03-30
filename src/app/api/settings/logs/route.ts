import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { isSystemAdmin } from "@/lib/permissions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isSystemAdmin(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "audit";
  const search = searchParams.get("search") ?? "";
  const level = searchParams.get("level") ?? "";
  const cursor = searchParams.get("cursor") ?? undefined;
  const take = 100;

  try {
    if (type === "app") {
      const where: Record<string, unknown> = {};
      if (level) where.level = level;
      if (search) {
        where.OR = [
          { message: { contains: search, mode: "insensitive" } },
          { context: { contains: search, mode: "insensitive" } },
        ];
      }

      const logs = await db.appLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      const hasMore = logs.length > take;
      const items = hasMore ? logs.slice(0, take) : logs;
      const nextCursor = hasMore ? items[items.length - 1]?.id : null;

      return NextResponse.json({ items, nextCursor });
    }

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
      ];
    }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = logs.length > take;
    const items = hasMore ? logs.slice(0, take) : logs;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({ items, nextCursor });
  } catch {
    return NextResponse.json({ error: "Loglar yüklenemedi" }, { status: 500 });
  }
}
