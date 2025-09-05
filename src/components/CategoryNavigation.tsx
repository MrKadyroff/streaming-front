import React from 'react';
import { SportCategory } from '../types';
import './CategoryNavigation.css';

interface CategoryNavigationProps {
    categories: SportCategory[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
    categories,
    selectedCategory,
    onCategoryChange
}) => {
    return (
        <nav className="category-navigation">
            <div className="category-scroll">
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-name">{category.name}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default CategoryNavigation;
