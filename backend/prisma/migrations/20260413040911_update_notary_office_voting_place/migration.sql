/*
  Warnings:

  - You are about to drop the column `transmissionPointId` on the `VotingPlace` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "VotingPlace_isTransmissionPoint_idx";

-- AlterTable
ALTER TABLE "VotingPlace" DROP COLUMN "transmissionPointId",
ADD COLUMN     "transmitToNotaryOfficeId" TEXT,
ADD COLUMN     "transmitToVotingPlaceId" TEXT;

-- CreateIndex
CREATE INDEX "VotingPlace_transmitToVotingPlaceId_idx" ON "VotingPlace"("transmitToVotingPlaceId");

-- CreateIndex
CREATE INDEX "VotingPlace_transmitToNotaryOfficeId_idx" ON "VotingPlace"("transmitToNotaryOfficeId");

-- AddForeignKey
ALTER TABLE "VotingPlace" ADD CONSTRAINT "VotingPlace_transmitToVotingPlaceId_fkey" FOREIGN KEY ("transmitToVotingPlaceId") REFERENCES "VotingPlace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingPlace" ADD CONSTRAINT "VotingPlace_transmitToNotaryOfficeId_fkey" FOREIGN KEY ("transmitToNotaryOfficeId") REFERENCES "NotaryOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
