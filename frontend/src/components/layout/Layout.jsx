import React from 'react';
import { useAuth } from '../../context/AuthContext';
import TopNavbar from './TopNavbar';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <TopNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

