import * as signalR from "@microsoft/signalr";

export type Status = "connecting" | "connected" | "reconnecting" | "disconnected";
type OnlineCountHandler = (count: number) => void;
type StatusHandler = (status: Status) => void;

export class WebSocketService {
    private connection: signalR.HubConnection;
    private startPromise: Promise<void> | null = null;
    private connected = false;

    private countHandlers = new Set<OnlineCountHandler>();
    private statusHandlers = new Set<StatusHandler>();

    constructor(
        hubUrl = "https://f4u.online/hub/online",
        opts?: { withCredentials?: boolean; accessTokenFactory?: () => string | Promise<string> }
    ) {
        const httpOpts: signalR.IHttpConnectionOptions = {};
        if (opts?.withCredentials) (httpOpts as any).withCredentials = true;
        if (opts?.accessTokenFactory) httpOpts.accessTokenFactory = opts.accessTokenFactory;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, httpOpts)
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .build();

        this.connection.keepAliveIntervalInMilliseconds = 15000;
        this.connection.serverTimeoutInMilliseconds = 60000;

        this.wireEvents();
    }

    // === публичные подписки ===
    public onOnlineCount(h: OnlineCountHandler) { this.countHandlers.add(h); }
    public offOnlineCount(h: OnlineCountHandler) { this.countHandlers.delete(h); }
    public onStatus(h: StatusHandler) { this.statusHandlers.add(h); }
    public offStatus(h: StatusHandler) { this.statusHandlers.delete(h); }

    // === управление соединением ===
    public async connect(): Promise<void> {
        if (this.connected) return;
        if (this.startPromise) return this.startPromise;

        this.setStatus("connecting");
        this.startPromise = this.connection.start()
            .then(() => { this.connected = true; this.setStatus("connected"); })
            .catch(async (err) => {
                console.error("SignalR start error:", err);
                // небольшой ретрай, пока autoReconnect ещё не активен
                await new Promise(r => setTimeout(r, 2000));
                this.startPromise = null;
                return this.connect();
            });

        try { await this.startPromise; } finally { this.startPromise = null; }
    }

    public async disconnect(): Promise<void> {
        if (!this.connected) return;
        try {
            await this.connection.stop();
            this.connected = false;
            this.setStatus("disconnected");
        } catch (e) {
            console.error("SignalR stop error:", (e as any)?.message);
        }
    }

    public getConnection(): signalR.HubConnection | null { return this.connection; }
    public isConnectionActive(): boolean {
        return this.connected && this.connection.state === signalR.HubConnectionState.Connected;
    }

    // === внутреннее: события сокета ===
    private wireEvents() {
        // события статуса
        this.connection.onreconnecting(() => { this.connected = false; this.setStatus("reconnecting"); });
        this.connection.onreconnected(() => { this.connected = true; this.setStatus("connected"); });
        this.connection.onclose(() => {
            this.connected = false;
            this.setStatus("disconnected");
            // план Б: когда autoReconnect выдохся — попробуем снова
            setTimeout(() => this.connect().catch(() => { }), 2000);
        });

        // данные от сервера
        this.connection.on("onlineCount", (c: number) => {
            Array.from(this.countHandlers).forEach(h => h(c));
        });
    }

    private setStatus(s: Status) {
        Array.from(this.statusHandlers).forEach(h => h(s));
    }
}

// singleton
export const webSocketService = new WebSocketService(
    "https://f4u.online/hub/online",
    {
        // если куки:
        // withCredentials: true
        // если JWT:
        // accessTokenFactory: () => getValidAccessToken()
    }
);
