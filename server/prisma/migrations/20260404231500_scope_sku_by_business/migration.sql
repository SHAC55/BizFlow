-- DropIndex
DROP INDEX "Product_sku_key";

-- CreateIndex
CREATE UNIQUE INDEX "Product_businessId_sku_key" ON "Product"("businessId", "sku");
