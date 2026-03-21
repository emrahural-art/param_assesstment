import { db } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function processEmailQueue() {
  const queued = await db.communicationLog.findMany({
    where: { status: "QUEUED" },
    include: { candidate: true },
    take: 50,
  });

  logger.info(`Processing ${queued.length} queued emails`, "email.job");

  for (const log of queued) {
    try {
      const result = await sendEmail({
        to: log.candidate.email,
        subject: log.subject,
        html: log.body,
      });

      await db.communicationLog.update({
        where: { id: log.id },
        data: {
          status: result.success ? "SENT" : "FAILED",
          sentAt: result.success ? new Date() : undefined,
        },
      });
    } catch (error) {
      logger.error(`Failed to send email ${log.id}`, "email.job", {
        error: String(error),
      });

      await db.communicationLog.update({
        where: { id: log.id },
        data: { status: "FAILED" },
      });
    }
  }
}
