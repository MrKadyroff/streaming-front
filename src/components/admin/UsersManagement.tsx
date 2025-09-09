import React from 'react';
import './UsersManagement.css';

interface UsersManagementProps {
    apiUsers: any[];
}

const UsersManagement: React.FC<UsersManagementProps> = ({ apiUsers }) => {
    return (
        <div className="tab-content">
            <div className="users-management">
                <h2>Управление пользователями</h2>
                {apiUsers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>Пользователи не найдены</h3>
                        <p>Пользователи появятся после регистрации на платформе</p>
                    </div>
                ) : (
                    <div className="users-list">
                        {apiUsers.map((user, index) => (
                            <div key={index} className="user-card">
                                <div className="user-info">
                                    <h4>{user.name || user.username || `Пользователь ${index + 1}`}</h4>
                                    <p>{user.email || 'Email не указан'}</p>
                                    <p>Роль: {user.role || 'user'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;
