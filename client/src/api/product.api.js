import API from "../lib/axios";

export const getProductsAPI = async (params = {}) => {
  const response = await API.get("/products", { params });
  return response.data;
};

export const getLowStockProductsAPI = async (params = {}) => {
  const response = await API.get("/products/low-stock", { params });
  return response.data;
};

export const getProductAPI = async (productId) => {
  const response = await API.get(`/products/${productId}`);
  return response.data;
};

export const createProductAPI = async (data) => {
  const response = await API.post("/products", data);
  return response.data;
};

export const updateProductAPI = async (productId, data) => {
  const response = await API.patch(`/products/${productId}`, data);
  return response.data;
};

export const deleteProductAPI = async (productId) => {
  const response = await API.delete(`/products/${productId}`);
  return response.data;
};

export const adjustProductStockAPI = async (productId, data) => {
  const response = await API.post(`/products/${productId}/adjust-stock`, data);
  return response.data;
};

export const getProductMovementsAPI = async (productId) => {
  const response = await API.get(`/products/${productId}/movements`);
  return response.data;
};
