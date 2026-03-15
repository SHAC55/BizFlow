/*
  Warnings:

  - The primary key for the `verification_codes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "verification_codes_id_seq";
