export type AppRoute =
  | "dashboard"
  | "inventory"
  | "addInventory"
  | "sales"
  | "customers";

export type RootStackParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  AddInventory: { productId?: string } | undefined;
  ProductDetail: { productId: string };
  Sales: undefined;
  AddSale: undefined;
  SaleDetail: { saleId: string };
  Customers: undefined;
  AddCustomer: { customerId?: string } | undefined;
  CustomerDetail: { customerId: string };
};
