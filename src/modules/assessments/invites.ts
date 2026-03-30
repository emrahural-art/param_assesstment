import { db } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function createInvites(
  assessmentId: string,
  candidateIds: string[],
  expiresAt?: Date,
) {
  const results: { candidateId: string; token: string; status: "created" | "exists" }[] = [];

  for (const candidateId of candidateIds) {
    const existing = await db.examInvite.findUnique({
      where: { candidateId_assessmentId: { candidateId, assessmentId } },
    });

    if (existing) {
      results.push({ candidateId, token: existing.token, status: "exists" });
      continue;
    }

    const invite = await db.examInvite.create({
      data: {
        assessmentId,
        candidateId,
        token: randomUUID(),
        expiresAt,
      },
    });

    results.push({ candidateId, token: invite.token, status: "created" });
  }

  return results;
}

export async function getInvitesByAssessment(assessmentId: string) {
  return db.examInvite.findMany({
    where: { assessmentId },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInviteByToken(token: string) {
  return db.examInvite.findUnique({
    where: { token },
    include: {
      assessment: { include: { questions: { orderBy: { order: "asc" } } } },
      candidate: true,
    },
  });
}

export async function markInviteStarted(token: string) {
  return db.examInvite.update({
    where: { token },
    data: { status: "STARTED", startedAt: new Date() },
  });
}

export async function markInviteCompleted(token: string) {
  return db.examInvite.update({
    where: { token },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

export function buildExamUrl(baseUrl: string, token: string) {
  return `${baseUrl}/exam/${token}`;
}

export async function sendInviteEmail(
  invite: { token: string },
  candidate: { email: string; firstName: string; lastName: string },
  assessmentTitle: string,
  baseUrl: string,
): Promise<{ success: boolean; error?: string }> {
  const examUrl = buildExamUrl(baseUrl, invite.token);

  const result = await sendEmail({
    to: candidate.email,
    subject: `Değerlendirme Testi Davetiniz: ${assessmentTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="background: #f8f9fa; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 8px; color: #111; font-size: 20px;">Değerlendirme Testi Daveti</h2>
          <p style="margin: 0 0 24px; color: #666; font-size: 14px;">Param Assessment Center</p>
          <p style="margin: 0 0 8px; color: #333; font-size: 15px;">
            Sayın <strong>${candidate.firstName} ${candidate.lastName}</strong>,
          </p>
          <p style="margin: 0 0 24px; color: #333; font-size: 15px;">
            Sizi <strong>${assessmentTitle}</strong> değerlendirme testine davet ediyoruz.
            Aşağıdaki butona tıklayarak teste başlayabilirsiniz.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${examUrl}"
               style="display: inline-block; background: #111; color: #fff; text-decoration: none;
                      padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
              Teste Başla
            </a>
          </div>
          <p style="margin: 0 0 4px; color: #999; font-size: 12px;">
            Buton çalışmazsa aşağıdaki linki tarayıcınıza yapıştırın:
          </p>
          <p style="margin: 0 0 24px; color: #666; font-size: 12px; word-break: break-all;">${examUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
          <p style="margin: 0; color: #999; font-size: 12px;">
            Başarılar dileriz!<br />İK Ekibi
          </p>
        </div>
      </div>
    `,
  });

  if (result.success) {
    await db.examInvite.update({
      where: { token: invite.token },
      data: { sentAt: new Date() },
    });
    logger.info(`Invite email sent to ${candidate.email}`, "invites.sendInviteEmail");
  } else {
    logger.error(`Failed to send invite email to ${candidate.email}`, "invites.sendInviteEmail", {
      error: result.error,
    });
  }

  return result;
}

export async function getInviteById(inviteId: string) {
  return db.examInvite.findUnique({
    where: { id: inviteId },
    include: {
      candidate: { select: { email: true, firstName: true, lastName: true } },
      assessment: { select: { title: true } },
    },
  });
}
