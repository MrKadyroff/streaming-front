# WebSocket интеграция для отслеживания онлайн пользователей

## Требования к бэкенду

### 1. SignalR Hub
Создать и настроить SignalR Hub для отслеживания онлайн пользователей:

```csharp
using Microsoft.AspNetCore.SignalR;

public class OnlineHub : Hub
{
    private readonly IOnlineTracker _tracker;

    public OnlineHub(IOnlineTracker tracker)
    {
        _tracker = tracker;
    }

    public override async Task OnConnectedAsync()
    {
        var count = _tracker.Add(Context.ConnectionId);
        await Clients.All.SendAsync("onlineCount", count);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? ex)
    {
        var count = _tracker.Remove(Context.ConnectionId);
        await Clients.All.SendAsync("onlineCount", count);
        await base.OnDisconnectedAsync(ex);
    }
}
```

### 2. IOnlineTracker сервис
Создать сервис для отслеживания подключенных пользователей:

```csharp
public interface IOnlineTracker
{
    int Add(string connectionId);
    int Remove(string connectionId);
    int GetCount();
}

public class OnlineTracker : IOnlineTracker
{
    private static readonly Dictionary<string, DateTime> ConnectedUsers = new();
    private static readonly object LockObject = new();

    public int Add(string connectionId)
    {
        lock (LockObject)
        {
            ConnectedUsers[connectionId] = DateTime.UtcNow;
            return ConnectedUsers.Count;
        }
    }

    public int Remove(string connectionId)
    {
        lock (LockObject)
        {
            ConnectedUsers.Remove(connectionId);
            return ConnectedUsers.Count;
        }
    }

    public int GetCount()
    {
        lock (LockObject)
        {
            // Удаляем старые соединения (более 5 минут)
            var cutoffTime = DateTime.UtcNow.AddMinutes(-5);
            var expiredConnections = ConnectedUsers
                .Where(kvp => kvp.Value < cutoffTime)
                .Select(kvp => kvp.Key)
                .ToList();
                
            foreach (var connectionId in expiredConnections)
            {
                ConnectedUsers.Remove(connectionId);
            }
            
            return ConnectedUsers.Count;
        }
    }
}
```

### 2. Регистрация сервисов в Startup.cs / Program.cs

```csharp
// В методе ConfigureServices / builder.Services
services.AddSignalR();
services.AddSingleton<IOnlineTracker, OnlineTracker>();

// В методе Configure / app.MapHub
app.MapHub<OnlineHub>("/hub/online");
```

### 3. CORS настройки
Убедитесь, что CORS настроены для работы с SignalR:

```csharp
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("https://f4u.online", "http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); // Важно для SignalR
    });
});
```

### 4. API эндпоинт для получения количества онлайн пользователей

```csharp
[ApiController]
[Route("api/admin/users")]
public class OnlineUsersController : ControllerBase
{
    private readonly IOnlineTracker _tracker;
    
    public OnlineUsersController(IOnlineTracker tracker)
    {
        _tracker = tracker;
    }
    
    [HttpGet("online-count")]
    public IActionResult GetOnlineUsersCount()
    {
        var count = _tracker.GetCount();
        
        return Ok(new 
        { 
            count = count,
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        });
    }
}
```

## Фронтенд реализация

### Автоматическое подключение
- WebSocket соединение устанавливается автоматически при открытии сайта
- Соединение поддерживается на всех страницах
- Автоматическое переподключение при разрыве соединения

### Админ панель
- В дашборде админ панели добавлен виджет "Онлайн пользователи"
- Показывает количество активных пользователей в реальном времени
- Автоматическое обновление через WebSocket
- Fallback обновление каждые 30 секунд через REST API

### WebSocket события
Фронтенд слушает события:
- `onlineCount` - обновление количества онлайн пользователей

Фронтенд подключается автоматически:
- При установке соединения сервер автоматически вызывает `OnConnectedAsync`
- При закрытии соединения сервер автоматически вызывает `OnDisconnectedAsync`

## Тестирование

1. Откройте сайт в нескольких вкладках/браузерах
2. Перейдите в админ панель и проверьте виджет "Онлайн пользователи"
3. Закройте несколько вкладок и убедитесь, что счетчик обновляется
4. Проверьте API эндпоинт: `GET /api/admin/users/online-count`

## Структура файлов (фронтенд)

```
src/
├── services/
│   ├── websocketService.ts      # Сервис WebSocket соединения
│   └── onlineUsersApi.ts        # API для получения онлайн пользователей
├── hooks/
│   └── useWebSocket.ts          # React хук для WebSocket
├── components/admin/
│   ├── OnlineUsers.tsx          # Компонент виджета онлайн пользователей
│   └── OnlineUsers.css          # Стили для виджета
└── App.tsx                      # Инициализация WebSocket соединения
```
