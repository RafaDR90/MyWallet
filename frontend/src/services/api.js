import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL.replace('/api', '');

// Configurar axios con solo lo necesario
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para obtener CSRF token antes de peticiones POST/PUT/DELETE
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete'].includes(config.method)) {
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  if (!response.ok) {
    throw new Error('Error en la petición');
  }
  
  return response.json();
};

// Función helper para obtener CSRF token
const getCsrfToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('Error obteniendo CSRF token:', response.status);
      throw new Error('Error obteniendo CSRF token');
    }
  } catch (error) {
    console.error('Error en getCsrfToken:', error);
    throw error;
  }
};

// Función helper para hacer fetch con las configuraciones correctas
const fetchWithConfig = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Añadir este header
      ...options.headers,
    },
  };

  if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    await getCsrfToken();
  }

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (response.status === 419) {
    console.error('CSRF token mismatch, intentando obtener nuevo token...');
    await getCsrfToken();
    return fetch(url, { ...defaultOptions, ...options });
  }

  return response;
};

export const getBalance = async (token) => {
  try {
    const response = await api.get('/balance', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getBalance:', error.response?.data || error.message);
    throw error;
  }
};

export const getLastMovements = async (token, page = 1) => {
  try {
    const response = await api.get(`/movements?page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error en getLastMovements:', error.response?.data || error.message);
    throw error;
  }
};

export const getExpenseTypes = async (token) => {
  try {
    const response = await api.get('/expense-types', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getExpenseTypes:', error.response?.data || error.message);
    throw error;
  }
};

export const createExpense = async (token, expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en createExpense:', error.response?.data || error.message);
    throw error;
  }
};

export const getMonthlyExpensesSummary = async (token, date) => {
  try {
    const response = await api.get(`/expenses/monthly-summary?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getMonthlyExpensesSummary:', error.response?.data || error.message);
    throw error;
  }
};

export const getExpensesByType = async (token, typeId, date, isSeasonView = false, page = 1, signal = null) => {
  try {
    const response = await api.get(`/expenses/by-type/${typeId}`, {
      params: { date, isSeasonView, page },
      headers: { 'Authorization': `Bearer ${token}` },
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
    console.error('Error en getExpensesByType:', error.response?.data || error.message);
    throw error;
  }
};

export const getSeasonExpensesSummary = async (token) => {
  try {
    const response = await api.get('/expenses/season-summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getSeasonExpensesSummary:', error.response?.data || error.message);
    throw error;
  }
};

export const resetSeason = async (token) => {
  try {
    const response = await api.post('/expenses/reset-season', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en resetSeason:', error.response?.data || error.message);
    throw error;
  }
};

export const addToBanco = async (token, data) => {
  try {
    const response = await api.post('/balance/add-to-banco', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en addToBanco:', error.response?.data || error.message);
    throw error;
  }
};

export const addToCajon = async (token, data) => {
  try {
    const response = await api.post('/balance/add-to-cajon', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en addToCajon:', error.response?.data || error.message);
    throw error;
  }
};

export const getIncomeDetails = async (token, date, isSeasonView = false) => {
  try {
    const endpoint = isSeasonView 
      ? '/movements/ingresos/temporada'
      : `/movements/ingresos/mes/${date}`;
    
    const response = await api.get(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getIncomeDetails:', error.response?.data || error.message);
    throw error;
  }
};

export const getTransfers = async (token) => {
  try {
    const response = await api.get('/transfers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getTransfers:', error.response?.data || error.message);
    throw error;
  }
};

export const createTransfer = async (token, transferData) => {
  try {
    const response = await api.post('/transfers', transferData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en createTransfer:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteTransfer = async (token, transferId) => {
  try {
    const response = await api.delete(`/transfers/${transferId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en deleteTransfer:', error.response?.data || error.message);
    throw error;
  }
};

export const transferMoney = async (token, transferData) => {
  try {
    const response = await api.post('/transfers', transferData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error en transferMoney:', error.response?.data || error.message);
    throw error;
  }
};