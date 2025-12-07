/*
  Warnings:

  - You are about to drop the `EventGallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GalleryImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventGallery" DROP CONSTRAINT "EventGallery_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventGallery" DROP CONSTRAINT "EventGallery_galleryId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryImage" DROP CONSTRAINT "GalleryImage_galleryId_fkey";

-- DropTable
DROP TABLE "EventGallery";

-- DropTable
DROP TABLE "Gallery";

-- DropTable
DROP TABLE "GalleryImage";
