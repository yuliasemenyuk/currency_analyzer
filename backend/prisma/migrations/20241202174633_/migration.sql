/*
  Warnings:

  - You are about to drop the column `isEnabled` on the `CurrencyPair` table. All the data in the column will be lost.
  - You are about to drop the column `isIncrease` on the `Rule` table. All the data in the column will be lost.
  - Added the required column `trendDirection` to the `Rule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('increase', 'decrease', 'no_change');

-- AlterTable
ALTER TABLE "CurrencyPair" DROP COLUMN "isEnabled";

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "isIncrease",
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trendDirection" "TrendDirection" NOT NULL;
