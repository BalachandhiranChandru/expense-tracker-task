import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api';
// // const BACKEND_URL = 'https://task-expense-tracker-fbrk.onrender.com/api';

const API = axios.create({ baseURL: BACKEND_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;









// import axios from 'axios';

// // Dynamically target local vs production hosts
// // const BACKEND_URL = process.env.NODE_ENV === 'production'
// //   ? 'https://task-expense-tracker-fbrk.onrender.com/api' 
// //   : 'http://localhost:5000/api';

// // const BACKEND_URL = 'https://task-expense-tracker-fbrk.onrender.com/api';
// const BACKEND_URL = 'http://localhost:5000/api';

// const API = axios.create({ baseURL: BACKEND_URL });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default API;

// import axios from 'axios';

// // const BACKEND_URL = 'https://task-expense-tracker-fbrk.onrender.com/api';
// const BACKEND_URL = 'http://localhost:5000/api';

// // const BACKEND_URL = process.env.NODE_ENV === 'production'
// //   ? 'https://tasks-kyrr.onrender.com' 
// //   : 'http://localhost:5000/api';

// const API = axios.create({ baseURL: BACKEND_URL });

// // const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default API;
