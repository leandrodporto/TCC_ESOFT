-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ROOT', 'ADMIN', 'NOTARYBOSS', 'TECHNICAL', 'LOGISTICS', 'DRIVER', 'TRAINEE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notaryOfficeId" TEXT,
    "addressId" TEXT,
    "userType" "UserType" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaryOffice" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "NotaryOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "notaryOfficeId" TEXT NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingPlace" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "municipalityId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "sections" TEXT[],
    "voters" INTEGER NOT NULL,
    "notaryOfficeId" TEXT NOT NULL,

    CONSTRAINT "VotingPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Brasil',

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_code_key" ON "Municipality"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_notaryOfficeId_key" ON "Municipality"("notaryOfficeId");

-- CreateIndex
CREATE UNIQUE INDEX "VotingPlace_code_key" ON "VotingPlace"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_notaryOfficeId_fkey" FOREIGN KEY ("notaryOfficeId") REFERENCES "NotaryOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaryOffice" ADD CONSTRAINT "NotaryOffice_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipality" ADD CONSTRAINT "Municipality_notaryOfficeId_fkey" FOREIGN KEY ("notaryOfficeId") REFERENCES "NotaryOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingPlace" ADD CONSTRAINT "VotingPlace_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingPlace" ADD CONSTRAINT "VotingPlace_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingPlace" ADD CONSTRAINT "VotingPlace_notaryOfficeId_fkey" FOREIGN KEY ("notaryOfficeId") REFERENCES "NotaryOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
