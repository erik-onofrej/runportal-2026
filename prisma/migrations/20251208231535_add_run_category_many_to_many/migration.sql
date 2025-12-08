-- CreateTable
CREATE TABLE "RunCategoryAssignment" (
    "runId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "RunCategoryAssignment_pkey" PRIMARY KEY ("runId","categoryId")
);

-- Migrate existing data from RunCategory to RunCategoryAssignment
INSERT INTO "RunCategoryAssignment" ("runId", "categoryId")
SELECT "runId", "id" FROM "RunCategory"
WHERE "runId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "RunCategoryAssignment_runId_idx" ON "RunCategoryAssignment"("runId");

-- CreateIndex
CREATE INDEX "RunCategoryAssignment_categoryId_idx" ON "RunCategoryAssignment"("categoryId");

-- DropIndex (drop the old unique constraint)
DROP INDEX "RunCategory_runId_code_key";

-- AlterTable (drop runId column from RunCategory)
ALTER TABLE "RunCategory" DROP COLUMN "runId";

-- CreateIndex (add unique constraint on code)
CREATE UNIQUE INDEX "RunCategory_code_key" ON "RunCategory"("code");

-- CreateIndex
CREATE INDEX "RunCategory_code_idx" ON "RunCategory"("code");

-- AddForeignKey
ALTER TABLE "RunCategoryAssignment" ADD CONSTRAINT "RunCategoryAssignment_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunCategoryAssignment" ADD CONSTRAINT "RunCategoryAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RunCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
