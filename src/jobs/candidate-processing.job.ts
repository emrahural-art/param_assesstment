import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { KVKK_RETENTION_DAYS } from "@/lib/constants";
import { anonymizeCandidate } from "@/modules/candidates/service";

export async function processKvkkRetention() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - KVKK_RETENTION_DAYS);

  const expiredCandidates = await db.candidate.findMany({
    where: {
      status: "ARCHIVED",
      updatedAt: { lt: cutoffDate },
    },
  });

  logger.info(
    `Found ${expiredCandidates.length} candidates for KVKK anonymization`,
    "candidate-processing.job"
  );

  for (const candidate of expiredCandidates) {
    try {
      await anonymizeCandidate(candidate.id);
      logger.info(`Anonymized candidate ${candidate.id}`, "candidate-processing.job");
    } catch (error) {
      logger.error(`Failed to anonymize candidate ${candidate.id}`, "candidate-processing.job", {
        error: String(error),
      });
    }
  }
}
