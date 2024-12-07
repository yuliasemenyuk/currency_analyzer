-- DropForeignKey
ALTER TABLE "CurrencyPair" DROP CONSTRAINT "CurrencyPair_fromCode_fkey";

-- DropForeignKey
ALTER TABLE "CurrencyPair" DROP CONSTRAINT "CurrencyPair_toCode_fkey";

-- DropForeignKey
ALTER TABLE "CurrencyRateHistory" DROP CONSTRAINT "CurrencyRateHistory_pairId_fkey";

-- DropForeignKey
ALTER TABLE "Rule" DROP CONSTRAINT "Rule_pairId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnPairs" DROP CONSTRAINT "UsersOnPairs_pairId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnPairs" DROP CONSTRAINT "UsersOnPairs_userId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnRules" DROP CONSTRAINT "UsersOnRules_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnRules" DROP CONSTRAINT "UsersOnRules_userId_fkey";

-- AddForeignKey
ALTER TABLE "CurrencyPair" ADD CONSTRAINT "CurrencyPair_fromCode_fkey" FOREIGN KEY ("fromCode") REFERENCES "Currency"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyPair" ADD CONSTRAINT "CurrencyPair_toCode_fkey" FOREIGN KEY ("toCode") REFERENCES "Currency"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyRateHistory" ADD CONSTRAINT "CurrencyRateHistory_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "CurrencyPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "CurrencyPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnPairs" ADD CONSTRAINT "UsersOnPairs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnPairs" ADD CONSTRAINT "UsersOnPairs_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "CurrencyPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRules" ADD CONSTRAINT "UsersOnRules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRules" ADD CONSTRAINT "UsersOnRules_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
