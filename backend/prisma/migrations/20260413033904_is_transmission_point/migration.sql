-- DropForeignKey
ALTER TABLE "Auth" DROP CONSTRAINT "Auth_userId_fkey";

-- DropForeignKey
ALTER TABLE "VotingPlace" DROP CONSTRAINT "VotingPlace_notaryOfficeId_fkey";

-- AlterTable
ALTER TABLE "NotaryOffice" ADD COLUMN     "isTransmissionPoint" BOOLEAN DEFAULT false,
ADD COLUMN     "transmissionOperator" TEXT,
ADD COLUMN     "transmissionPointKit" TEXT,
ADD COLUMN     "transmissionPointKitPassword" TEXT;

-- AlterTable
ALTER TABLE "VotingPlace" ADD COLUMN     "isTransmissionPoint" BOOLEAN DEFAULT false,
ADD COLUMN     "transmissionOperator" TEXT,
ADD COLUMN     "transmissionPointId" TEXT,
ADD COLUMN     "transmissionPointKit" TEXT,
ADD COLUMN     "transmissionPointKitPassword" TEXT;

-- CreateIndex
CREATE INDEX "NotaryOffice_isTransmissionPoint_idx" ON "NotaryOffice"("isTransmissionPoint");

-- CreateIndex
CREATE INDEX "VotingPlace_isTransmissionPoint_idx" ON "VotingPlace"("isTransmissionPoint");

-- CreateIndex
CREATE INDEX "VotingPlace_municipalityId_idx" ON "VotingPlace"("municipalityId");

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingPlace" ADD CONSTRAINT "VotingPlace_notaryOfficeId_fkey" FOREIGN KEY ("notaryOfficeId") REFERENCES "NotaryOffice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
