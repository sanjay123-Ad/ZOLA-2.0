import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { User } from '../types';
import Sidebar from './Sidebar';
import { HamburgerIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './icons';

interface LayoutProps {
  user: User;
  onLogout: (e?: React.MouseEvent) => void;
  children?: React.ReactNode; // Keep for Outlet context if needed, but primarily use Outlet
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // State for collapsible desktop sidebar
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false); // Default to false for SSR

  // Persist sidebar state
  useEffect(() => {
    // This effect runs only on the client, after hydration.
    try {
      const savedState = JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
      setSidebarCollapsed(savedState);
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    // This effect saves the state back to localStorage whenever it changes.
    // It's safe because it will only run on the client.
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);


  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Static Sidebar for Desktop */}
      <div className="hidden lg:flex relative">
        <Sidebar 
            user={user} 
            onLogout={onLogout} 
            isCollapsed={isSidebarCollapsed}
            closeMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <button 
            onClick={handleToggleSidebar}
            className="absolute top-1/2 -right-4 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
            {isSidebarCollapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
        </button>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)}></div>
          <div className="relative h-full w-64">
            <Sidebar 
                user={user} 
                onLogout={onLogout} 
                isCollapsed={false} // Mobile sidebar is never collapsed
                closeMobileSidebar={() => setMobileSidebarOpen(false)}
            />
          </div>
      </div>


      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/BQ63Y0dw/Frame-13.png" alt="Zola AI Fashion Studio" className="h-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-[#2E1E1E] dark:text-white text-lg font-bold font-headline">ZOLA AI</span>
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Fashion Studio</span>
            </div>
          </div>
          <button onClick={() => setMobileSidebarOpen(true)} className="text-gray-600 dark:text-gray-300 p-2">
            <HamburgerIcon />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;