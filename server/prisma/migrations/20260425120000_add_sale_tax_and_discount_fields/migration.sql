ALTER TABLE "Sale"
ADD COLUMN "subtotalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Sale"
SET
  "subtotalAmount" = "totalAmount",
  "discountAmount" = 0,
  "gstRate" = 0,
  "gstAmount" = 0
WHERE "subtotalAmount" = 0;
