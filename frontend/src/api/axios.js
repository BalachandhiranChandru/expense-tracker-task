import axios from 'axios';

// const BACKEND_URL = 'http://localhost:5000/api';
const BACKEND_URL = 'https://expense-tracker-task-rhlc.onrender.com/api';


// // const BACKEND_URL = 'https://task-expense-tracker-fbrk.onrender.com/api';

const API = axios.create({ baseURL: BACKEND_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;



