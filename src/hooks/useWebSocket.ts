import { useEffect } from 'react';
import { webSocketService } from '../services/websocketService';

export const useWebSocket = () => {
    useEffect(() => {
        // Подключаемся к WebSocket при монтировании компонента
        const connectWebSocket = async () => {
            try {
                await webSocketService.connect();
            } catch (error) {
                console.error('Ошибка подключения к WebSocket:', error);
            }
        };

        connectWebSocket();

        // Отключаемся при размонтировании или закрытии страницы
        const handleBeforeUnload = async () => {
            await webSocketService.disconnect();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            webSocketService.disconnect();
        };
    }, []);

    return {
        connection: webSocketService.getConnection(),
        isConnected: webSocketService.isConnectionActive()
    };
};
