import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "Поиск матчей, игроков, турниров..."
}) => {
    return (
        <div className="search-bar">
            <div className="search-input-container">
                <span className="search-icon">Search</span>
                <input
                    type="text"
                    className="search-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                {value && (
                    <button
                        className="clear-btn"
                        onClick={() => onChange('')}
                        aria-label="Очистить поиск"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
