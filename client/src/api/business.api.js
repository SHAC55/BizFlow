import API from "../lib/axios";

export const updateBusinessAPI = async (data) => {
  const response = await API.patch("/business", data);
  return response.data;
};
