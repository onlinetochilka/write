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
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">✍️ Работа с текстом и разборами</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>Ввод и ударения:</b> Печатайте текст в окно. Чтобы поставить ударение, кликните курсором после гласной и нажмите «´».</li>
                <li><b>Цветные ручки:</b> Выбирайте цвет в палитре.</li>
                <li><b>Графические разборы:</b> Выделите слово. Появится смарт-меню с дугами, корнями и линиями.</li>
                <li><b>Очистка (Ластик):</b> Выделите текст и нажмите «🧹».</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">📏 Настройка прописей</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>Разлиновка:</b> «Частая косая» — для 1 класса. В «Клетке» есть чекбокс «1 символ = 1 клетка» для математики.</li>
                <li><b>Обводка или списывание:</b> «Светлые» делает буквы полупрозрачными. «Тёмные» оставляет обычный текст.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">🖨️ Печать и экономия бумаги</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><b>2 листа на одном:</b> В Размещении выберите «2 листа рядом».</li>
                <li><b>Зеркальные поля:</b> Красная линия на правом листе переместится вправо.</li>
                <li><b>Идеальный результат:</b> При печати строго укажите <b>Масштаб 100%</b>!</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
