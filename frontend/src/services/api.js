const API_URL = 'http://localhost:8000/api';

export const getBalance = async (token) => {
  try {
    const response = await fetch(`${API_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Error al obtener el balance');
    
    return await response.json();
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

export const getExpensesByType = async (token, typeId, date, isSeasonView = false, page = 1) => {
  try {
    const response = await fetch(
      `${API_URL}/expenses/by-type/${typeId}?date=${date}&isSeasonView=${isSeasonView}&page=${page}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener los gastos');
    }
    
    return await response.json();
  } catch (error) {
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
    const response = await fetch(`${API_URL}/balance/add-to-banco`, {
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

    console.log('Calling endpoint:', endpoint); // Debug log

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
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: text
      });
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
    console.log('Enviando datos de transferencia:', transferData); // Debug

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
      console.log('Error response:', errorData); // Debug
      throw new Error(errorData.message || 'Error al realizar la transferencia');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en transferMoney:', error);
    throw error;
  }
};