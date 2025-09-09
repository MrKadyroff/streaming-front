import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api';
import './UsersManagement.css';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        status: 'active'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
            } else {
                await createUser(formData);
            }
            setFormData({ name: '', email: '', role: 'user', status: 'active' });
            setShowForm(false);
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            console.error('Ошибка сохранения пользователя:', error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Удалить пользователя?')) {
            try {
                await deleteUser(id);
                loadUsers();
            } catch (error) {
                console.error('Ошибка удаления пользователя:', error);
            }
        }
    };

    if (loading) {
        return <div className="loading">Загрузка пользователей...</div>;
    }

    return (
        <div className="users-management">
            <div className="users-header">
                <h2>Управление пользователями</h2>
                <button
                    className="add-btn"
                    onClick={() => setShowForm(true)}
                >
                    Добавить пользователя
                </button>
            </div>

            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Редактировать' : 'Добавить'} пользователя</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingUser(null);
                                    setFormData({ name: '', email: '', role: 'user', status: 'active' });
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Имя:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Роль:</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="user">Пользователь</option>
                                    <option value="admin">Администратор</option>
                                    <option value="moderator">Модератор</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Статус:</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="active">Активный</option>
                                    <option value="inactive">Неактивный</option>
                                    <option value="banned">Заблокирован</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="submit">
                                    {editingUser ? 'Обновить' : 'Создать'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingUser(null);
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="users-list">
                {users.length === 0 ? (
                    <div className="no-users">Пользователи не найдены</div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Дата создания</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span className={`status ${user.status}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(user)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;
