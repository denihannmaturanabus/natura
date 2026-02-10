
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-10">
      {/* Navbar Rosada con Gradiente */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-pink-500 via-pink-400 to-rose-500 shadow-lg shadow-pink-200/50">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5 max-w-7xl lg:mx-auto">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={onBack}
                className="p-2 -ml-2 text-white hover:bg-white/20 rounded-xl active:opacity-50 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight drop-shadow-md">
              {title || 'GlowManager'}
            </h1>
          </div>
          <div>{headerAction}</div>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 pt-4 lg:pt-6 max-w-7xl lg:mx-auto lg:w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
