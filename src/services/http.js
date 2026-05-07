import axios from 'axios';

// Real backend base URL (replaceable). When VITE_API_BASE_URL is set,
// you can swap mock services with HTTP calls using this client.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const http = axios.create({ baseURL, timeout: 15_000 });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cbs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('cbs_token');
      localStorage.removeItem('cbs_user');
    }
    return Promise.reject(err);
  }
);
