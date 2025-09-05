import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AdsProvider } from './contexts/AdsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PageWithAds from './components/PageWithAds';
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
                        <span className="nav-text">Прямые эфиры</span>
                    </Link>

                    <div className="nav-brand">
                        <Link to="/" className="brand-link">
                            <img src="/logo.svg" alt="SportCast" className="brand-logo" />
                        </Link>
                    </div>

                    <Link to="/schedule" className="nav-link">
                        <span className="nav-text">Расписание</span>
                    </Link>

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
                    <div className="footer-section">
                        <h3>SportCast</h3>
                        <p>Лучшие спортивные трансляции онлайн</p>
                    </div>

                    <div className="footer-section">
                        <h4>Спорт</h4>
                        <ul>
                            <li><a href="#football">Футбол</a></li>
                            <li><a href="#basketball">Баскетбол</a></li>
                            <li><a href="#tennis">Теннис</a></li>
                            <li><a href="#hockey">Хоккей</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Контакты</h4>
                        <ul>
                            <li><a href="#about">О нас</a></li>
                            <li><a href="#contact">Связаться</a></li>
                            <li><a href="#help">Помощь</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 SportCast. Все права защищены.</p>
                </div>
            </div>
        </footer>
    );
};

const AppContent: React.FC = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

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
                    <Route path="/" element={<PageWithAds><Home /></PageWithAds>} />
                    <Route path="/schedule" element={<PageWithAds><Schedule /></PageWithAds>} />
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
