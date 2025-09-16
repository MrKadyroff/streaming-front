// useWebSocket.ts
import { useEffect, useState } from "react";
import { webSocketService, Status } from "../services/websocketService";

export const useWebSocket = () => {
    const [status, setStatus] = useState<Status>("connecting");
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        let mounted = true;

        const s = (st: Status) => { if (mounted) setStatus(st); };
        const c = (n: number) => { if (mounted) setOnlineCount(n); };

        webSocketService.onStatus(s);
        webSocketService.onOnlineCount(c);

        webSocketService.connect().catch(console.error);

        return () => {
            mounted = false;
            webSocketService.offStatus(s);
            webSocketService.offOnlineCount(c);
            // НЕ останавливаем соединение здесь, иначе один компонент «уронит» сокет всем
        };
    }, []);

    return { status, onlineCount, connection: webSocketService.getConnection() };
};
