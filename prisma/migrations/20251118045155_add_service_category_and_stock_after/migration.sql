-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN     "stockAfter" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "serviceCategory" TEXT NOT NULL DEFAULT 'KILOAN';
