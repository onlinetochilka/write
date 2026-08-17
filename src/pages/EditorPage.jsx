import React, { useState } from 'react';
import { StoreProvider } from '../Store';
import { UIProvider } from '../providers/UIProvider';
import { AuthProvider } from '../providers/AuthProvider';
import Layout from '../components/Layout';
import SidebarSettings from '../components/SidebarSettings';
import PreviewSheet from '../components/PreviewSheet';
import HelpModal from '../components/HelpModal';

/**
 * EditorPage — главная рабочая страница конструктора.
 * Принимает prop `isDemo` — если true, активируется демо-режим
 * (все фичи доступны для просмотра, PDF с водяным знаком).
 */
export default function EditorPage({ isDemo = false }) {
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { setDemo } = useAuth();

  React.useEffect(() => {
    let mounted = true;
    document.fonts.ready.then(() => {
      if (mounted) setFontsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (setDemo) setDemo(isDemo);
  }, [isDemo, setDemo]);

  if (!fontsLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-100">Загрузка шрифтов...</div>;
  }

  return (
    <UIProvider>
      <StoreProvider>
        <Layout>
          <SidebarSettings onOpenHelp={() => setHelpOpen(true)} />
          <PreviewSheet />
        </Layout>
        <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      </StoreProvider>
    </UIProvider>
  );
}
