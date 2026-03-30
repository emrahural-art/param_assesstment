-- CreateEnum
CREATE TYPE "Company" AS ENUM ('PARAM', 'FINROTA', 'KREDIM', 'UNIVERA');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "company" "Company";
