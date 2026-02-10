
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, headerAction, showBack, onBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5F7] pb-10">
      {/* iOS Header */}
      <header className="sticky top-0 z-50 ios-blur bg-white/70 border-b border-pink-100 safe-top">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={onBack}
                className="p-2 -ml-2 text-pink-500 active:opacity-50 transition-opacity"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              {title || 'GlowManager'}
            </h1>
          </div>
          <div>{headerAction}</div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
