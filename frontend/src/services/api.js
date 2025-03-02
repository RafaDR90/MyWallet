const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL.replace('/api', ''); // https://web-production-c510.up.railway.app

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
    const response = await fetchWithConfig(`${API_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error en getBalance:', error);
    throw error;
  }
};

export const getLastMovements = async (token, page = 1) => {
  try {
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const response = await fetch(`${API_URL}/movements?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada o inválida');
      }
      throw new Error('Error al obtener los movimientos');
    }
    
    const data = await response.json();
    return data.data; // Laravel pagination incluye los datos en data
  } catch (error) {
    console.error('Error en getLastMovements:', error);
    throw error;
  }
};

export const getExpenseTypes = async (token) => {
  try {
    const response = await fetch(`${API_URL}/expense-types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
    
    if (!response.ok) throw new Error('Error al obtener los tipos de gasto');
    
    return await response.json();
  } catch (error) {
    console.error('Error en getExpenseTypes:', error);
    throw error;
  }
};

export const createExpense = async (token, expenseData) => {
  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(expenseData)
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
    
    if (!response.ok) throw new Error('Error al crear el gasto');
    
    return await response.json();
  } catch (error) {
    console.error('Error en createExpense:', error);
    throw error;
  }
};

export const getMonthlyExpensesSummary = async (token, date) => {
  try {
    const response = await fetch(`${API_URL}/expenses/monthly-summary?date=${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener el resumen mensual');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getMonthlyExpensesSummary:', error);
    throw error;
  }
};

export const getExpensesByType = async (token, typeId, date, isSeasonView = false, page = 1, signal = null) => {
  try {
    const response = await fetch(
      `${API_URL}/expenses/by-type/${typeId}?date=${date}&isSeasonView=${isSeasonView}&page=${page}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal,
      }
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener los gastos');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Error en getExpensesByType:', error);
    throw error;
  }
};

export const getSeasonExpensesSummary = async (token) => {
  try {
    const response = await fetch(`${API_URL}/expenses/season-summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener el resumen de temporada');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getSeasonExpensesSummary:', error);
    throw error;
  }
};

export const resetSeason = async (token) => {
  try {
    const response = await fetch(`${API_URL}/expenses/reset-season`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error al reiniciar la temporada');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en resetSeason:', error);
    throw error;
  }
};

export const addToBanco = async (token, data) => {
  try {
    console.log('Iniciando addToBanco...'); // Debug
    console.log('URL:', `${API_URL}/balance/add-to-banco`); // Debug
    
    const response = await fetchWithConfig(`${API_URL}/balance/add-to-banco`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cantidad: data.cantidad,
        descripcion: data.descripcion,
        tipo: data.tipo
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText); // Debug
      throw new Error(`Error al procesar el ingreso: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en addToBanco:', error);
    throw error;
  }
};

export const addToCajon = async (token, data) => {
  try {
    const response = await fetch(`${API_URL}/balance/add-to-cajon`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Error al procesar el ingreso');
    
    return await response.json();
  } catch (error) {
    console.error('Error en addToCajon:', error);
    throw error;
  }
};

export const getIncomeDetails = async (token, date, isSeasonView = false) => {
  try {
    const endpoint = isSeasonView 
      ? `${API_URL}/movements/ingresos/temporada`
      : `${API_URL}/movements/ingresos/mes/${date}`;


    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text(); // Debug: ver el contenido real de la respuesta
      throw new Error('Error al obtener los ingresos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getIncomeDetails:', error);
    throw error;
  }
};

export const getTransfers = async (token) => {
  try {
    const response = await fetch(`${API_URL}/transfers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Error al obtener las transferencias');
    
    return await response.json();
  } catch (error) {
    console.error('Error en getTransfers:', error);
    throw error;
  }
};

export const createTransfer = async (token, transferData) => {
  try {
    const response = await fetch(`${API_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(transferData)
    });
    
    if (!response.ok) throw new Error('Error al realizar la transferencia');
    
    return await response.json();
  } catch (error) {
    console.error('Error en createTransfer:', error);
    throw error;
  }
};

export const deleteTransfer = async (token, transferId) => {
  try {
    const response = await fetch(`${API_URL}/transfers/${transferId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Error al eliminar la transferencia');
    
    return await response.json();
  } catch (error) {
    console.error('Error en deleteTransfer:', error);
    throw error;
  }
};

export const transferMoney = async (token, transferData) => {
  try {

    const response = await fetch(`${API_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(transferData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al realizar la transferencia');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en transferMoney:', error);
    throw error;
  }
};