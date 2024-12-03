-- CreateTable
CREATE TABLE "CurrencyRateHistory" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRateHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CurrencyRateHistory" ADD CONSTRAINT "CurrencyRateHistory_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "CurrencyPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
