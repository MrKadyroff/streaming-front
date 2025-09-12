import React, { useState, useEffect } from 'react';
import { streamApi, Stream } from '../services/streamApi';

const StreamApiTest: React.FC = () => {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeStream, setActiveStream] = useState<Stream | null>(null);

    useEffect(() => {
        testApiConnection();
    }, []);

    const testApiConnection = async () => {
        setLoading(true);
        setError(null);

        try {


            // Тестируем получение всех потоков
            const response = await streamApi.getStreams(1, 10);
            console.log('API Response:', response);
            setStreams(response.streams);

            // Тестируем получение активных потоков
            const activeStreams = await streamApi.getActiveStreams();
            console.log('Active streams:', activeStreams);

            // Тестируем получение первого активного потока
            const firstActive = await streamApi.getFirstActiveStream();
            console.log('First active stream:', firstActive);
            setActiveStream(firstActive);

        } catch (err: any) {
            console.error('API Error:', err);
            setError(err.message || 'Failed to connect to API');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        testApiConnection();
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Тестирование API подключения...</h3>
                <div>⏳ Загрузка...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Stream API Test</h2>
                <button
                    onClick={handleRefresh}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Обновить
                </button>
            </div>

            {error && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#dc2626'
                }}>
                    <h4>❌ Ошибка подключения:</h4>
                    <p>{error}</p>
                    <small>API URL: https://f4u.online:5001/api/admin/streams</small>
                </div>
            )}

            {!error && (
                <>
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#dcfce7',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        color: '#166534'
                    }}>
                        <h4>✅ API подключение успешно</h4>
                        <p>Найдено потоков: {streams.length}</p>
                        <p>Активных потоков: {streams.filter(s => s.status === 'live').length}</p>
                        <p>Готовых к запуску: {streams.filter(s => s.status === 'upcoming').length}</p>
                    </div>

                    {activeStream && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <h4>🎬 Первый активный поток:</h4>
                            <p><strong>Название:</strong> {activeStream.title}</p>
                            <p><strong>URL:</strong> {activeStream.streamUrl}</p>
                            <p><strong>Активен:</strong> {activeStream.isActive ? '✅ Да' : '❌ Нет'}</p>
                            {activeStream.description && (
                                <p><strong>Описание:</strong> {activeStream.description}</p>
                            )}
                        </div>
                    )}

                    <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <h4 style={{
                            margin: 0,
                            padding: '12px 16px',
                            backgroundColor: '#f9fafb',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            📺 Все потоки ({streams.length})
                        </h4>

                        {streams.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                                Нет доступных потоков
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {streams.map((stream, index) => (
                                    <div
                                        key={stream.id}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: index < streams.length - 1 ? '1px solid #f3f4f6' : 'none',
                                            backgroundColor: stream.isActive ? '#f0fdf4' : '#ffffff'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{stream.title}</strong>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                                                    {stream.streamUrl}
                                                </div>
                                                {stream.description && (
                                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                                        {stream.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: stream.isActive ? '#16a34a' : '#6b7280',
                                                    color: 'white'
                                                }}>
                                                    {stream.isActive ? 'АКТИВЕН' : 'НЕАКТИВЕН'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                                    ID: {stream.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StreamApiTest;
