import axios from 'axios';

// Use VITE_API_URL from environment variables, with a fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for cookies or auth tokens
});

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error);
    throw error.response?.data || { message: 'An error occurred during registration' };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error.response?.data || { message: 'An error occurred during login' };
  }
};

// Optional: Add logging to debug API_URL
console.log('API_URL:', API_URL);

export default api;
