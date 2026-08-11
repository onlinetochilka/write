import React, { useState } from 'react';
import { trackGoal } from '../../utils/analytics';
import { useAuth } from '../../providers/AuthProvider';
import { ProBadge } from '../ProBadge';
import UpgradeModal from '../UpgradeModal';

const PRO_FORMATS = new Set(['a5', 'notebook']);
const PRO_ORIENTATIONS = new Set(['landscape']);

const PageSettings = ({ format, orientation, margin, layout, mirrorMargins, updateState }) => {
  const auth = useAuth();
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' });

  const isLocked = (value, proSet) => !auth.isPro && !auth.isDemo && proSet.has(value);

  const handleClick = (key, value, label, proSet) => {
    if (isLocked(value, proSet)) {
      setUpgradeModal({ open: true, feature: label });
      return;
    }
    updateState({ [key]: value });
  };

  const formatBtn = (id, label) => {
    const active = format === id;
    const locked = isLocked(id, PRO_FORMATS);
    return (
      <button 
        className={`relative h-9 rounded-lg text-xs transition-all ${
          active ? 'bg-amber-50 text-amber-700 font-medium shadow-sm ring-1 ring-amber-500/30' 
          : locked ? 'bg-stone-50 text-stone-400 ring-1 ring-stone-200 cursor-pointer' 
          : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'
        }`} 
        onClick={() => handleClick('format', id, label, PRO_FORMATS)}
      >
        {label}
        {locked && <ProBadge variant="overlay" />}
      </button>
    );
  };

  const orientBtn = (id, label, icon) => {
    const active = orientation === id;
    const locked = isLocked(id, PRO_ORIENTATIONS);
    return (
      <button 
        className={`relative flex items-center justify-center gap-1 h-9 rounded-lg text-xs transition-all ${
          active ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm ring-1 ring-emerald-500/30' 
          : locked ? 'bg-stone-50 text-stone-400 ring-1 ring-stone-200 cursor-pointer' 
          : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'
        }`} 
        onClick={() => handleClick('orientation', id, label, PRO_ORIENTATIONS)}
      >
        {icon} {label}
        {locked && <ProBadge variant="overlay" />}
      </button>
    );
  };

  const handle2Pages = () => {
    if (!auth.isPro && !auth.isDemo) {
      setUpgradeModal({ open: true, feature: '2 листа рядом' });
      return;
    }
    trackGoal('layout_2pages');
    updateState({ layout: '2-pages' });
  };

  return (
    <div className="space-y-3">
      {/* Формат бумаги */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Формат бумаги</div>
        <div className="grid grid-cols-3 gap-1.5">
          {formatBtn('a4', 'A4')}
          {formatBtn('a5', 'A5')}
          {formatBtn('notebook', 'Тетрадь')}
        </div>
      </div>

      {/* Ориентация */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Ориентация</div>
        <div className="grid grid-cols-2 gap-1.5">
          {orientBtn('portrait', 'Книжная', 
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
          )}
          {orientBtn('landscape', 'Альбомная',
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
          )}
        </div>
      </div>

      {/* Поля — all Free */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Поля</div>
        <div className="grid grid-cols-3 gap-1.5">
          <button className={`h-9 rounded-lg text-xs transition-all ${margin === 'left' ? 'bg-rose-50 text-rose-700 font-medium shadow-sm ring-1 ring-rose-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ margin: 'left' })}>Слева</button>
          <button className={`h-9 rounded-lg text-xs transition-all ${margin === 'none' ? 'bg-rose-50 text-rose-700 font-medium shadow-sm ring-1 ring-rose-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ margin: 'none' })}>Нет</button>
          <button className={`h-9 rounded-lg text-xs transition-all ${margin === 'right' ? 'bg-rose-50 text-rose-700 font-medium shadow-sm ring-1 ring-rose-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ margin: 'right' })}>Справа</button>
        </div>
      </div>

      {/* Размещение */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Размещение</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button 
            className={`h-9 px-4 rounded-xl text-xs transition-all ${layout === '1-page' ? 'bg-sky-50 text-sky-700 font-medium shadow-sm ring-1 ring-sky-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`}
            onClick={() => updateState({ layout: '1-page' })}
          >
            1 лист
          </button>
          <button 
            className={`relative h-9 px-4 rounded-xl text-xs transition-all ${
              layout === '2-pages' ? 'bg-sky-50 text-sky-700 font-medium shadow-sm ring-1 ring-sky-500/30' 
              : !auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400 ring-1 ring-stone-200 cursor-pointer'
              : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
            onClick={handle2Pages}
          >
            2 листа рядом
            {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
          </button>
        </div>
        
        {layout === '2-pages' && (
          <label className="flex items-center gap-2 mt-2 text-xs text-stone-600 cursor-pointer">
            <input type="checkbox" checked={mirrorMargins} onChange={(e) => updateState({ mirrorMargins: e.target.checked })} />
            Зеркальные поля
          </label>
        )}
      </div>

      <UpgradeModal 
        isOpen={upgradeModal.open} 
        onClose={() => setUpgradeModal({ open: false, feature: '' })} 
        featureName={upgradeModal.feature} 
      />
    </div>
  );
};

export default PageSettings;
