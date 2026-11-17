-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PERIFÉRICO', 'MONITOR', 'MOUSEPAD', 'CADEIRA', 'ACESSÓRIO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType";
