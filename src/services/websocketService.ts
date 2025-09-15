import * as signalR from '@microsoft/signalr';

export class WebSocketService {
    private connection: signalR.HubConnection | null = null;
    private isConnected = false;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('https://f4u.online/hub/online')
            .withAutomaticReconnect()
            .build();

        this.setupConnectionEvents();
    }

    private setupConnectionEvents() {
        if (!this.connection) return;

        this.connection.onreconnecting(() => {
            console.log('WebSocket переподключается...');
            this.isConnected = false;
        });

        this.connection.onreconnected(() => {
            console.log('WebSocket переподключен');
            this.isConnected = true;
        });

        this.connection.onclose(() => {
            console.log('WebSocket соединение закрыто');
            this.isConnected = false;
        });
    }

    public async connect(): Promise<void> {
        if (!this.connection || this.isConnected) return;

        try {
            await this.connection.start();
            this.isConnected = true;
            console.log('WebSocket соединение установлено');

            // Сервер автоматически обработает подключение через OnConnectedAsync
        } catch (error) {
            console.error('Ошибка подключения WebSocket:', error);
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.connection || !this.isConnected) return;

        try {
            // Сервер автоматически обработает отключение через OnDisconnectedAsync
            await this.connection.stop();
            this.isConnected = false;
            console.log('WebSocket соединение закрыто');
        } catch (error) {
            console.error('Ошибка отключения WebSocket:', error);
        }
    }

    public getConnection(): signalR.HubConnection | null {
        return this.connection;
    }

    public isConnectionActive(): boolean {
        return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

// Создаем singleton экземпляр
export const webSocketService = new WebSocketService();
