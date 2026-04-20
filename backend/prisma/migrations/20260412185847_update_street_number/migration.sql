-- AlterTable
ALTER TABLE "NotaryOffice" ALTER COLUMN "streetNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "streetNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VotingPlace" ALTER COLUMN "streetNumber" DROP NOT NULL;
