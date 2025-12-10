/*
  Warnings:

  - You are about to drop the column `guestCity` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestClub` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestDateOfBirth` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestEmail` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestFirstName` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestGender` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestLastName` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `runnerId` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `runnerId` on the `RunResult` table. All the data in the column will be lost.
  - You are about to drop the `Runner` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dateOfBirth` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `RunResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `RunResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearOfBirth` to the `RunResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_runnerId_fkey";

-- DropForeignKey
ALTER TABLE "RunResult" DROP CONSTRAINT "RunResult_runnerId_fkey";

-- DropForeignKey
ALTER TABLE "Runner" DROP CONSTRAINT "Runner_userId_fkey";

-- DropIndex
DROP INDEX "Registration_guestEmail_idx";

-- DropIndex
DROP INDEX "Registration_runnerId_idx";

-- DropIndex
DROP INDEX "RunResult_runnerId_idx";

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "guestCity",
DROP COLUMN "guestClub",
DROP COLUMN "guestDateOfBirth",
DROP COLUMN "guestEmail",
DROP COLUMN "guestFirstName",
DROP COLUMN "guestGender",
DROP COLUMN "guestLastName",
DROP COLUMN "guestPhone",
DROP COLUMN "runnerId",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "club" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "RunResult" DROP COLUMN "runnerId",
ADD COLUMN     "club" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "yearOfBirth" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Runner";

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");
