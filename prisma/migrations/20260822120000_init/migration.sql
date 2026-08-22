-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SITE_SURVEYOR', 'INSTALLATION_MANAGER', 'SERVICE_MANAGER', 'FINANCE', 'VIEWER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'SITE_SURVEY_PENDING', 'SITE_SURVEY_SCHEDULED', 'SITE_SURVEY_COMPLETED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "CustomerCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'SOLAR_CALCULATOR', 'DIRECT_CONSULTATION', 'WHATSAPP', 'REFERRAL', 'CAMPAIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('CALL', 'WHATSAPP', 'EMAIL', 'SITE_VISIT', 'MEETING', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INSTALLATION', 'COMMISSIONED', 'SERVICE_DUE', 'AMC', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('PLANNED', 'INSTALLATION', 'COMMISSIONED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PANEL_CLEANING', 'PREVENTIVE_MAINTENANCE', 'INSPECTION', 'INVERTER_SERVICE', 'ELECTRICAL_SERVICE', 'BREAKDOWN', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('OPEN', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AmcStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'PENDING_RENEWAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatorConfig" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT,
    "category" "CustomerCategory",
    "subsidyType" TEXT,
    "systemCostPerKwp" DECIMAL(12,2) NOT NULL,
    "panelWattage" INTEGER NOT NULL DEFAULT 550,
    "peakSunHours" DECIMAL(6,3) NOT NULL,
    "generationFactor" DECIMAL(8,4) NOT NULL,
    "systemEfficiency" DECIMAL(6,4) NOT NULL,
    "roofAreaPerKwp" DECIMAL(8,2) NOT NULL,
    "annualDegradation" DECIMAL(6,4) NOT NULL,
    "tariffEscalation" DECIMAL(6,4) NOT NULL,
    "maintenancePct" DECIMAL(6,4) NOT NULL,
    "projectLifetime" INTEGER NOT NULL DEFAULT 30,
    "co2KgPerKwh" DECIMAL(8,4) NOT NULL,
    "treesPerTonCo2" DECIMAL(8,4) NOT NULL,
    "unitsPerKwMonth" DECIMAL(10,4),
    "extra" JSONB,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculatorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubsidyConfig" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT,
    "category" "CustomerCategory" NOT NULL,
    "subsidyType" TEXT NOT NULL,
    "slabs" JSONB NOT NULL,
    "maxSubsidy" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubsidyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPricing" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "category" "CustomerCategory" NOT NULL,
    "subsidyType" TEXT,
    "costPerKwp" DECIMAL(12,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatorReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "leadId" TEXT,
    "inputData" JSONB NOT NULL,
    "calculationParameters" JSONB NOT NULL,
    "calculationVersion" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculatorReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "pincode" TEXT,
    "state" TEXT,
    "category" "CustomerCategory" NOT NULL DEFAULT 'RESIDENTIAL',
    "monthlyBill" DECIMAL(12,2),
    "monthlyBillRange" TEXT,
    "monthlyUnits" DECIMAL(12,2),
    "electricityUnitCost" DECIMAL(8,4),
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "calculatorReportId" TEXT,
    "preferredCallback" TEXT,
    "message" TEXT,
    "campaign" TEXT,
    "referral" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "type" "FollowUpType" NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSurvey" (
    "id" TEXT NOT NULL,
    "surveyNumber" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "surveyorId" TEXT,
    "address" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "propertyType" TEXT,
    "roofType" TEXT,
    "roofArea" DECIMAL(12,2),
    "availableArea" DECIMAL(12,2),
    "orientation" TEXT,
    "shading" TEXT,
    "electricityMeterDetails" TEXT,
    "phase" TEXT,
    "currentLoad" TEXT,
    "notes" TEXT,
    "recommendedCapacityKwp" DECIMAL(10,3),
    "status" "SurveyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSurveyPhoto" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteSurveyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "ownerId" TEXT,
    "systemCapacity" DECIMAL(10,3) NOT NULL,
    "panelWattage" INTEGER,
    "inverter" TEXT,
    "mounting" TEXT,
    "warranty" TEXT,
    "terms" TEXT,
    "validityDate" TIMESTAMP(3),
    "grossCost" DECIMAL(14,2) NOT NULL,
    "subsidy" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netCost" DECIMAL(14,2) NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationVersion" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "leadId" TEXT,
    "quotationId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "category" "CustomerCategory" NOT NULL,
    "installationDate" TIMESTAMP(3),
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarPlant" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "capacityKwp" DECIMAL(12,3) NOT NULL,
    "installationDate" TIMESTAMP(3),
    "commissioningDate" TIMESTAMP(3),
    "panelCount" INTEGER,
    "panelWattage" INTEGER,
    "inverterCapacity" DECIMAL(12,3),
    "expectedMonthlyGeneration" DECIMAL(14,2),
    "expectedAnnualGeneration" DECIMAL(14,2),
    "location" TEXT,
    "monitoringStatus" TEXT,
    "inverterInfo" TEXT,
    "warrantyInfo" TEXT,
    "status" "PlantStatus" NOT NULL DEFAULT 'PLANNED',
    "monitoringProvider" TEXT,
    "externalPlantId" TEXT,
    "externalDeviceId" TEXT,
    "apiStatus" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolarPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantGeneration" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "actualKwh" DECIMAL(14,3) NOT NULL,
    "expectedKwh" DECIMAL(14,3),
    "gridExportKwh" DECIMAL(14,3),
    "gridImportKwh" DECIMAL(14,3),
    "performanceRatio" DECIMAL(8,4),
    "availability" DECIMAL(8,4),
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantSaving" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "expectedSavings" DECIMAL(14,2),
    "actualSavings" DECIMAL(14,2) NOT NULL,
    "co2AvoidedKg" DECIMAL(14,2),
    "tariffUsed" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantSaving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "plantId" TEXT,
    "type" "ServiceType" NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "ServiceStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAssignment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmcContract" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "plantId" TEXT,
    "assignedToId" TEXT,
    "planName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextService" TIMESTAMP(3),
    "lastService" TIMESTAMP(3),
    "status" "AmcStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmcContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "plantId" TEXT,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT NOT NULL,
    "capacityKwp" DECIMAL(12,3),
    "propertyType" TEXT,
    "description" TEXT,
    "annualGeneration" DECIMAL(14,2),
    "estimatedSavings" TEXT,
    "images" JSONB,
    "beforeAfter" JSONB,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "category" TEXT,
    "systemCapacity" TEXT,
    "quote" TEXT NOT NULL,
    "photoKey" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "topic" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "readAt" TIMESTAMP(3),
    "entity" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitHit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "CalculatorConfig_stateCode_category_subsidyType_active_idx" ON "CalculatorConfig"("stateCode", "category", "subsidyType", "active");

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorReport_reportNumber_key" ON "CalculatorReport"("reportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorReport_shareToken_key" ON "CalculatorReport"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadNumber_key" ON "Lead"("leadNumber");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUp_dueAt_status_idx" ON "FollowUp"("dueAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSurvey_surveyNumber_key" ON "SiteSurvey"("surveyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_leadId_key" ON "Customer"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_quotationId_key" ON "Customer"("quotationId");

-- CreateIndex
CREATE UNIQUE INDEX "SolarPlant_plantId_key" ON "SolarPlant"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "PlantGeneration_plantId_periodDate_periodType_key" ON "PlantGeneration"("plantId", "periodDate", "periodType");

-- CreateIndex
CREATE UNIQUE INDEX "PlantSaving_plantId_periodDate_periodType_key" ON "PlantSaving"("plantId", "periodDate", "periodType");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_ticketNumber_key" ON "ServiceRequest"("ticketNumber");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_slug_key" ON "ContentBlock"("slug");

-- CreateIndex
CREATE INDEX "RateLimitHit_key_createdAt_idx" ON "RateLimitHit"("key", "createdAt");

-- AddForeignKey
ALTER TABLE "CalculatorReport" ADD CONSTRAINT "CalculatorReport_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSurvey" ADD CONSTRAINT "SiteSurvey_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSurvey" ADD CONSTRAINT "SiteSurvey_surveyorId_fkey" FOREIGN KEY ("surveyorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSurveyPhoto" ADD CONSTRAINT "SiteSurveyPhoto_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "SiteSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationVersion" ADD CONSTRAINT "QuotationVersion_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolarPlant" ADD CONSTRAINT "SolarPlant_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantGeneration" ADD CONSTRAINT "PlantGeneration_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "SolarPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantSaving" ADD CONSTRAINT "PlantSaving_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "SolarPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "SolarPlant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmcContract" ADD CONSTRAINT "AmcContract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmcContract" ADD CONSTRAINT "AmcContract_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "SolarPlant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmcContract" ADD CONSTRAINT "AmcContract_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "SolarPlant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

