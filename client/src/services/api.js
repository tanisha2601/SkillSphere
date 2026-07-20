import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APIBASEURL ||
    "https://skillsphere-backend-uew5.onrender.com/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      return Promise.reject({
        message: data?.message || 'Something went wrong',
        status,
        data,
      });
    }

    return Promise.reject({
      message: error.message || 'Network Error',
      status: 500,
    });
  }
);

export default api;
