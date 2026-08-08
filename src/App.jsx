import React, { useState } from 'react';
import { StoreProvider } from './Store';
import Layout from './components/Layout';
import SidebarSettings from './components/SidebarSettings';
import PreviewSheet from './components/PreviewSheet';
import HelpModal from './components/HelpModal';
import GlassDrawer from './components/GlassDrawer';

function App() {
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  React.useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  if (!fontsLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-100">Загрузка шрифтов...</div>;
  }

  return (
    <StoreProvider>
      <Layout>
        <SidebarSettings onOpenHelp={() => setHelpOpen(true)} />
        <PreviewSheet />
      </Layout>
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <GlassDrawer isOpen={isDrawerOpen} onToggle={() => setDrawerOpen(!isDrawerOpen)} />
    </StoreProvider>
  );
}

export default App;


