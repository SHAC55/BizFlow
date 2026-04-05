import API from "../lib/axios";

export const getCustomersAPI = async (params = {}) => {
  const response = await API.get("/customers", { params });
  return response.data;
};

export const getCustomerAPI = async (customerId) => {
  const response = await API.get(`/customers/${customerId}`);
  return response.data;
};

export const createCustomerAPI = async (data) => {
  const response = await API.post("/customers", data);
  return response.data;
};

export const updateCustomerAPI = async (customerId, data) => {
  const response = await API.patch(`/customers/${customerId}`, data);
  return response.data;
};

export const archiveCustomerAPI = async (customerId) => {
  const response = await API.post(`/customers/${customerId}/archive`);
  return response.data;
};
