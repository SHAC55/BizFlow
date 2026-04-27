export type AppRoute =
  | "dashboard"
  | "inventory"
  | "addInventory"
  | "sales"
  | "customers";

export type RootStackParamList = {
  MainTabs: undefined;
  AddInventory: { productId?: string } | undefined;
  ProductDetail: { productId: string };
  AddSale: undefined;
  SaleDetail: { saleId: string };
  AddCustomer: { customerId?: string } | undefined;
  CustomerDetail: { customerId: string };
  UserDetail: undefined;
};
