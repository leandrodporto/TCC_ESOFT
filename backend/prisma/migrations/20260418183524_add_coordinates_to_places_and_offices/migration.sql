/*
  Warnings:

  - You are about to drop the column `transmissionOperator` on the `NotaryOffice` table. All the data in the column will be lost.
  - You are about to drop the column `transmissionPointKit` on the `NotaryOffice` table. All the data in the column will be lost.
  - You are about to drop the column `transmissionPointKitPassword` on the `NotaryOffice` table. All the data in the column will be lost.
  - Made the column `isTransmissionPoint` on table `NotaryOffice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isTransmissionPoint` on table `VotingPlace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "NotaryOffice" DROP COLUMN "transmissionOperator",
DROP COLUMN "transmissionPointKit",
DROP COLUMN "transmissionPointKitPassword",
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ALTER COLUMN "isTransmissionPoint" SET NOT NULL;

-- AlterTable
ALTER TABLE "VotingPlace" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ALTER COLUMN "isTransmissionPoint" SET NOT NULL;
