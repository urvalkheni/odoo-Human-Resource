import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 (Unauthorized) mainly
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      // We'll handle redirection in the React component/context level usually,
      // but this is a good place to clear local state if needed.
    }
    return Promise.reject(error);
  }
);

export default api;
