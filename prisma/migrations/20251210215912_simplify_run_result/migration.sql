/*
  Warnings:

  - You are about to drop the column `categoryId` on the `RunResult` table. All the data in the column will be lost.
  - You are about to drop the column `importSource` on the `RunResult` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `RunResult` table. All the data in the column will be lost.
  - You are about to drop the column `registrationId` on the `RunResult` table. All the data in the column will be lost.
  - You are about to drop the column `splits` on the `RunResult` table. All the data in the column will be lost.
  - Added the required column `category` to the `RunResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RunResult" DROP CONSTRAINT "RunResult_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "RunResult" DROP CONSTRAINT "RunResult_registrationId_fkey";

-- DropIndex
DROP INDEX "RunResult_categoryId_idx";

-- DropIndex
DROP INDEX "RunResult_registrationId_key";

-- AlterTable
ALTER TABLE "RunResult" DROP COLUMN "categoryId",
DROP COLUMN "importSource",
DROP COLUMN "importedAt",
DROP COLUMN "registrationId",
DROP COLUMN "splits",
ADD COLUMN     "bibNumber" TEXT,
ADD COLUMN     "category" TEXT NOT NULL;
