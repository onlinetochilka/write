import React, { useState } from 'react';
import { trackGoal } from '../../utils/analytics';
import { useAuth } from '../../providers/AuthProvider';
import { ProBadge } from '../ProBadge';
import UpgradeModal from '../UpgradeModal';

// Маппинг grid ID → Pro-only
const PRO_GRIDS = new Set(['frequent', 'slanted']);

const GridOptions = ({ grid, mathMode, updateState }) => {
  const auth = useAuth();
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' });

  const handleGridClick = (gridId, label) => {
    if (!auth.isPro && !auth.isDemo && PRO_GRIDS.has(gridId)) {
      setUpgradeModal({ open: true, feature: label });
      return;
    }
    updateState({ grid: gridId });
  };

  const handleMathModeToggle = (e) => {
    if (!auth.isPro && !auth.isDemo) {
      e.preventDefault();
      setUpgradeModal({ open: true, feature: 'Мат. режим «1 символ = 1 клетка»' });
      return;
    }
    trackGoal('math_mode_toggled');
    updateState({ mathMode: e.target.checked });
  };

  const gridButton = (gridId, label, sublabel = null) => {
    const isActive = grid === gridId;
    const isLocked = !auth.isPro && !auth.isDemo && PRO_GRIDS.has(gridId);
    
    return (
      <button 
        className={`relative flex ${sublabel ? 'flex-col' : ''} items-center justify-center h-11 px-2 rounded-xl text-xs ${sublabel ? 'leading-tight' : ''} transition-all ${
          isActive 
            ? 'bg-violet-50 text-violet-700 font-medium shadow-sm ring-1 ring-violet-500/30' 
            : isLocked 
              ? 'bg-stone-50 text-stone-400 ring-1 ring-stone-200 cursor-pointer' 
              : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'
        }`}
        onClick={() => handleGridClick(gridId, label)}
      >
        {sublabel ? (
          <>{label}<br/><span className={`text-[10px] font-normal ${isActive ? 'text-violet-600/70' : 'opacity-80'}`}>{sublabel}</span></>
        ) : label}
        {isLocked && <ProBadge variant="overlay" />}
      </button>
    );
  };

  return (
    <section>
      <div className="flex justify-between items-center text-sm font-medium text-stone-700 mb-2">
        Разлиновка
        {grid === 'squared' ? (
          <label className="flex items-center gap-2 text-xs font-normal text-stone-600 cursor-pointer relative">
            <input 
              type="checkbox" 
              checked={mathMode} 
              onChange={handleMathModeToggle} 
              className="rounded text-brand-blue focus:ring-brand-blue w-3 h-3" 
            />
            1 символ = 1 клетка
            {!auth.isPro && !auth.isDemo && <ProBadge />}
          </label>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {gridButton('frequent', 'Частая косая', '(1 класс)')}
        {gridButton('slanted', 'Редкая косая')}
        {gridButton('narrow', 'Узкая линия')}
        {gridButton('wide', 'Широкая линия')}
        {gridButton('squared', 'Клетка')}
        {gridButton('none', 'Просто лист')}
      </div>

      <UpgradeModal 
        isOpen={upgradeModal.open} 
        onClose={() => setUpgradeModal({ open: false, feature: '' })} 
        featureName={upgradeModal.feature} 
      />
    </section>
  );
};

export default GridOptions;
