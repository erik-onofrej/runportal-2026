-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "regionId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "districtId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "locationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "locationId" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "bankAccount" TEXT,
    "paymentNote" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "registrationOpenDate" TIMESTAMP(3),
    "registrationCloseDate" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "longDescription" TEXT,
    "rules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "elevationGain" INTEGER,
    "surface" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunCategory" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "gender" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunEntryFee" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunEntryFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchedule" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "location" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPartner" (
    "eventId" INTEGER NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "level" TEXT DEFAULT 'general',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventPartner_pkey" PRIMARY KEY ("eventId","partnerId")
);

-- CreateTable
CREATE TABLE "EventAttachment" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGallery" (
    "eventId" INTEGER NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventGallery_pkey" PRIMARY KEY ("eventId","galleryId")
);

-- CreateTable
CREATE TABLE "Runner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Slovakia',
    "club" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "runnerId" TEXT,
    "guestFirstName" TEXT NOT NULL,
    "guestLastName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT,
    "guestDateOfBirth" TIMESTAMP(3) NOT NULL,
    "guestGender" TEXT NOT NULL,
    "guestCity" TEXT,
    "guestClub" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAmount" DOUBLE PRECISION,
    "paidAt" TIMESTAMP(3),
    "paymentNote" TEXT,
    "presented" BOOLEAN NOT NULL DEFAULT false,
    "bibNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunResult" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "runId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "runnerId" TEXT,
    "overallPlace" INTEGER,
    "categoryPlace" INTEGER,
    "finishTime" INTEGER,
    "gunTime" INTEGER,
    "resultStatus" TEXT NOT NULL DEFAULT 'finished',
    "pace" DOUBLE PRECISION,
    "splits" JSONB,
    "importedAt" TIMESTAMP(3),
    "importSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE INDEX "Region_code_idx" ON "Region"("code");

-- CreateIndex
CREATE INDEX "District_regionId_idx" ON "District"("regionId");

-- CreateIndex
CREATE INDEX "District_code_idx" ON "District"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_regionId_name_key" ON "District"("regionId", "name");

-- CreateIndex
CREATE INDEX "Location_districtId_idx" ON "Location"("districtId");

-- CreateIndex
CREATE INDEX "Location_regionId_idx" ON "Location"("regionId");

-- CreateIndex
CREATE INDEX "Location_city_idx" ON "Location"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_name_key" ON "Organizer"("name");

-- CreateIndex
CREATE INDEX "Organizer_name_idx" ON "Organizer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_locationId_idx" ON "Event"("locationId");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Run_eventId_idx" ON "Run"("eventId");

-- CreateIndex
CREATE INDEX "Run_startTime_idx" ON "Run"("startTime");

-- CreateIndex
CREATE INDEX "RunCategory_runId_idx" ON "RunCategory"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "RunCategory_runId_code_key" ON "RunCategory"("runId", "code");

-- CreateIndex
CREATE INDEX "RunEntryFee_runId_idx" ON "RunEntryFee"("runId");

-- CreateIndex
CREATE INDEX "RunEntryFee_validFrom_validTo_idx" ON "RunEntryFee"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "EventSchedule_eventId_idx" ON "EventSchedule"("eventId");

-- CreateIndex
CREATE INDEX "EventSchedule_startTime_idx" ON "EventSchedule"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_name_key" ON "Partner"("name");

-- CreateIndex
CREATE INDEX "Partner_name_idx" ON "Partner"("name");

-- CreateIndex
CREATE INDEX "EventPartner_eventId_idx" ON "EventPartner"("eventId");

-- CreateIndex
CREATE INDEX "EventPartner_partnerId_idx" ON "EventPartner"("partnerId");

-- CreateIndex
CREATE INDEX "EventAttachment_eventId_idx" ON "EventAttachment"("eventId");

-- CreateIndex
CREATE INDEX "EventGallery_eventId_idx" ON "EventGallery"("eventId");

-- CreateIndex
CREATE INDEX "EventGallery_galleryId_idx" ON "EventGallery"("galleryId");

-- CreateIndex
CREATE UNIQUE INDEX "Runner_email_key" ON "Runner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Runner_userId_key" ON "Runner"("userId");

-- CreateIndex
CREATE INDEX "Runner_email_idx" ON "Runner"("email");

-- CreateIndex
CREATE INDEX "Runner_userId_idx" ON "Runner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_registrationNumber_key" ON "Registration"("registrationNumber");

-- CreateIndex
CREATE INDEX "Registration_runId_idx" ON "Registration"("runId");

-- CreateIndex
CREATE INDEX "Registration_categoryId_idx" ON "Registration"("categoryId");

-- CreateIndex
CREATE INDEX "Registration_runnerId_idx" ON "Registration"("runnerId");

-- CreateIndex
CREATE INDEX "Registration_guestEmail_idx" ON "Registration"("guestEmail");

-- CreateIndex
CREATE INDEX "Registration_registrationNumber_idx" ON "Registration"("registrationNumber");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "Registration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RunResult_registrationId_key" ON "RunResult"("registrationId");

-- CreateIndex
CREATE INDEX "RunResult_runId_idx" ON "RunResult"("runId");

-- CreateIndex
CREATE INDEX "RunResult_categoryId_idx" ON "RunResult"("categoryId");

-- CreateIndex
CREATE INDEX "RunResult_runnerId_idx" ON "RunResult"("runnerId");

-- CreateIndex
CREATE INDEX "RunResult_overallPlace_idx" ON "RunResult"("overallPlace");

-- CreateIndex
CREATE INDEX "RunResult_resultStatus_idx" ON "RunResult"("resultStatus");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunCategory" ADD CONSTRAINT "RunCategory_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunEntryFee" ADD CONSTRAINT "RunEntryFee_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPartner" ADD CONSTRAINT "EventPartner_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPartner" ADD CONSTRAINT "EventPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttachment" ADD CONSTRAINT "EventAttachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGallery" ADD CONSTRAINT "EventGallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGallery" ADD CONSTRAINT "EventGallery_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Runner" ADD CONSTRAINT "Runner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RunCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RunCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
