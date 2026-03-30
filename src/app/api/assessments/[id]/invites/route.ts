import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createInvites,
  getInvitesByAssessment,
  getInviteById,
  buildExamUrl,
  sendInviteEmail,
} from "@/modules/assessments/invites";
import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { auditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";

const inviteSchema = z.object({
  candidateIds: z.array(z.string().min(1)).min(1),
  expiresInDays: z.number().optional(),
});

const resendSchema = z.object({
  inviteId: z.string().min(1),
});

async function getBaseUrl() {
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const invites = await getInvitesByAssessment(id);
    return NextResponse.json(invites);
  } catch (err) {
    logger.error("Failed to load invites", "api.assessments.invites.GET", { error: String(err) });
    return NextResponse.json({ error: "Davetler yüklenemedi" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 86400000)
    : undefined;

  try {
    const results = await createInvites(id, parsed.data.candidateIds, expiresAt);
    const baseUrl = await getBaseUrl();

    const assessment = await db.assessment.findUnique({
      where: { id },
      select: { title: true },
    });

    const invites = await Promise.all(
      results.map(async (r) => {
        let emailSent = false;

        if (r.status === "created" && assessment) {
          const candidate = await db.candidate.findUnique({
            where: { id: r.candidateId },
            select: { email: true, firstName: true, lastName: true },
          });

          if (candidate) {
            const emailResult = await sendInviteEmail(
              r,
              candidate,
              assessment.title,
              baseUrl,
            );
            emailSent = emailResult.success;
          }
        }

        return {
          ...r,
          examUrl: buildExamUrl(baseUrl, r.token),
          emailSent,
        };
      }),
    );

    const session = await auth();
    for (const inv of invites) {
      if (inv.status === "created") {
        auditLog({
          userId: session?.user?.id ?? null,
          userName: session?.user?.name ?? null,
          action: "EXAM_INVITE_SENT",
          entity: "ExamInvite",
          entityId: inv.inviteId,
          metadata: { assessmentId: id, candidateId: inv.candidateId, emailSent: inv.emailSent },
        });
      }
    }

    return NextResponse.json({ invites }, { status: 201 });
  } catch (err) {
    logger.error("Failed to create invite", "api.assessments.invites.POST", { error: String(err) });
    const msg = err instanceof Error ? err.message : "Davet oluşturulamadı";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = resendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "inviteId gerekli" }, { status: 400 });
  }

  try {
    const invite = await getInviteById(parsed.data.inviteId);

    if (!invite || invite.assessmentId !== id) {
      return NextResponse.json({ error: "Davet bulunamadı" }, { status: 404 });
    }

    const baseUrl = await getBaseUrl();
    const result = await sendInviteEmail(
      invite,
      invite.candidate,
      invite.assessment.title,
      baseUrl,
    );

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error ?? "E-posta gönderilemedi" },
      { status: 500 },
    );
  } catch (err) {
    logger.error("Failed to resend invite", "api.assessments.invites.PATCH", { error: String(err) });
    return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
  }
}
