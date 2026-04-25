export type AppRoute =
  | "dashboard"
  | "inventory"
  | "addInventory"
  | "sales"
  | "customers";

export type AppScreen =
  | { route: "dashboard" }
  | { route: "inventory" }
  | { route: "addInventory"; productId?: string }
  | { route: "sales" }
  | { route: "saleDetail"; saleId: string }
  | { route: "addSale" }
  | { route: "customers" }
  | { route: "customerDetail"; customerId: string }
  | { route: "addCustomer"; customerId?: string }
  | { route: "productDetail"; productId: string };
