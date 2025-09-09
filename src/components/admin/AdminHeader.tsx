import React from 'react';
import './AdminHeader.css';

interface AdminHeaderProps {
    onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
    return (
        <div className="admin-header">
            <div className="admin-header-content">
                <div className="admin-title">
                    <h1>Панель администратора</h1>
                    <p>Управление спортивной платформой</p>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                    Выйти
                </button>
            </div>
        </div>
    );
};

export default AdminHeader;
