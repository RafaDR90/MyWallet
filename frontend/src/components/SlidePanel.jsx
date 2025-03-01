import { useEffect, useState } from 'react';
import DepositForm from './DepositForm';
import React from 'react';

export default function SlidePanel({ isOpen, onClose, children, title }) {
  const [refreshCount, setRefreshCount] = useState(0);

  const handleRefresh = () => {
    setRefreshCount(prev => {
      return prev + 1;
    });
  };

  // Prevenir scroll cuando el panel está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Clonar los children y pasar el prop refresh
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        refresh: refreshCount,
        onRefresh: handleRefresh
      });
    }
    return child;
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Panel deslizante */}
      <div 
        className={`fixed inset-4 md:inset-8 w-auto max-w-[90%] h-auto bg-dark-surface z-50 shadow-lg transform transition-transform duration-300 ease-in-out rounded-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-[150%]'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-dark-text/10">
          <h2 className="text-lg font-semibold text-dark-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-text/10 rounded-full transition-colors"
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 h-[calc(100%-64px)] overflow-y-auto">
          {childrenWithProps}
        </div>
      </div>
    </>
  );
} 