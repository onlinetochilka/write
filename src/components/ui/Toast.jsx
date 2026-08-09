import React, { useEffect } from 'react';

export function Toast({ message, onUndo, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 text-white rounded-full py-3 px-6 text-sm flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-fade-in z-[200]">
      <span className="font-medium">{message}</span>
      {onUndo && (
        <>
          <div className="w-px h-4 bg-stone-700"></div>
          <button 
            onClick={() => {
              onUndo();
              onClose();
            }}
            className="text-brand-blue hover:text-blue-400 font-semibold transition-colors"
          >
            Отмена
          </button>
        </>
      )}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-brand-blue/50 rounded-full"
        style={{
          width: '100%',
          animation: `shrink ${duration}ms linear forwards`
        }}
      />
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
