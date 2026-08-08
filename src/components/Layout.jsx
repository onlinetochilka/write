import React from 'react';

function Layout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory text-stone-800 p-[clamp(0.75rem,1.5vw,1.25rem)] gap-4">
      {children}
    </div>
  );
}

export default Layout;
