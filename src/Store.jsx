import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const initialState = {
  format: 'a4',
  orientation: 'portrait',
  grid: 'frequent',
  mode: 'tracing',
  layout: '1-page',
  mathMode: false,
  margin: 'left',
  mirrorMargins: false,
  printFont: 'ClassRoomCursive',
  printFontSize: 5,
  textLines: [
    [{ text: 'Аа Бб Вв 1 2 3 4 5' }],
    [],
    [{ text: 'Пишу красиво и легко.' }],
    [],
    [{ text: 'С Точилкой всё сходится!' }]
  ],
  shapes: [],
  selectedShapeId: null,
};

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // History refs
  const past = useRef([]);
  const future = useRef([]);
  const [historyVersion, setHistoryVersion] = useState(0);
  const stateRef = useRef(initialState);
  const debounceTimer = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = useCallback((updates) => {
    // Clear future array on new actions
    if (future.current.length > 0) {
      future.current = [];
      setHistoryVersion(v => v + 1);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    } else {
      // First change after a period of rest. Save the CURRENT state to past BEFORE we apply the updates!
      past.current.push(stateRef.current);
      if (past.current.length > 50) past.current.shift(); // Keep max 50 items
      setHistoryVersion(v => v + 1);
    }

    // Set a timer to close the current batch
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
    }, 700);

    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const previousState = past.current.pop();
    future.current.push(stateRef.current);
    
    setState(previousState);
    setHistoryVersion(v => v + 1);
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const nextState = future.current.pop();
    past.current.push(stateRef.current);
    
    setState(nextState);
    setHistoryVersion(v => v + 1);
  }, []);

  // Global hotkeys for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field (so they can use native undo/redo for text)
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const contextValue = useMemo(() => ({ 
    state, 
    updateState, 
    undo, 
    redo, 
    canUndo: past.current.length > 0, 
    canRedo: future.current.length > 0 
  }), [state, updateState, undo, redo, historyVersion]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};
