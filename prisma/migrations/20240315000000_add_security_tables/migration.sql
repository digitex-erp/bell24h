-- CreateTable
CREATE TABLE "SuspiciousTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "patterns" TEXT[] NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'flagged',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuspiciousTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MFASetup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT[] NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MFASetup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "location" JSONB,
    "verificationToken" TEXT,
    "verificationExpiry" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuspiciousTransaction_userId_idx" ON "SuspiciousTransaction"("userId");

-- CreateIndex
CREATE INDEX "SuspiciousTransaction_status_idx" ON "SuspiciousTransaction"("status");

-- CreateIndex
CREATE INDEX "SuspiciousTransaction_createdAt_idx" ON "SuspiciousTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "MFASetup_userId_idx" ON "MFASetup"("userId");

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- CreateIndex
CREATE INDEX "Device_ipAddress_idx" ON "Device"("ipAddress");

-- CreateIndex
CREATE INDEX "Device_lastActive_idx" ON "Device"("lastActive");

-- AddForeignKey
ALTER TABLE "SuspiciousTransaction" ADD CONSTRAINT "SuspiciousTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MFASetup" ADD CONSTRAINT "MFASetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; 