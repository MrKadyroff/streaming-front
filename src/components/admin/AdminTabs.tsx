import React from 'react';
import './AdminTabs.css';

export type AdminTab = 'dashboard' | 'matches' | 'ads' | 'users' | 'reports' | 'hls';

interface AdminTabsProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { key: 'dashboard' as AdminTab, label: 'Панель управления' },
        { key: 'matches' as AdminTab, label: 'Матчи' },
        { key: 'ads' as AdminTab, label: 'Реклама' },
        // { key: 'users' as AdminTab, label: 'Пользователи' },
        // { key: 'reports' as AdminTab, label: 'Отчеты' },
        // { key: 'hls' as AdminTab, label: 'HLS Потоки' },
    ];

    return (
        <div className="tabs-nav">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AdminTabs;
