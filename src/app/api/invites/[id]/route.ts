import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { isAdminOrAbove } from "@/lib/permissions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !isAdminOrAbove(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id } = await params;

  const invite = await db.loginInvite.findUnique({ where: { id } });
  if (!invite) {
    return NextResponse.json({ error: "Davet bulunamadı" }, { status: 404 });
  }

  await db.loginInvite.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
