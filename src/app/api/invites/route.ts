import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { normalizeLoginEmail } from "@/lib/login-email";
import { isAdminOrAbove } from "@/lib/permissions";
import { auditLog } from "@/lib/audit";

const invitableRoleSchema = z.enum(["ADMIN", "HR_MANAGER", "HR_SPECIALIST", "HR_INTERN"]);

const createInviteSchema = z.object({
  email: z.string().email(),
  role: invitableRoleSchema,
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isAdminOrAbove(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const invites = await db.loginInvite.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(invites);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isAdminOrAbove(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createInviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.role === "ADMIN" && session.user.role !== "SYSTEM_ADMIN") {
    return NextResponse.json(
      { error: "Yönetici rolünde davet sadece Sistem Yöneticisi yapabilir" },
      { status: 403 }
    );
  }

  const email = normalizeLoginEmail(parsed.data.email);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && email === adminEmail) {
    return NextResponse.json(
      { error: "Yönetici e-postası davet edilemez" },
      { status: 400 }
    );
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Bu e-posta ile zaten bir kullanıcı var" },
      { status: 409 }
    );
  }

  const existingInvite = await db.loginInvite.findUnique({ where: { email } });
  if (existingInvite) {
    return NextResponse.json(
      { error: "Bu e-posta zaten davet listesinde" },
      { status: 409 }
    );
  }

  const invite = await db.loginInvite.create({
    data: {
      email,
      role: parsed.data.role,
      invitedById: session.user.id,
    },
    include: {
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  });

  auditLog({
    userId: session.user.id,
    userName: session.user.name,
    action: "INVITE_CREATED",
    entity: "LoginInvite",
    entityId: invite.id,
    metadata: { email, role: parsed.data.role },
  });

  return NextResponse.json(invite, { status: 201 });
}
