import React from 'react';
import { Modal } from './Modal';
import { AlertCircle } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, title, message, bullets, confirmText = 'Подтвердить', cancelText = 'Отмена', onConfirm, isDanger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={isDanger ? 'sm:max-w-md' : 'sm:max-w-md'}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          {isDanger && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
            {message && <p className="mt-2 text-sm text-stone-600">{message}</p>}
            
            {bullets && bullets.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-stone-600 list-disc pl-5">
                {bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-brand-blue hover:bg-[#005270]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
