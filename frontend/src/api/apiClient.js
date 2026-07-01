import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined
      ? response.data.data
      : response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    console.error("[API Error]", message);
    return Promise.reject(error);
  },
);

export default apiClient;
