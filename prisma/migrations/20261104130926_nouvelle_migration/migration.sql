/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pswd` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_expires_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verify_token` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CLIENT', 'COLLABORATOR', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TAXI', 'VTC', 'SARL', 'ARTISAN', 'OTHERS');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "NCPro" TEXT,
ADD COLUMN     "NLicenceDrive" TEXT,
ADD COLUMN     "NSS" TEXT,
ADD COLUMN     "NSiret" TEXT,
ADD COLUMN     "activate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "activity" "ActivityType",
ADD COLUMN     "adress" TEXT,
ADD COLUMN     "birth" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cp" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "pswd" TEXT NOT NULL,
ADD COLUMN     "role" "UserType" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "token_expires_at" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validate_user" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verify_token" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Documents" (
    "id_doc" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "identity" TEXT,
    "professional_card" TEXT,
    "license_drive" TEXT,
    "ADS" TEXT,
    "logbook" TEXT,
    "proof_of_address" TEXT,
    "health_insurance_card" TEXT,
    "craftmen_s_registration_card" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id_doc")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documents_clientId_key" ON "Documents"("clientId");

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
