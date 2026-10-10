import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import ErrorBoundary from './ErrorBoundary';
import './Layout.css';

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="app-layout">
      <ScrollToTop />
      <Navbar />
      <main className="app-main" key={location.pathname}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
