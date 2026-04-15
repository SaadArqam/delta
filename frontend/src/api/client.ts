import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple retry logic: retry network errors and 5xx up to `maxRetries` with backoff
const maxRetries = 2;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // If no config or already retried enough, reject with a structured Error
    if (!config) {
      return Promise.reject(new Error(error.message || "API Error"));
    }

    config.__retryCount = config.__retryCount || 0;

    // Retry only on network errors or 5xx
    const shouldRetry = !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (shouldRetry && config.__retryCount < maxRetries) {
      config.__retryCount += 1;
      const delay = 300 * Math.pow(2, config.__retryCount - 1);
      await new Promise((res) => setTimeout(res, delay));
      return apiClient(config);
    }

    // Normalize error messages for the UI
    if (!error.response) {
      return Promise.reject(new Error("Network error. Please check your connection."));
    }

    const status = error.response.status;
    if (status === 404) return Promise.reject(new Error("Resource not found"));
    if (status === 422) return Promise.reject(new Error("Invalid input data"));
    if (status >= 500) return Promise.reject(new Error("Server error. Please try again later."));

    // Fallback: return server detail or generic message
    return Promise.reject(new Error(error.response.data?.detail || "An error occurred"));
  }
);

export default apiClient;
