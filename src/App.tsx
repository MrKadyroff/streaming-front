import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AdsProvider } from './contexts/BannerContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useWebSocket } from './hooks/useWebSocket';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PageWithBanners from './components/PageWithAds';
import StreamApiTest from './components/StreamApiTest';
import './App.css';

const Navigation: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`main-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
            <div className="nav-container">
                <div className="nav-center">
                    <Link to="/" className="nav-link">
                        <span className="nav-text desktop-text">Прямые эфиры</span>
                        {/* <span className="nav-text mobile-text">Эфиры</span> */}
                    </Link>

                    <div className="nav-brand">
                        <Link to="/" className="brand-link">
                            <img src="/logo.svg" alt="F4U" className="brand-logo" />
                        </Link>
                    </div>

                    <Link to="/schedule" className="nav-link">
                        <span className="nav-text">Расписание</span>
                    </Link>
                </div>

                <div className="nav-right">
                    <a href="https://t.me/f4utg" target="_blank" rel="noopener noreferrer" className="nav-link telegram-link">
                        <span className="telegram-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path d="M9.993 15.705l-.396 5.592c.565 0 .81-.244 1.105-.537l2.651-2.548 
    5.494 3.995c1.006.556 1.721.263 1.977-.931l3.58-16.804.001-.001c.319-1.49-.538-2.073-1.514-1.711L1.67 
    9.786c-1.452.565-1.43 1.373-.247 1.741l5.272 1.645L18.855 6.42c.57-.375 1.089-.168.662.207"/>
                            </svg>
                        </span>
                    </a>

                    {isAuthenticated && (
                        <Link to="/admin" className="nav-link">
                            <span className="nav-text">Админ</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

const Footer: React.FC = () => {
    return (
        <footer className="main-footer">
            <div className="footer-container">
                <div className="footer-content">


                </div>

                <div className="footer-bottom">

                </div>
            </div>
        </footer>
    );
};

const AppContent: React.FC = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    // Инициализируем WebSocket соединение для отслеживания онлайн пользователей
    useWebSocket();

    if (isLoginPage) {
        return (
            <div className="app-container">
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Navigation />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<PageWithBanners><Home /></PageWithBanners>} />
                    <Route path="/schedule" element={<PageWithBanners><Schedule /></PageWithBanners>} />
                    <Route path="/test-api" element={<StreamApiTest />} />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <AdsProvider>
                        <Router>
                            <AppContent />
                        </Router>
                    </AdsProvider>
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
