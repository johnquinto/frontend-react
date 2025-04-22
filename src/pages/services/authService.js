// src/services/authService.js
import axios from 'axios';

export const login = async (credentials) => {
  return axios.post('https://backend-express-ndpe.onrender.com/api/auth/login', credentials);
};
