import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import NewsletterPage from './pages/NewsletterPage';
import VerifyPage from './pages/VerifyPage';
import UnsubscribePage from './pages/UnsubscribePage';
import AdminNewsletterPage from './pages/AdminNewsletterPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/newsletter');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/newsletter');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderCurrentRoute = () => {
    if (currentPath === '/newsletter/verify') {
      return <VerifyPage onNavigate={navigate} />;
    }
    if (currentPath === '/newsletter/unsubscribe') {
      return <UnsubscribePage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminNewsletterPage onNavigate={navigate} />;
    }
    if (currentPath === '/events') {
      return <EventsPage onNavigate={navigate} />;
    }
    if (currentPath === '/') {
      return <HomePage onNavigate={navigate} />;
    }
    // Default to /newsletter
    return <NewsletterPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-400">
      <Navbar currentRoute={currentPath} onNavigate={navigate} />
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
