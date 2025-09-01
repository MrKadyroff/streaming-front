import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <nav className="topnav">
          <div className="brand">SportLive</div>
          <ul>
            <li><Link to="/">Live</Link></li>
            <li><Link to="/schedule">Расписание</Link></li>
            <li><Link to="/admin">Админ</Link></li>
          </ul>
          <ThemeToggle />
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>

        <footer className="site-footer">
          <div>© {new Date().getFullYear()} SportLive — демо</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
