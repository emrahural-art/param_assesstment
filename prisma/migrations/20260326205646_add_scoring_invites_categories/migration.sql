-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'STARTED', 'COMPLETED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "scoringConfig" JSONB;

-- AlterTable
ALTER TABLE "AssessmentResult" ADD COLUMN     "categoryScores" JSONB,
ADD COLUMN     "dimensionResults" JSONB,
ADD COLUMN     "jobFitResults" JSONB,
ADD COLUMN     "level" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "category" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ExamInvite" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamInvite_token_key" ON "ExamInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ExamInvite_candidateId_assessmentId_key" ON "ExamInvite"("candidateId", "assessmentId");

-- AddForeignKey
ALTER TABLE "ExamInvite" ADD CONSTRAINT "ExamInvite_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamInvite" ADD CONSTRAINT "ExamInvite_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
