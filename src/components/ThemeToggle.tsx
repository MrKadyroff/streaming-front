import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
        >
            {theme === 'light' ? 'Dark' : 'Light'}
        </button>
    );
};

export default ThemeToggle;
