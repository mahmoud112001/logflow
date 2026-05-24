import axios from 'axios';

// Axios instance pointed at Vite proxy
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends httpOnly cookie on every request
});

// Normalize all errors to a plain Error with a human-readable message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
