import React, { useEffect, useState } from 'react';

const THEME_KEY = 'sport_theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'day');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    return (
        <div className="theme-toggle">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={theme === 'night'}
                    onChange={(e) => setTheme(e.target.checked ? 'night' : 'day')}
                />
                <span className="slider" />
            </label>
            <span className="theme-label">{theme === 'night' ? 'Ночь' : 'День'}</span>
        </div>
    );
}
