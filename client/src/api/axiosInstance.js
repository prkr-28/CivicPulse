import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://civicpulse-gn5g.onrender.com'
});

let store = null;

export const setAxiosStore = (reduxStore) => {
  store = reduxStore;
};

axiosInstance.interceptors.request.use(
  (config) => {
    let token = null;
    if (store) {
      token = store.getState().auth.token;
    }

    if (!token) {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');

      if (store) {
        const { logout } = require('../store/slices/authSlice');
        store.dispatch(logout());
      }

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
