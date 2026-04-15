import axios from 'axios';

import { getAccessToken,getRefreshToken,setTokens } from '../utils/storage';

const api = axios.create({
    baseURL: "http://192.168.0.104:5000/api",
})

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {

      const refreshToken = await getRefreshToken();

      const res = await axios.post(
        "http:192.168.0.104:5000/api/auth/refresh-token",
        { refreshToken }
      );

      await setTokens(
        res.data.accessToken,
        res.data.refreshToken
      );

      error.config.headers.Authorization =
        `Bearer ${res.data.accessToken}`;

      return axios(error.config);
    }

    return Promise.reject(error);
  }
);

export default api;