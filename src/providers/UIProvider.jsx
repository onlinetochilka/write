import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { AlertModal } from '../components/ui/AlertModal';
import { Toast } from '../components/ui/Toast';
import { TooltipProvider } from '../components/ui/Tooltip';

const UIContext = createContext(null);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

export function UIProvider({ children }) {
  const [confirmState, setConfirmState] = useState({ isOpen: false });
  const [alertState, setAlertState] = useState({ isOpen: false });
  const [toastState, setToastState] = useState({ isVisible: false });

  const showConfirm = useCallback((options) => {
    setConfirmState({
      isOpen: true,
      ...options
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback((options) => {
    // Can pass a string directly or an options object
    if (typeof options === 'string') {
      setAlertState({
        isOpen: true,
        message: options,
        type: 'info'
      });
    } else {
      setAlertState({
        isOpen: true,
        ...options
      });
    }
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showToast = useCallback((message, onUndo) => {
    setToastState({
      isVisible: true,
      message,
      onUndo
    });
  }, []);

  const closeToast = useCallback(() => {
    setToastState(prev => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <UIContext.Provider value={{ showConfirm, showAlert, showToast }}>
      <TooltipProvider>
        {children}
      </TooltipProvider>

      {/* Global Modals & Toasts */}
      <ConfirmModal 
        {...confirmState}
        onClose={closeConfirm}
      />
      
      <AlertModal
        {...alertState}
        onClose={closeAlert}
      />

      {toastState.isVisible && (
        <Toast
          message={toastState.message}
          onUndo={toastState.onUndo}
          onClose={closeToast}
        />
      )}
    </UIContext.Provider>
  );
}
