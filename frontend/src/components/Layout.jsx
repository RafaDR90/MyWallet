import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { getBalance } from '../services/api'
import SlidePanel from './SlidePanel'
import ExpenseForm from './ExpenseForm'
import History from './History'
import Home from '../pages/Home'
import DepositForm from './DepositForm'
import TransferForm from './TransferForm'

export function Layout() {
  const { token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [refreshMovements, setRefreshMovements] = useState(0);
  const [isDepositPanelOpen, setIsDepositPanelOpen] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferFormKey, setTransferFormKey] = useState(0);
  const [expenseFormKey, setExpenseFormKey] = useState(0);
  const [depositFormKey, setDepositFormKey] = useState(0);

  const loadBalanceData = async () => {
    if (!isAuthenticated || !token) return; // No cargar si no hay autenticación
    
    try {
      const data = await getBalance(token);
      const processedBalance = {
        ...data,
        banco: parseFloat(data.banco),
        cajon: parseFloat(data.cajon)
      };
      setBalance(processedBalance);
      setError(null);
    } catch (error) {
      console.error('Error cargando balance:', error);
      if (error.response?.status === 401) {
        logout(); // Cerrar sesión si el token no es válido
      } else {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    loadBalanceData();
  }, [isAuthenticated, token, logout]);

  const formatBalance = (value) => {
    if (!value) return '0.00';
    // Convertir string a número y formatear
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  const getBalanceColor = (value) => {
    const numValue = parseFloat(value || 0);
    return numValue < 0 ? 'text-red-500' : 'text-dark-text';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePanelOpen = (panelType) => {
    if (panelType === 'transfer') {
      setTransferFormKey(prev => prev + 1);
    } else if (panelType === 'expense') {
      setExpenseFormKey(prev => prev + 1);
    }
    setCurrentPanel(panelType);
    setIsPanelOpen(true);
  };

  const getPanelTitle = () => {
    switch (currentPanel) {
      case 'transfer': return 'Transferir';
      case 'deposit': return 'Ingresar';
      case 'history': return 'Historial';
      case 'expense': return 'Nuevo Gasto';
      default: return '';
    }
  };

  const handleRefresh = () => {
    setRefreshMovements(prev => {
      const newValue = prev + 1;
      return newValue;
    });
  };

  const getPanelContent = () => {
    switch (currentPanel) {
      case 'transfer':
        return (
          <TransferForm 
            key={`transfer-form-${transferFormKey}`}
            onClose={() => setIsPanelOpen(false)}
            onSuccess={() => {
              setIsPanelOpen(false);
              loadBalanceData();
              handleRefresh();
            }}
          />
        );
      case 'deposit':
        return <div key="deposit-content">Contenido de Ingresar</div>;
      case 'history':
        return (
          <History 
            key={`history-${refreshMovements}`}
            refresh={refreshMovements} 
          />
        );
      case 'expense':
        return (
          <ExpenseForm 
            key={`expense-form-${expenseFormKey}`}
            onClose={() => setIsPanelOpen(false)} 
            onSuccess={() => {
              setIsPanelOpen(false);
              loadBalanceData();
              handleRefresh();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* Header - Siempre visible */}
      <nav className="fixed top-0 left-0 right-0 bg-dark-surface shadow-lg z-10">
        <div className="px-4 max-w-2xl mx-auto">
          <div className="h-14 grid grid-cols-3 items-center">
            <div className="flex items-center">
              <span className="text-lg brand-text text-dark-primary font-bold">
                MyWallet
              </span>
            </div>
            <div className="flex justify-center space-x-3">
            </div>
            <div className="flex justify-end">
              {isAuthenticated && (
                <button 
                  className="p-2 text-dark-error hover:opacity-80 transition-opacity"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="pt-16 pb-24 px-4 max-w-2xl mx-auto">
        {isAuthenticated ? (
          <div className="flex flex-col gap-4">
            {/* Panel de Balance */}
            <div className="w-full">
              <div className="bg-dark-surface rounded-lg shadow-lg p-5">
                <h2 className="text-lg font-semibold mb-4 text-dark-primary">Balance</h2>
                {balance ? (
                  <div className="space-y-4 flex justify-center gap-4">
                    <div className="p-4 bg-dark-bg/30 rounded-lg">
                      <p className="text-sm text-dark-primary mb-1">Banco</p>
                      <p className={`text-2xl font-bold ${balance.banco < 0 ? 'text-dark-error' : 'text-dark-text'}`}>
                        €{balance.banco.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-bg/30 rounded-lg">
                      <p className="text-sm text-dark-primary mb-1">Cajón</p>
                      <p className={`text-2xl font-bold ${balance.cajon < 0 ? 'text-dark-error' : 'text-dark-text'}`}>
                        €{balance.cajon.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">Cargando...</div>
                )}
              </div>
            </div>

            <Home refresh={refreshMovements} />
          </div>
        ) : (
          <>
            <div className="text-center pt-12 pb-8">
              <h1 className="text-3xl font-bold text-dark-primary mb-3">
                Bienvenido a MyWallet
              </h1>
              <p className="text-dark-text/70 text-lg">
                Tu gestor personal de finanzas
              </p>
              <p className="text-dark-text/60 text-sm mt-2">
                La forma más sencilla de gestionar tus gastos
              </p>
            </div>
            <Outlet />
          </>
        )}
      </main>

      {/* Barra de acciones inferior */}
      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-surface shadow-lg border-t border-dark-text/10">
          <div className="max-w-2xl mx-auto px-2">
            <div className="flex justify-between py-2">
              <button 
                onClick={() => handlePanelOpen('transfer')}
                className="flex-1 py-2 px-2 text-dark-text hover:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] active:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] transition-shadow text-sm flex flex-col items-center gap-1 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Transferir</span>
              </button>
              <button 
                onClick={() => {
                  setDepositFormKey(prev => prev + 1);
                  setIsDepositPanelOpen(true);
                }}
                className="flex-1 py-2 px-2 text-dark-success hover:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] active:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] transition-shadow text-sm flex flex-col items-center gap-1 rounded-lg"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <g>
                    <path d="M432.891,288.344c-5.469,3.219-11.828,5.125-18.641,5.125h-59.375c-20.266,0-36.766-16.5-36.766-36.781 c0-5.672,1.328-11.172,3.766-16.109c-2.438-4.938-3.766-10.438-3.766-16.125c0-5.672,1.328-11.172,3.766-16.109 c-2.438-4.938-3.766-10.438-3.766-16.109c0-5.688,1.328-11.188,3.766-16.125c-2.422-4.938-3.766-10.438-3.766-16.125 c0-3.969,0.641-7.781,1.813-11.359h-36.75c-1.703,18.797-7.984,47.141-28.594,71.813c-22.453,26.844-55.891,42.531-99.313,46.813 c-14.125,27.375-24.203,56.891-24.203,86.625c0,87.328,70.797,158.125,158.109,158.125c87.328,0,158.125-70.797,158.125-158.125 C447.297,331.625,441.625,309.531,432.891,288.344z M322.828,346.844l-3.641-1.516c-5.969-2.531-12.188-3.797-18.469-3.797 c-18.188,0-34.891,10.531-42.891,26.688h60.609l-3.734,18.094h-61.797c-0.078,1.031-0.125,2.078-0.125,3.125 c0,2.594,0.219,5.219,0.672,7.875h59.016l-3.719,18.094H260.5c8.797,13.688,23.766,21.969,40.219,21.969 c5.563,0,11.156-1.016,16.609-3.063l4.328-1.609v25.484l-2.375,0.625c-6.109,1.656-12.344,2.484-18.563,2.484 c-29.594,0-56.219-18.344-66.922-45.891H218.5v-18.094h10.844c-0.328-2.781-0.484-5.359-0.484-7.875 c0-1.031,0.031-2.094,0.078-3.125H218.5v-18.094h13.641c9.281-29.938,37.125-50.625,68.578-50.625 c8.344,0,16.547,1.469,24.391,4.328l2.609,0.953L322.828,346.844z"/>
                    <path d="M335.859,68.875c0,0,4.656-12.469,29.734-28.297c24.063-15.172,5.594-36.141-29.734-28.422 C311.469,17.469,319.75,0,285.547,0s-25.922,17.469-50.313,12.156c-35.328-7.719-53.797,13.25-29.734,28.422 c25.078,15.828,29.734,28.297,29.734,28.297H335.859z"/>
                    <path d="M432.063,224.453c0-7.141-4.234-13.281-10.328-16.109c6.094-2.844,10.344-8.969,10.344-16.109 c0-7.156-4.25-13.297-10.344-16.125c6.078-2.828,10.328-8.953,10.328-16.125c0-9.828-7.969-17.797-17.813-17.797h-59.375 c-9.828,0-17.813,7.969-17.813,17.797c0,7.172,4.25,13.297,10.344,16.125c-6.094,2.828-10.344,8.969-10.344,16.125 c0,7.141,4.25,13.266,10.344,16.109c-6.094,2.828-10.344,8.969-10.344,16.109c0,7.156,4.25,13.297,10.344,16.109 c-6.094,2.844-10.344,8.969-10.344,16.125c0,9.844,7.984,17.813,17.813,17.813h59.375c9.828,0,17.813-7.969,17.813-17.813 c0-7.156-4.25-13.281-10.328-16.109C427.813,237.75,432.063,231.609,432.063,224.453z"/>
                    <path d="M346.203,89.641c-20,0-113.25,0-113.25,0c-48.969,0-62.656,38.328-100.578,38.328v121.641l16.578-0.766 c126.688-9.813,115.625-119.188,115.625-119.188s31.063,0,71.094,0C375.688,129.656,377.797,89.641,346.203,89.641z"/>
                    <rect x="64.703" y="113.75" width="50.563" height="164.281"/>
                  </g>
                </svg>
                <span>Nuevo Ingreso</span>
              </button>
              <button 
                onClick={() => handlePanelOpen('history')}
                className="flex-1 py-2 px-2 text-dark-text hover:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] active:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] transition-shadow text-sm flex flex-col items-center gap-1 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Historial</span>
              </button>
              <button 
                onClick={() => handlePanelOpen('expense')}
                className="flex-1 py-2 px-2 text-dark-error hover:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] active:[box-shadow:inset_-8px_0_5px_-6px_rgba(255,255,255,0.1),inset_8px_0_5px_-6px_rgba(255,255,255,0.1)] transition-shadow text-sm flex flex-col items-center gap-1 rounded-lg"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 481.8 481.8"
                  fill="currentColor"
                >
                  <path d="M384.759,213.6c-4.7-3.7-46.2-49.4-69.7-70.7c-0.1-0.1-0.1-0.1-0.1-0.2V44.3c0-24.4-19.9-44.3-44.3-44.3h-145.1 c-22.7,0-41.2,18.6-41.2,41.2V272c0,24.4,19.9,44.3,44.3,44.3h42.2h10.7c1.8,0,3.3-1.6,3.1-3.4l-2.3-19.6 c-0.2-1.6-1.5-2.7-3.1-2.7h-3.9h-2.4c-1.7,0-3.1-1.4-3.1-3.1V25.3c0-1.7,1.4-3.1,3.1-3.1h98c9.9,0,18,8.1,18,18v214.2v21.1 c0,6.8-4.7,12.6-11,14.4c-0.1,0-0.1,0-0.2,0c-10.7-5.8-23.3-30.6-25.2-34.5c-0.2-0.3-0.3-0.7-0.3-1c-0.7-6.3-7.8-67.3-40.3-67.3 c-0.9,0-1.8,0-2.7,0.1c0,0-26,2.2-4.5,76.3c0,0.2,0.1,0.3,0.1,0.5l9.5,82.1c0,0.1,0,0.2,0.1,0.4c0.8,3.1,11.6,45,39.5,74.7 c0.5,0.6,0.8,1.3,0.8,2.1v7.1c0,0.2-0.1,0.3-0.3,0.3h-2.5c-6.1,0-11.1,5-11.1,11.1v28.9c0,6.1,5,11.1,11.1,11.1h117.7 c6.1,0,11.1-5,11.1-11.1V442c0-6.1-5-11.1-11.1-11.1c-0.2,0-0.3-0.1-0.3-0.3c3.9-36.2,17.9-160,25.4-169.7c0.2-0.3,0.4-0.6,0.5-1 C396.559,255.4,403.059,227.9,384.759,213.6z M130.659,287.7c0,1.6-1.3,2.8-2.8,2.8c-9.8,0-17.8-8-17.8-17.8V40 c0-9.8,8-17.8,17.8-17.8c1.6,0,2.8,1.3,2.8,2.8V287.7z"/>
                </svg>
                <span>Nuevo Gasto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel deslizante para el formulario de depósito */}
      <SlidePanel 
        isOpen={isDepositPanelOpen} 
        onClose={() => setIsDepositPanelOpen(false)}
        title="Ingresar Dinero"
      >
        <DepositForm 
          key={`deposit-form-${depositFormKey}`}
          onSuccess={() => {
            setIsDepositPanelOpen(false);
            handleRefresh();
            loadBalanceData();
          }}
          onClose={() => setIsDepositPanelOpen(false)}
          refreshBalance={loadBalanceData}
        />
      </SlidePanel>

      {/* Panel deslizante */}
      <SlidePanel 
        key={`slide-panel-${currentPanel}`}
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        title={getPanelTitle()}
      >
        {getPanelContent()}
      </SlidePanel>
    </div>
  )
}

export default Layout;