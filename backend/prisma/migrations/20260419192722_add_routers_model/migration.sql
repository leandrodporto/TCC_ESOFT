-- CreateTable
CREATE TABLE "Routers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "routerData" JSONB NOT NULL,

    CONSTRAINT "Routers_pkey" PRIMARY KEY ("id")
);
