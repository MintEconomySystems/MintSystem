-- CreateTable
CREATE TABLE "Balance" (
    "accountId" TEXT NOT NULL PRIMARY KEY,
    "points" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PointLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "accountId" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Identity" (
    "scopeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("scopeId", "ownerId")
);

-- CreateTable
CREATE TABLE "LinkCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PointLog_accountId_idx" ON "PointLog"("accountId");
