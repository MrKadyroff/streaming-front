import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Имитируем небольшую задержку для UX
        setTimeout(() => {
            const success = login(username, password);

            if (success) {
                navigate('/admin');
            } else {
                setError('Неверное имя пользователя или пароль');
            }

            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <img src="/logo.svg" alt="F4U" />
                        </div>
                        <h1>Вход в админ-панель</h1>
                        <p>Введите учетные данные для доступа</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Имя пользователя</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Введите логин"
                                required
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Пароль</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Вход...
                                </>
                            ) : (
                                'Войти в систему'
                            )}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default Login;
