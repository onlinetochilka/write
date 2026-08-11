import React from 'react';
import { Tooltip } from './ui/Tooltip';

/**
 * ProBadge — маленький бейдж «Pro» рядом с заблокированными фичами.
 * 
 * Два варианта:
 *  - inline: маленький тег внутри кнопки/лейбла
 *  - overlay: абсолютно позиционированный в углу элемента
 */
export function ProBadge({ variant = 'inline', className = '' }) {
  if (variant === 'overlay') {
    return (
      <Tooltip content="Доступно в Pro-подписке" side="top">
        <span className={`absolute -top-1 -right-1 z-10 bg-gradient-to-r from-[#006584] to-[#0082a8] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm ${className}`}>
          Pro
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content="Доступно в Pro-подписке" side="top">
      <span className={`inline-flex items-center bg-gradient-to-r from-[#006584] to-[#0082a8] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ml-1.5 ${className}`}>
        Pro
      </span>
    </Tooltip>
  );
}

/**
 * ProLock — обёртка, которая делает элемент «заблокированным».
 * При клике вызывает onUpgrade вместо обычного действия.
 * Визуально добавляет полупрозрачность и бейдж Pro.
 */
export function ProLock({ locked, onUpgrade, children, badge = 'inline', className = '' }) {
  if (!locked) return children;

  return (
    <div 
      className={`relative cursor-pointer group ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onUpgrade?.();
      }}
    >
      <div className="opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity">
        {children}
      </div>
      <ProBadge variant={badge === 'overlay' ? 'overlay' : 'inline'} />
    </div>
  );
}

export default ProBadge;
