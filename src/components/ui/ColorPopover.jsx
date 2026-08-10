import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from './Tooltip';

const COLORS = [
  '#0F172A', '#C62828', '#2E7D32', '#1565C0', '#6A1B9A',
  '#475569', '#EF4444', '#22C55E', '#3B82F6', '#A855F7',
  '#F1F5F9', '#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8'
];

export function ColorPopover({ 
  icon: Icon, 
  tooltip, 
  onSelect, 
  onClear,
  currentColor, 
  clearLabel = 'Сбросить' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <Tooltip content={tooltip} side="top">
        <button
          ref={buttonRef}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
            isOpen ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <Icon size={14} strokeWidth={2} />
          {currentColor && currentColor !== 'transparent' && (
            <div 
              className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </button>
      </Tooltip>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute z-50 top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-lg border border-stone-200/50 flex flex-col gap-2 w-[140px]"
        >
          <div className="grid grid-cols-5 gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(c);
                  setIsOpen(false);
                }}
                className="w-5 h-5 rounded-full ring-2 ring-offset-1 transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: c,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  '--tw-ring-color': currentColor === c ? '#0EA5E9' : 'transparent'
                }}
              />
            ))}
          </div>
          
          <div className="h-px bg-stone-100 w-full" />
          
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onClear();
              setIsOpen(false);
            }}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 w-full text-left px-1 py-0.5 rounded hover:bg-stone-50 transition-colors"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </div>
  );
}
