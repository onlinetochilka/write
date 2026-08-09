import React from 'react';

function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-stone-200/50">
          <h2 className="text-xl font-bold text-stone-900">Как пользоваться генератором?</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 text-stone-700 text-sm leading-relaxed">
          <section>
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">✍️ Вкладка «Текст»</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>Ввод и ударения:</b> Печатайте текст. Для ударения кликните после гласной и нажмите «´» на панели.</li>
                <li><b>Шрифт и цвет:</b> Выбирайте рукописный или печатный шрифт, настраивайте размер и цвет ручки.</li>
                <li><b>Графические разборы:</b> Выделите часть слова и выберите на панели нужный символ (корень, суффикс, дугу и др.).</li>
                <li><b>Очистка форматирования:</b> Выделите текст и нажмите иконку очистки на панели, чтобы сбросить стили.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">📏 Вкладка «Лист»</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>Разлиновка:</b> «Частая косая» — для 1 класса. В «Клетке» есть настройка «1 символ = 1 клетка» для математики.</li>
                <li><b>Как пишем буквы?:</b> «Светлые» — для обводки, «Тёмные» — для списывания.</li>
                <li><b>Формат и размещение:</b> Настраивайте поля, ориентацию и формат. Для экономии бумаги выберите «2 листа рядом» (появится опция зеркальных полей).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">📐 Вкладка «Вставка»</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>Добавление элементов:</b> Вставляйте геометрические фигуры, координатные лучи, таблицы и картинки.</li>
                <li><b>Свойства:</b> Выделите добавленную фигуру, чтобы изменить её размеры, цвет контура, заливку и другие настройки.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">🖨️ Печать и сохранение</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>Сохранение в PDF:</b> Нажмите главную кнопку внизу и выберите принтер «Сохранить как PDF» (или «Save as PDF»).</li>
                <li><b>Идеальный результат:</b> При печати на бумаге строго указывайте <b>Масштаб 100%</b> в настройках принтера!</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
