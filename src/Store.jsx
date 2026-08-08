import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState({
    format: 'a4',
    orientation: 'portrait',
    grid: 'frequent',
    mode: 'tracing',
    layout: '1-page',
    mathMode: false,
    margin: 'left',
    mirrorMargins: false,
    textLines: [
      [{ text: 'Аа Бб Вв 1 2 3 4 5' }],
      [],
      [{ text: 'Пишу красиво и легко.' }],
      [],
      [{ text: 'С Точилкой всё сходится!' }]
    ],
  });

  const updateState = React.useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const contextValue = React.useMemo(() => ({ state, updateState }), [state, updateState]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};
