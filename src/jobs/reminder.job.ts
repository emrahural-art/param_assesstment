import { db } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function sendExamReminders() {
  const pendingResults = await db.assessmentResult.findMany({
    where: {
      completedAt: null,
      startedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    include: {
      candidate: true,
      assessment: true,
    },
  });

  logger.info(`Sending reminders to ${pendingResults.length} candidates`, "reminder.job");

  for (const result of pendingResults) {
    await sendEmail({
      to: result.candidate.email,
      subject: `Hatırlatma: ${result.assessment.title} testini tamamlayınız`,
      html: `
        <p>Sayın ${result.candidate.firstName} ${result.candidate.lastName},</p>
        <p><strong>${result.assessment.title}</strong> testini henüz tamamlamadınız.</p>
        <p>Lütfen en kısa sürede testi tamamlayınız.</p>
      `,
    });
  }
}
