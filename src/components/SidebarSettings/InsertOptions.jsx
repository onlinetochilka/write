import React, { useState } from 'react';
import { useStore } from '../../Store';
import { useAuth } from '../../providers/AuthProvider';
import { ProBadge } from '../ProBadge';
import UpgradeModal from '../UpgradeModal';
import { Tooltip } from '../ui/Tooltip';

const InsertOptions = () => {
  const auth = useAuth();
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' });

  const PRO_SHAPES = new Set(['table', 'triangle', 'rectangle', 'coord_ray', 'coord_line', 'coord_plane', 'parallelogram', 'trapezoid', 'circle']);

  const handleAddShape = (type, label) => {
    if (!auth.isPro && !auth.isDemo && PRO_SHAPES.has(type)) {
      setUpgradeModal({ open: true, feature: label });
      return;
    }
    addShape(type);
  };

  const { state, updateState } = useStore(s => ({
    shapes: s.shapes,
    selectedShapeId: s.selectedShapeId
  }));
  const { shapes, selectedShapeId } = state;
  
  const selectedShape = shapes.find(s => s.id === selectedShapeId);

  const addShape = (type) => {
    // Generate simple ID
    const newId = 'shape_' + Math.random().toString(36).substr(2, 9);
    
    // Default properties based on type
    const newShape = {
      id: newId,
      type,
      x: 100,
      y: 100,
      width: type === 'text_box' ? 80 : 100,
      height: ['triangle', 'rectangle', 'parallelogram', 'trapezoid', 'circle', 'ellipse', 'image', 'coord_plane'].includes(type) ? 100 : (type === 'table' ? 60 : (type === 'text_box' ? 20 : 0)),
      rotation: 0,
      stroke: (type === 'image' || type === 'text_box') ? 'transparent' : '#10b981',
      strokeWidth: type === 'table' ? 0.3 : 0.2,
      fill: 'transparent'
    };

    if (type === 'text_box') {
      newShape.text = 'Текст';
      newShape.fontSize = 12;
      newShape.align = 'left';
      newShape.textColor = '#000000';
    } else if (type === 'table') {
      newShape.rows = 3;
      newShape.cols = 3;
    } else if (type === 'image') {
      newShape.preserveRatio = true;
      newShape.removeWhite = false;
      newShape.src = '';
    }
    
    updateState({ 
      shapes: [...shapes, newShape],
      selectedShapeId: newId
    });
  };

  const removeSelected = () => {
    updateState({
      shapes: shapes.filter(s => s.id !== selectedShapeId),
      selectedShapeId: null
    });
  };

  if (selectedShape) {
    return (
      <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Tooltip content="Назад к выбору фигур" side="bottom">
              <button
                className="p-1 -ml-1 text-stone-400 hover:text-stone-600 rounded hover:bg-stone-100 transition-colors"
                onClick={() => updateState({ selectedShapeId: null })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </Tooltip>
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Свойства: {
              {
                line: 'Прямая',
                segment: 'Отрезок',
                ray: 'Луч',
                coord_ray: 'Коорд. луч',
                coord_line: 'Коорд. прямая',
                coord_plane: 'Коорд. плоскость',
                dashed_segment: 'Пунктир',
                triangle: 'Треугольник',
                rectangle: 'Прямоугольник',
                circle: 'Окружность',
                ellipse: 'Эллипс',
                parallelogram: 'Параллелограмм',
                trapezoid: 'Трапеция',
                text_box: 'Текстовое поле',
                image: 'Картинка',
                table: 'Таблица'
              }[selectedShape.type] || 'Фигура'
            }
          </h2>
          </div>
          <button 
            className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs transition-colors"
            onClick={removeSelected}
          >
            Удалить
          </button>
        </div>

        {selectedShape.type !== 'image' && selectedShape.type !== 'text_box' && (
          <>
            <div className={`grid ${['line', 'segment', 'ray', 'coord_ray', 'coord_line', 'coord_plane', 'dashed_segment'].includes(selectedShape.type) ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div>
            <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Цвет контура</div>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={selectedShape.stroke !== 'transparent' ? selectedShape.stroke : '#000000'}
                className={`w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden ${selectedShape.stroke === 'transparent' ? 'opacity-30' : ''}`}
                onChange={(e) => {
                  const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, stroke: e.target.value } : s);
                  updateState({ shapes: updated });
                }}
              />
              {!['line', 'segment', 'ray', 'coord_ray', 'coord_line', 'coord_plane', 'dashed_segment'].includes(selectedShape.type) && (
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.stroke === 'transparent'}
                    onChange={(e) => {
                      const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, stroke: e.target.checked ? 'transparent' : '#000000' } : s);
                      updateState({ shapes: updated });
                    }}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Нет
                </label>
              )}
            </div>
          </div>

          {!['line', 'segment', 'ray', 'coord_ray', 'coord_line', 'coord_plane', 'dashed_segment'].includes(selectedShape.type) && (
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Заливка</div>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={selectedShape.fill !== 'transparent' ? selectedShape.fill : '#ffffff'}
                  className={`w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden ${selectedShape.fill === 'transparent' ? 'opacity-30' : ''}`}
                  onChange={(e) => {
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, fill: e.target.value } : s);
                    updateState({ shapes: updated });
                  }}
                />
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.fill === 'transparent'}
                    onChange={(e) => {
                      const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, fill: e.target.checked ? 'transparent' : '#10b981' } : s);
                      updateState({ shapes: updated });
                    }}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Прозр.
                </label>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-[10px] font-bold text-stone-500 uppercase">Толщина контура</div>
            <div className="text-[10px] font-mono text-stone-400">{selectedShape.strokeWidth?.toFixed(1) || '0.2'} мм</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full relative flex items-center h-6">
              <input 
                type="range" 
                min="0.1" 
                max="2.0" 
                step="0.1"
                value={selectedShape.strokeWidth || 0.2}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, strokeWidth: val } : s);
                  updateState({ shapes: updated });
                }}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
            </div>
          </div>
        </div>
        </>
        )}

        {selectedShape.type !== 'image' && selectedShape.type !== 'text_box' && selectedShape.type !== 'table' && (
          <div>
            <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Метки вершин</div>
            <input 
              type="text" 
              placeholder="Например: АБВ" 
              className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
              value={selectedShape.labels || ''}
              onChange={(e) => {
                const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, labels: e.target.value } : s);
                updateState({ shapes: updated });
              }}
            />
            <div className="text-[10px] text-stone-400 mt-1">
              Вершины подписываются по часовой стрелке.
            </div>
          </div>
        )}

        {selectedShape.type === 'image' && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Файл изображения</div>
              <input 
                type="file" 
                accept="image/png, image/jpeg"
                className="w-full text-xs text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      // Get image dimensions to set proportional height
                      const img = new Image();
                      img.onload = () => {
                        const ratio = img.height / img.width;
                        const w = selectedShape.width || 100;
                        updateState({ 
                          shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, src: event.target.result, height: w * ratio } : s) 
                        });
                      };
                      img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Ширина (мм)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.width)}
                  onChange={(e) => {
                    const w = parseFloat(e.target.value) || 10;
                    if (selectedShape.preserveRatio && selectedShape.width && selectedShape.height) {
                      const ratio = selectedShape.height / selectedShape.width;
                      updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, width: w, height: w * ratio } : s) });
                    } else {
                      updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, width: w } : s) });
                    }
                  }}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Высота (мм)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.height || 0)}
                  onChange={(e) => {
                    const h = parseFloat(e.target.value) || 10;
                    if (selectedShape.preserveRatio && selectedShape.width && selectedShape.height) {
                      const ratio = selectedShape.width / selectedShape.height;
                      updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, height: h, width: h * ratio } : s) });
                    } else {
                      updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, height: h } : s) });
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedShape.preserveRatio !== false}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, preserveRatio: e.target.checked } : s) })}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                />
                Сохранять пропорции
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedShape.removeWhite || false}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, removeWhite: e.target.checked } : s) })}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                />
                Убрать белый фон
              </label>
              {selectedShape.removeWhite && (
                <div className="text-[9px] text-stone-400 pl-6 leading-tight">
                  Делает прозрачным только чисто белый цвет. Идеально для графиков и формул. Не удаляет клетчатый фон "ложной прозрачности".
                </div>
              )}
            </div>
          </div>
        )}

        {selectedShape.type === 'table' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Строки</div>
                <input 
                  type="number" min="1" max="20"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={selectedShape.rows || 3}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, rows: parseInt(e.target.value) || 1 } : s) })}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Столбцы</div>
                <input 
                  type="number" min="1" max="20"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={selectedShape.cols || 3}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, cols: parseInt(e.target.value) || 1 } : s) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Цвет текста</div>
                <input 
                  type="color" 
                  value={selectedShape.textColor || '#000000'}
                  className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden"
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, textColor: e.target.value } : s) })}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Размер шрифта</div>
                <input 
                  type="number" min="5" max="72"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={selectedShape.fontSize || 12}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, fontSize: parseFloat(e.target.value) || 12 } : s) })}
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase">Выравнивание</div>
                <div className="flex bg-stone-100 rounded-lg p-1">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${(selectedShape.align || 'center') === align ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                      onClick={() => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, align } : s) })}
                    >
                      {align === 'left' ? 'Влево' : align === 'center' ? 'Центр' : 'Вправо'}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedShape.bold || false}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, bold: e.target.checked } : s) })}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                />
                Жирный текст
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Ширина (мм)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.width)}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, width: parseFloat(e.target.value) || 10 } : s) })}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Высота (мм)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.height || 0)}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, height: parseFloat(e.target.value) || 10 } : s) })}
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type === 'text_box' && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Текст</div>
              <textarea 
                className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none resize-none"
                rows="3"
                value={selectedShape.text || ''}
                onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, text: e.target.value } : s) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Цвет</div>
                <input 
                  type="color" 
                  value={selectedShape.textColor || '#000000'}
                  className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden"
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, textColor: e.target.value } : s) })}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Размер шрифта</div>
                <input 
                  type="number" min="5" max="72"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={selectedShape.fontSize || 12}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, fontSize: parseFloat(e.target.value) || 12 } : s) })}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase">Выравнивание</div>
              <div className="flex bg-stone-100 rounded-lg p-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${selectedShape.align === align ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    onClick={() => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, align } : s) })}
                  >
                    {align === 'left' ? 'Влево' : align === 'center' ? 'Центр' : 'Вправо'}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer mt-2">
                <input 
                  type="checkbox"
                  checked={selectedShape.bold || false}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, bold: e.target.checked } : s) })}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                />
                Жирный текст
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Ширина (мм)</div>
                <input 
                  type="number" min="10" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.width)}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, width: parseFloat(e.target.value) || 10 } : s) })}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Высота (мм)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.height || 0)}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, height: parseFloat(e.target.value) || 10 } : s) })}
                />
              </div>
            </div>
          </div>
        )}

        {selectedShape.type !== 'triangle' && selectedShape.type !== 'rectangle' && selectedShape.type !== 'parallelogram' && selectedShape.type !== 'trapezoid' && selectedShape.type !== 'circle' && selectedShape.type !== 'image' && selectedShape.type !== 'table' && selectedShape.type !== 'text_box' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Ширина (мм)</div>
              <input 
                type="number" 
                min="5" 
                max="200"
                className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                value={Math.round(selectedShape.width)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 10;
                  const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val } : s);
                  updateState({ shapes: updated });
                }}
              />
            </div>
            {selectedShape.type !== 'line' && selectedShape.type !== 'segment' && selectedShape.type !== 'ray' && selectedShape.type !== 'coord_ray' && selectedShape.type !== 'coord_line' && selectedShape.type !== 'dashed_segment' && (
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Высота (мм)</div>
                <input 
                  type="number" 
                  min="5" 
                  max="200"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.height || 0)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 10;
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: val } : s);
                    updateState({ shapes: updated });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {(selectedShape.type === 'coord_ray' || selectedShape.type === 'coord_line' || selectedShape.type === 'coord_plane') && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Режим разметки</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  className={`text-[10px] py-1.5 px-1 rounded border ${(selectedShape.scaleMode || 'fixed_size') === 'fixed_size' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                  onClick={() => {
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, scaleMode: 'fixed_size' } : s);
                    updateState({ shapes: updated });
                  }}
                >
                  Размер 1 ед.
                </button>
                <button
                  className={`text-[10px] py-1.5 px-1 rounded border ${selectedShape.scaleMode === 'fixed_count' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                  onClick={() => {
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, scaleMode: 'fixed_count' } : s);
                    updateState({ shapes: updated });
                  }}
                >
                  Макс. число
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(selectedShape.scaleMode || 'fixed_size') === 'fixed_size' ? (
                <div>
                  <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Ед. отрезок (мм)</div>
                  <input 
                    type="number" min="5" max="200"
                    className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                    value={selectedShape.unitSize || 10}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 10;
                      const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, unitSize: val } : s);
                      updateState({ shapes: updated });
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Макс. число</div>
                  <input 
                    type="number" min="1" max="100"
                    className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                    value={selectedShape.maxUnits || 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 5;
                      const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, maxUnits: val } : s);
                      updateState({ shapes: updated });
                    }}
                  />
                </div>
              )}
              
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Начало отсчета</div>
                <input 
                  type="number"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={selectedShape.startValue || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, startValue: val } : s);
                    updateState({ shapes: updated });
                  }}
                />
              </div>

              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Делений в 1 ед.</div>
                <input 
                  type="number" min="1" max="20"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={selectedShape.subdivisions || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, subdivisions: val } : s);
                    updateState({ shapes: updated });
                  }}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedShape.showTicks !== false}
                  onChange={(e) => {
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, showTicks: e.target.checked } : s);
                    updateState({ shapes: updated });
                  }}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                />
                Штрихи
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedShape.showNumbers !== false}
                  onChange={(e) => {
                    const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, showNumbers: e.target.checked } : s);
                    updateState({ shapes: updated });
                  }}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                />
                Цифры
              </label>
            </div>
          </div>
        )}

        {selectedShape.type === 'rectangle' && (
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Тип</div>
              <div className="grid grid-cols-2 gap-1">
                {['rectangle', 'square'].map(t => (
                  <button
                    key={t}
                    className={`text-[10px] py-1.5 px-1 rounded border ${(selectedShape.rectangleType || 'rectangle') === t ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                    onClick={() => {
                      const updated = shapes.map(s => {
                        if (s.id === selectedShape.id) {
                          let newHeight = s.height;
                          if (t === 'square') {
                            newHeight = s.width;
                          }
                          return { ...s, rectangleType: t, height: newHeight };
                        }
                        return s;
                      });
                      updateState({ shapes: updated });
                    }}
                  >
                    {t === 'rectangle' ? 'Прямоугольник' : 'Квадрат'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Стороны (мм)</div>
              
              {(selectedShape.rectangleType || 'rectangle') === 'rectangle' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Длина (a)</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.width)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Ширина (b)</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.height)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: val } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedShape.rectangleType === 'square' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Сторона (a)</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.width)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val, height: val } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedShape.type === 'triangle' && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Тип треугольника</div>
              <div className="grid grid-cols-3 gap-1">
                {['isosceles', 'equilateral', 'right'].map(t => (
                  <button
                    key={t}
                    className={`text-[9px] py-1.5 px-1 rounded border ${(selectedShape.triangleType || 'isosceles') === t ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                    onClick={() => {
                      const updated = shapes.map(s => {
                        if (s.id === selectedShape.id) {
                          let newWidth = s.width;
                          let newHeight = s.height;
                          
                          if (t === 'equilateral') {
                            newHeight = s.width * (Math.sqrt(3) / 2);
                          } else if (t === 'right') {
                            newWidth = Math.max(20, s.width);
                            newHeight = Math.max(20, s.height);
                          }
                          
                          return { ...s, triangleType: t, width: newWidth, height: newHeight };
                        }
                        return s;
                      });
                      updateState({ shapes: updated });
                    }}
                  >
                    {t === 'isosceles' ? 'Равнобедр.' : t === 'equilateral' ? 'Равностор.' : 'Прямоуг.'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Стороны (мм)</div>
              
              {(selectedShape.triangleType || 'isosceles') === 'isosceles' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Основание (a)</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.width)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Боковые (b, c)</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(Math.sqrt(Math.pow(selectedShape.width / 2, 2) + Math.pow(selectedShape.height, 2)))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const newH = Math.sqrt(Math.max(0, Math.pow(val, 2) - Math.pow(selectedShape.width / 2, 2)));
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: newH || s.height } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedShape.triangleType === 'equilateral' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Все стороны (a, b, c)</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.width)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const newH = val * (Math.sqrt(3) / 2);
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val, height: newH } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedShape.triangleType === 'right' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Катет 1</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.width)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Катет 2</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.height)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: val } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Гипот.</div>
                    <input 
                      type="number" min="5" max="200"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(Math.sqrt(Math.pow(selectedShape.width, 2) + Math.pow(selectedShape.height, 2)))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        const oldHyp = Math.sqrt(Math.pow(selectedShape.width, 2) + Math.pow(selectedShape.height, 2));
                        const ratio = val / oldHyp;
                        const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: s.width * ratio, height: s.height * ratio } : s);
                        updateState({ shapes: updated });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Углы (градусы)</div>
              
              {(selectedShape.triangleType || 'isosceles') === 'isosceles' && (() => {
                const baseAngle = Math.atan2(selectedShape.height, selectedShape.width / 2) * (180 / Math.PI);
                const topAngle = 180 - 2 * baseAngle;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1">Углы при осн.</div>
                      <input 
                        type="number" min="1" max="89"
                        className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                        value={Math.round(baseAngle)}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value) || 45;
                          if (val >= 90) val = 89;
                          if (val <= 0) val = 1;
                          const newH = (selectedShape.width / 2) * Math.tan(val * Math.PI / 180);
                          const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: newH } : s);
                          updateState({ shapes: updated });
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1">Угол при вершине</div>
                      <input 
                        type="number" min="1" max="179"
                        className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                        value={Math.round(topAngle)}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value) || 90;
                          if (val >= 180) val = 179;
                          if (val <= 0) val = 1;
                          const newBaseAngle = (180 - val) / 2;
                          const newH = (selectedShape.width / 2) * Math.tan(newBaseAngle * Math.PI / 180);
                          const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: newH } : s);
                          updateState({ shapes: updated });
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {selectedShape.triangleType === 'equilateral' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Все углы</div>
                    <input 
                      type="number" disabled
                      className="w-full text-sm p-2 border border-stone-200 rounded bg-stone-50 outline-none text-stone-500"
                      value={60}
                    />
                  </div>
                </div>
              )}

              {selectedShape.triangleType === 'right' && (() => {
                const angleR = Math.atan2(selectedShape.height, selectedShape.width) * (180 / Math.PI);
                const angleT = 90 - angleR;
                return (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1">Прямой</div>
                      <input 
                        type="number" disabled
                        className="w-full text-sm p-2 border border-stone-200 rounded bg-stone-50 outline-none text-stone-500"
                        value={90}
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1">Угол 2</div>
                      <input 
                        type="number" min="1" max="89"
                        className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                        value={Math.round(angleR)}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value) || 45;
                          if (val >= 90) val = 89;
                          if (val <= 0) val = 1;
                          const newH = selectedShape.width * Math.tan(val * Math.PI / 180);
                          const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: newH } : s);
                          updateState({ shapes: updated });
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1">Угол 3</div>
                      <input 
                        type="number" min="1" max="89"
                        className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                        value={Math.round(angleT)}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value) || 45;
                          if (val >= 90) val = 89;
                          if (val <= 0) val = 1;
                          const newH = selectedShape.width / Math.tan(val * Math.PI / 180);
                          const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, height: newH } : s);
                          updateState({ shapes: updated });
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase">Геометрические построения</div>
              
              <div className="flex items-center gap-3 mb-3">
                <input 
                  type="color" 
                  value={selectedShape.extraColor || '#3b82f6'}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                  onChange={(e) => {
                    updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, extraColor: e.target.value } : s) });
                  }}
                />
                <span className="text-[10px] text-stone-600">Цвет построений</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.showRightAngles !== false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, showRightAngles: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Прямые углы
                </label>
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.showEqualityStrokes !== false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, showEqualityStrokes: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Штрихи равенства
                </label>
              </div>

              <div className="space-y-2 mb-4 bg-stone-50 p-2 rounded">
                {[
                  { id: 'altitudes', label: 'Высоты', options: ['A', 'B', 'C'] },
                  { id: 'medians', label: 'Медианы', options: ['A', 'B', 'C'] },
                  { id: 'bisectors', label: 'Биссектрисы', options: ['A', 'B', 'C'] },
                  { id: 'midlines', label: 'Сред. линии', options: ['a', 'b', 'c'] },
                  { id: 'perpBisectors', label: 'Сер. перпенд.', options: ['a', 'b', 'c'] }
                ].map(group => (
                  <div key={group.id} className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-stone-600">{group.label}</span>
                    <div className="flex gap-1">
                      {group.options.map(opt => {
                        const isActive = (selectedShape[group.id] || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            className={`text-[9px] w-5 h-5 rounded flex items-center justify-center border ${isActive ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
                            onClick={() => {
                              const current = selectedShape[group.id] || [];
                              const next = isActive ? current.filter(x => x !== opt) : [...current, opt];
                              updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, [group.id]: next } : s) });
                            }}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.incircle || false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, incircle: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Вписанная окр.
                </label>
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.circumcircle || false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, circumcircle: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Описанная окр.
                </label>
              </div>
            </div>
          </div>
        )}
        
        {selectedShape && selectedShape.type === 'circle' && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1 uppercase">Размер (мм)</div>
              <input 
                type="number" min="5" max="200"
                className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                value={Math.round(selectedShape.width)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 10;
                  const updated = shapes.map(s => s.id === selectedShape.id ? { ...s, width: val, height: val } : s);
                  updateState({ shapes: updated });
                }}
              />
            </div>
            
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase">Геометрические построения</div>
              <div className="flex items-center gap-3 mb-3">
                <input 
                  type="color" 
                  value={selectedShape.extraColor || '#3b82f6'}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, extraColor: e.target.value } : s) })}
                />
                <span className="text-[10px] text-stone-600">Цвет построений</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.showRadius || false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, showRadius: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Радиус
                </label>
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedShape.showTangent || false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, showTangent: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Касательная
                </label>
              </div>
            </div>
          </div>
        )}

        {selectedShape && selectedShape.type === 'parallelogram' && (
          <div className="space-y-4 pt-2">
            <div className="flex gap-2 p-1 bg-stone-100 rounded-lg">
              <button
                className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-md transition-all ${(selectedShape.parallelogramType || 'standard') === 'standard' ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                onClick={() => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, parallelogramType: 'standard' } : s) })}
              >
                Параллелограмм
              </button>
              <button
                className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-md transition-all ${selectedShape.parallelogramType === 'rhombus' ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                onClick={() => {
                  const side = selectedShape.width || 100;
                  updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, parallelogramType: 'rhombus', width: side, height: side * Math.sin((s.angle || 60) * Math.PI / 180) } : s) });
                }}
              >
                Ромб
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-stone-500 mb-1">{(selectedShape.parallelogramType === 'rhombus') ? 'Сторона' : 'Основание (a)'}</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.width)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 50;
                    if (selectedShape.parallelogramType === 'rhombus') {
                      updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, width: val, height: val * Math.sin((s.angle || 60) * Math.PI / 180) } : s) });
                    } else {
                      updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, width: val } : s) });
                    }
                  }}
                />
              </div>
              {selectedShape.parallelogramType !== 'rhombus' && (
                <div>
                  <div className="text-[10px] text-stone-500 mb-1">Высота (h)</div>
                  <input 
                    type="number" min="5" max="300"
                    className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                    value={Math.round(selectedShape.height)}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, height: parseFloat(e.target.value) || 50 } : s) })}
                  />
                </div>
              )}
              <div>
                <div className="text-[10px] text-stone-500 mb-1">Угол (α)</div>
                <input 
                  type="number" min="10" max="170"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.angle || 60)}
                  onChange={(e) => {
                     const val = parseFloat(e.target.value) || 60;
                     if (selectedShape.parallelogramType === 'rhombus') {
                        updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, angle: val, height: s.width * Math.sin(val * Math.PI / 180) } : s) });
                     } else {
                        updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, angle: val } : s) });
                     }
                  }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase">Геометрические построения</div>
              <div className="flex items-center gap-3 mb-3">
                <input 
                  type="color" 
                  value={selectedShape.extraColor || '#3b82f6'}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, extraColor: e.target.value } : s) })}
                />
                <span className="text-[10px] text-stone-600">Цвет построений</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'diagonals', label: 'Диагонали', options: ['1', '2'] },
                  { id: 'altitudes', label: 'Высоты', options: ['A', 'B', 'C', 'D'] },
                  { id: 'bisectors', label: 'Биссектрисы', options: ['A', 'B', 'C', 'D'] }
                ].map(group => (
                  <div key={group.id} className="flex items-center justify-between bg-stone-50 p-2 rounded">
                    <span className="text-[10px] font-medium text-stone-600">{group.label}</span>
                    <div className="flex gap-1">
                      {group.options.map(opt => {
                        const isActive = (selectedShape[group.id] || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            className={`text-[9px] w-5 h-5 rounded flex items-center justify-center border ${isActive ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
                            onClick={() => {
                              const current = selectedShape[group.id] || [];
                              const next = isActive ? current.filter(x => x !== opt) : [...current, opt];
                              updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, [group.id]: next } : s) });
                            }}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {selectedShape.parallelogramType === 'rhombus' && (
                  <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer pt-2">
                    <input 
                      type="checkbox"
                      checked={selectedShape.showRightAngles !== false}
                      onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, showRightAngles: e.target.checked } : s) })}
                      className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                    />
                    Прямой угол диагоналей
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedShape && selectedShape.type === 'trapezoid' && (
          <div className="space-y-4 pt-2">
            <div className="flex gap-2 p-1 bg-stone-100 rounded-lg">
              <button
                className={`flex-1 py-1.5 px-1 text-[9px] font-medium rounded-md transition-all ${(selectedShape.trapezoidType || 'standard') === 'standard' ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                onClick={() => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, trapezoidType: 'standard' } : s) })}
              >
                Обычная
              </button>
              <button
                className={`flex-1 py-1.5 px-1 text-[9px] font-medium rounded-md transition-all ${selectedShape.trapezoidType === 'isosceles' ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                onClick={() => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, trapezoidType: 'isosceles', angle2: s.angle1 || 60 } : s) })}
              >
                Равнобедренная
              </button>
              <button
                className={`flex-1 py-1.5 px-1 text-[9px] font-medium rounded-md transition-all ${selectedShape.trapezoidType === 'right' ? 'bg-white text-brand-blue shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                onClick={() => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, trapezoidType: 'right', angle1: 90 } : s) })}
              >
                Прямоугольная
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-stone-500 mb-1">Верхнее осн. (b)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.topWidth || 60)}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, topWidth: parseFloat(e.target.value) || 60 } : s) })}
                />
              </div>
              <div>
                <div className="text-[10px] text-stone-500 mb-1">Высота (h)</div>
                <input 
                  type="number" min="5" max="300"
                  className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                  value={Math.round(selectedShape.height || 50)}
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, height: parseFloat(e.target.value) || 50 } : s) })}
                />
              </div>
              
              {(selectedShape.trapezoidType || 'standard') === 'standard' && (
                <>
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Левый угол (α)</div>
                    <input 
                      type="number" min="10" max="170"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.angle1 || 60)}
                      onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, angle1: parseFloat(e.target.value) || 60 } : s) })}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 mb-1">Правый угол (β)</div>
                    <input 
                      type="number" min="10" max="170"
                      className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                      value={Math.round(selectedShape.angle2 || 70)}
                      onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, angle2: parseFloat(e.target.value) || 70 } : s) })}
                    />
                  </div>
                </>
              )}

              {selectedShape.trapezoidType === 'isosceles' && (
                <div>
                  <div className="text-[10px] text-stone-500 mb-1">Углы при осн. (α)</div>
                  <input 
                    type="number" min="10" max="170"
                    className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                    value={Math.round(selectedShape.angle1 || 60)}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, angle1: parseFloat(e.target.value) || 60, angle2: parseFloat(e.target.value) || 60 } : s) })}
                  />
                </div>
              )}

              {selectedShape.trapezoidType === 'right' && (
                <div>
                  <div className="text-[10px] text-stone-500 mb-1">Острый угол (β)</div>
                  <input 
                    type="number" min="10" max="89"
                    className="w-full text-sm p-2 border border-stone-200 rounded focus:border-brand-blue outline-none"
                    value={Math.round(selectedShape.angle2 || 60)}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, angle2: parseFloat(e.target.value) || 60 } : s) })}
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase">Геометрические построения</div>
              <div className="flex items-center gap-3 mb-3">
                <input 
                  type="color" 
                  value={selectedShape.extraColor || '#3b82f6'}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                  onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, extraColor: e.target.value } : s) })}
                />
                <span className="text-[10px] text-stone-600">Цвет построений</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'diagonals', label: 'Диагонали', options: ['1', '2'] },
                  { id: 'altitudes', label: 'Высоты', options: ['B', 'C'] }
                ].map(group => (
                  <div key={group.id} className="flex items-center justify-between bg-stone-50 p-2 rounded">
                    <span className="text-[10px] font-medium text-stone-600">{group.label}</span>
                    <div className="flex gap-1">
                      {group.options.map(opt => {
                        const isActive = (selectedShape[group.id] || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            className={`text-[9px] w-5 h-5 rounded flex items-center justify-center border ${isActive ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
                            onClick={() => {
                              const current = selectedShape[group.id] || [];
                              const next = isActive ? current.filter(x => x !== opt) : [...current, opt];
                              updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, [group.id]: next } : s) });
                            }}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <label className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer pt-2">
                  <input 
                    type="checkbox"
                    checked={selectedShape.showMidline || false}
                    onChange={(e) => updateState({ shapes: shapes.map(s => s.id === selectedShape.id ? { ...s, showMidline: e.target.checked } : s) })}
                    className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue"
                  />
                  Средняя линия
                </label>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-stone-400 italic pt-4">
          Кликните по пустому месту на листе, чтобы вернуться к выбору фигур.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase tracking-wider">Объекты</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button 
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-brand-blue/30 transition-all text-xs text-stone-700"
          onClick={() => addShape('text_box')}
        >
          <svg className="w-5 h-5 mb-1 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          Текст
        </button>
        <button 
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-brand-blue/30 transition-all text-xs text-stone-700"
          onClick={() => addShape('image')}
        >
          <svg className="w-5 h-5 mb-1 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Картинка
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs col-span-2 relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('table', 'Таблица')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/></svg>
          Таблица
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
      </div>

      <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase tracking-wider">Фигуры</div>
      <div className="grid grid-cols-2 gap-2">
        <button 
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-brand-blue/30 transition-all text-xs text-stone-700"
          onClick={() => addShape('segment')}
        >
          <svg className="w-5 h-5 mb-1 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="20" x2="20" y2="4" /><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/></svg>
          Отрезок
        </button>
        <button 
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-brand-blue/30 transition-all text-xs text-stone-700"
          onClick={() => addShape('dashed_segment')}
        >
          <svg className="w-5 h-5 mb-1 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"><line x1="4" y1="20" x2="20" y2="4" /><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/></svg>
          Пунктир
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('triangle', 'Треугольник')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,4 4,20 20,20"/></svg>
          Треугольник
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('rectangle', 'Прямоугольник')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="16" height="12"/></svg>
          Прямоугольник
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('coord_ray', 'Луч')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="12" x2="20" y2="12" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><polyline points="15,8 20,12 15,16" /></svg>
          Луч
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('coord_line', 'Коорд. прямая')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="12" x2="20" y2="12" /><polyline points="15,8 20,12 15,16" /></svg>
          Коорд. прямая
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('coord_plane', 'Коорд. плоскость')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="12" x2="22" y2="12" />
            <polyline points="18,8 22,12 18,16" />
            <line x1="12" y1="22" x2="12" y2="2" />
            <polyline points="8,6 12,2 16,6" />
          </svg>
          Коорд. плоскость
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('parallelogram', 'Параллелограмм')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="6,18 10,6 22,6 18,18"/></svg>
          Параллелограмм
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('trapezoid', 'Трапеция')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="4,18 8,6 16,6 20,18"/></svg>
          Трапеция
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
        <button 
          className={`flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 transition-all text-xs relative ${!auth.isPro && !auth.isDemo ? 'bg-stone-50 text-stone-400' : 'bg-white hover:bg-stone-50 hover:border-brand-blue/30 text-stone-700'}`}
          onClick={() => handleAddShape('circle', 'Окружность')}
        >
          <svg className={`w-5 h-5 mb-1 ${!auth.isPro && !auth.isDemo ? 'text-stone-400' : 'text-stone-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>
          Окружность
          {!auth.isPro && !auth.isDemo && <ProBadge variant="overlay" />}
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 text-brand-blue rounded-xl text-xs">
        Выберите фигуру, чтобы добавить её на лист. Вы можете перетаскивать выделенную фигуру мышкой.
      </div>

      <UpgradeModal 
        isOpen={upgradeModal.open} 
        onClose={() => setUpgradeModal({ open: false, feature: '' })} 
        featureName={upgradeModal.feature} 
      />
    </section>
  );
};

export default InsertOptions;
