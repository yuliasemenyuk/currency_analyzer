/*
  Warnings:

  - The values [no_change] on the enum `TrendDirection` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TrendDirection_new" AS ENUM ('increase', 'decrease');
ALTER TABLE "Rule" ALTER COLUMN "trendDirection" TYPE "TrendDirection_new" USING ("trendDirection"::text::"TrendDirection_new");
ALTER TYPE "TrendDirection" RENAME TO "TrendDirection_old";
ALTER TYPE "TrendDirection_new" RENAME TO "TrendDirection";
DROP TYPE "TrendDirection_old";
COMMIT;

-- AlterTable
ALTER TABLE "UsersOnRules" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT false;
