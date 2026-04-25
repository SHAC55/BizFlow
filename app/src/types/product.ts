export type ProductCategoryCount = {
  category: string;
  count: number;
};

export type Product = {
  id: string;
  businessId: string;
  name: string;
  category: string;
  costPrice: number;
  price: number;
  quantity: number;
  minimumQuantity: number;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductsSummary = {
  totalProducts: number;
  totalValue: number;
  totalCostValue: number;
  projectedProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  categories: ProductCategoryCount[];
};

export type ProductsResponse = {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: ProductsSummary;
};

export type CreateProductPayload = {
  name: string;
  category: string;
  costPrice: number;
  price: number;
  quantity: number;
  minimumQuantity: number;
  sku?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type InventoryMovement = {
  id: string;
  productId: string;
  businessId: string;
  userId: number;
  type: "INITIAL" | "INCREASE" | "DECREASE" | "SET";
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  reason: string;
  notes?: string | null;
  createdAt: string;
};

export type AdjustStockPayload =
  | {
      type: "INCREASE";
      quantity: number;
      reason: string;
      notes?: string;
    }
  | {
      type: "DECREASE";
      quantity: number;
      reason: string;
      notes?: string;
    }
  | {
      type: "SET";
      quantity: number;
      reason: string;
      notes?: string;
    };
