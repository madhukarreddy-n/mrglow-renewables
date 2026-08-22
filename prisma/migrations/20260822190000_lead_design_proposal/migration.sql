-- AlterTable
ALTER TABLE "SiteSurvey" ADD COLUMN IF NOT EXISTS "structureType" TEXT;
ALTER TABLE "SiteSurvey" ADD COLUMN IF NOT EXISTS "buildingFloors" TEXT;
ALTER TABLE "SiteSurvey" ADD COLUMN IF NOT EXISTS "roofHeight" TEXT;
ALTER TABLE "SiteSurvey" ADD COLUMN IF NOT EXISTS "sanctionedLoad" TEXT;
ALTER TABLE "SiteSurvey" ADD COLUMN IF NOT EXISTS "importedFileKey" TEXT;
ALTER TABLE "SiteSurvey" ADD COLUMN IF NOT EXISTS "importedRaw" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "LeadDesign" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "includeInProposal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LeadLineItem" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'nos',
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "includeInProposal" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ShowcaseBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "highlight" TEXT,
    "logoKey" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowcaseBrand_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeadDesign_leadId_sortOrder_idx" ON "LeadDesign"("leadId", "sortOrder");

ALTER TABLE "LeadDesign" DROP CONSTRAINT IF EXISTS "LeadDesign_leadId_fkey";
ALTER TABLE "LeadDesign" ADD CONSTRAINT "LeadDesign_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadLineItem" DROP CONSTRAINT IF EXISTS "LeadLineItem_leadId_fkey";
ALTER TABLE "LeadLineItem" ADD CONSTRAINT "LeadLineItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
