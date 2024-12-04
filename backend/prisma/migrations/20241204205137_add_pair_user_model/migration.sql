-- CreateTable
CREATE TABLE "UsersOnPairs" (
    "userId" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsersOnPairs_pkey" PRIMARY KEY ("userId","pairId")
);

-- AddForeignKey
ALTER TABLE "UsersOnPairs" ADD CONSTRAINT "UsersOnPairs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnPairs" ADD CONSTRAINT "UsersOnPairs_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "CurrencyPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
