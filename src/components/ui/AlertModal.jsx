import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export function AlertModal({ isOpen, onClose, title, message, type = 'info', confirmText = 'ОК' }) {
  const icons = {
    info: <Info className="w-6 h-6 text-blue-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    error: <AlertCircle className="w-6 h-6 text-red-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-green-600" />
  };

  const bgColors = {
    info: 'bg-blue-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
    success: 'bg-green-100'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-12 h-12 rounded-full ${bgColors[type]} flex items-center justify-center`}>
          {icons[type]}
        </div>
        
        <div>
          {title && <h3 className="text-lg font-semibold text-stone-900">{title}</h3>}
          <p className="mt-2 text-sm text-stone-600 whitespace-pre-wrap">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-[#005270] transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
