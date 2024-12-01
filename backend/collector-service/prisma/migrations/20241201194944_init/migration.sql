-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" CHAR(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");
