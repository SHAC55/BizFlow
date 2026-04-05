export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (params) => [...productKeys.lists(), params],
  detail: (productId) => [...productKeys.all, "detail", productId],
  movements: (productId) => [...productKeys.detail(productId), "movements"],
  lowStock: (params) => [...productKeys.all, "low-stock", params],
};

export const customerKeys = {
  all: ["customers"],
  lists: () => [...customerKeys.all, "list"],
  list: (params) => [...customerKeys.lists(), params],
  detail: (customerId) => [...customerKeys.all, "detail", customerId],
};

export const saleKeys = {
  all: ["sales"],
  lists: () => [...saleKeys.all, "list"],
  list: (params) => [...saleKeys.lists(), params],
  detail: (saleId) => [...saleKeys.all, "detail", saleId],
};
