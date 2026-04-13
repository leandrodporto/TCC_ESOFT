/*
  Warnings:

  - You are about to drop the column `complement` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `VotingPlace` table. All the data in the column will be lost.
  - Added the required column `streetNumber` to the `NotaryOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetNumber` to the `VotingPlace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "complement";

-- AlterTable
ALTER TABLE "NotaryOffice" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "streetNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "streetNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VotingPlace" DROP COLUMN "number",
ADD COLUMN     "streetNumber" INTEGER NOT NULL;
