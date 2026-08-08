import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { shallowEqual } from './utils/shallowEqual';

const StoreContext = createContext();

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
  const storeRef = useRef(initialState);
  const listeners = useRef(new Set());
  
  const past = useRef([]);
  const future = useRef([]);
  const debounceTimer = useRef(null);

  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const getState = useCallback(() => storeRef.current, []);

  const notify = () => {
    listeners.current.forEach(l => l());
  };

  const updateState = useCallback((updates) => {
    if (future.current.length > 0) {
      future.current = [];
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    } else {
      past.current.push(storeRef.current);
      if (past.current.length > 50) past.current.shift();
    }

    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
    }, 700);

    storeRef.current = { ...storeRef.current, ...updates };
    notify();
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const previousState = past.current.pop();
    future.current.push(storeRef.current);
    
    storeRef.current = previousState;
    notify();
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const nextState = future.current.pop();
    past.current.push(storeRef.current);
    
    storeRef.current = nextState;
    notify();
  }, []);

  const getCanUndo = useCallback(() => past.current.length > 0, []);
  const getCanRedo = useCallback(() => future.current.length > 0, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
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

  const value = useMemo(() => ({
    subscribe,
    getState,
    updateState,
    undo,
    redo,
    getCanUndo,
    getCanRedo
  }), [subscribe, getState, updateState, undo, redo, getCanUndo, getCanRedo]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (selector) => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Missing StoreProvider');

  const [state, setState] = useState(() => 
    selector ? selector(store.getState()) : store.getState()
  );
  
  const [canUndo, setCanUndo] = useState(store.getCanUndo());
  const [canRedo, setCanRedo] = useState(store.getCanRedo());

  const stateRef = useRef(state);
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  useEffect(() => {
    const checkUpdate = () => {
      const nextCanUndo = store.getCanUndo();
      const nextCanRedo = store.getCanRedo();
      
      setCanUndo(prev => prev !== nextCanUndo ? nextCanUndo : prev);
      setCanRedo(prev => prev !== nextCanRedo ? nextCanRedo : prev);

      const nextState = selectorRef.current 
        ? selectorRef.current(store.getState()) 
        : store.getState();

      const isEqual = selectorRef.current 
        ? shallowEqual(stateRef.current, nextState)
        : stateRef.current === nextState;

      if (!isEqual) {
        stateRef.current = nextState;
        setState(nextState);
      }
    };
    
    checkUpdate();
    return store.subscribe(checkUpdate);
  }, [store]);

  return {
    state,
    updateState: store.updateState,
    undo: store.undo,
    redo: store.redo,
    canUndo,
    canRedo
  };
};
