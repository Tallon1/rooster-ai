/*
  Warnings:

  - You are about to drop the column `maxUsers` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rosters" ADD COLUMN     "folderId" TEXT;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "contractType" TEXT,
ADD COLUMN     "shiftPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "weeklyAvailability" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "maxUsers",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "employeeCount" INTEGER,
ADD COLUMN     "managerLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "tokenLimit" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "userLimit" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "store_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "store_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_store_locations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffId" TEXT NOT NULL,
    "storeLocationId" TEXT NOT NULL,

    CONSTRAINT "staff_store_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roster_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "roster_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_usage" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "cost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_store_locations_staffId_storeLocationId_key" ON "staff_store_locations"("staffId", "storeLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "token_usage_companyId_userId_month_year_key" ON "token_usage"("companyId", "userId", "month", "year");

-- AddForeignKey
ALTER TABLE "store_locations" ADD CONSTRAINT "store_locations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_store_locations" ADD CONSTRAINT "staff_store_locations_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_store_locations" ADD CONSTRAINT "staff_store_locations_storeLocationId_fkey" FOREIGN KEY ("storeLocationId") REFERENCES "store_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "roster_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_folders" ADD CONSTRAINT "roster_folders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
