import React, { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, children, className = '' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  const handleClose = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClose}
      className={`
        bg-white
        backdrop:bg-stone-900/40 backdrop:backdrop-blur-sm
        open:animate-fade-in
        m-auto
        p-0
        max-w-[calc(100vw-2rem)]
        sm:max-w-md
        w-full
        rounded-t-2xl sm:rounded-2xl
        fixed sm:relative
        bottom-0 sm:bottom-auto
        mt-auto sm:mt-auto
        shadow-2xl
        ${className}
      `}
    >
      <div className="relative p-6 max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </dialog>
  );
}
