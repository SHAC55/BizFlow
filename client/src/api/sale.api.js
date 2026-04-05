import API from "../lib/axios";

export const getSalesAPI = async (params = {}) => {
  const response = await API.get("/sales", { params });
  return response.data;
};

export const getSaleAPI = async (saleId) => {
  const response = await API.get(`/sales/${saleId}`);
  return response.data;
};

export const createSaleAPI = async (data) => {
  const response = await API.post("/sales", data);
  return response.data;
};

export const createSalePaymentAPI = async (saleId, data) => {
  const response = await API.post(`/sales/${saleId}/payments`, data);
  return response.data;
};
