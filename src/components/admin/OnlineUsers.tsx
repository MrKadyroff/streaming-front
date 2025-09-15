import React, { useState, useEffect } from 'react';
import { getOnlineUsersCount } from '../../services/onlineUsersApi';
import { webSocketService } from '../../services/websocketService';
import './OnlineUsers.css';

const OnlineUsers: React.FC = () => {
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const loadOnlineUsers = async () => {
        try {
            setLoading(true);
            const count = await getOnlineUsersCount();
            setOnlineCount(count);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Ошибка загрузки онлайн пользователей:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Загружаем начальное количество
        loadOnlineUsers();

        // Настраиваем обновление через WebSocket
        const connection = webSocketService.getConnection();
        if (connection) {
            connection.on('onlineCount', (count: number) => {
                setOnlineCount(count);
                setLastUpdated(new Date());
            });
        }

        // Автообновление каждые 30 секунд как fallback
        const interval = setInterval(loadOnlineUsers, 30000);

        return () => {
            clearInterval(interval);
            if (connection) {
                connection.off('onlineCount');
            }
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="online-users-widget">
            <div className="widget-header">
                <h3>Онлайн пользователи</h3>
                <button
                    className="refresh-btn"
                    onClick={loadOnlineUsers}
                    disabled={loading}
                    title="Обновить"
                >
                    {loading ? '⏳' : '🔄'}
                </button>
            </div>

            <div className="online-stats">
                <div className="stat-item">
                    <div className="stat-value">
                        {loading ? '...' : onlineCount}
                    </div>
                    <div className="stat-label">
                        пользователей онлайн {onlineCount}
                    </div>
                </div>

                <div className="stat-meta">
                    <span className="connection-status">

                    </span>
                    <span className="last-updated">
                        Обновлено: {formatTime(lastUpdated)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OnlineUsers;
