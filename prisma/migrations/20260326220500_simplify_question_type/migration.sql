-- AlterEnum: Remove unused values from QuestionType
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE');
ALTER TABLE "Question" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType" USING ("type"::text::"QuestionType");
ALTER TABLE "Question" ALTER COLUMN "type" SET DEFAULT 'MULTIPLE_CHOICE';
DROP TYPE "QuestionType_old";
