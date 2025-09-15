import React, { useState, useEffect } from 'react';
import './StreamsManagement.css';

export interface Stream {
    id: number;
    title: string;
    description?: string;
    status: 'active' | 'upcoming' | 'ended';
    viewers: number | null;
    streamUrl: string;
    fallbackUrl?: string;
    scheduledTime?: string;
    sport?: string;
    tournament?: string;
    homeTeam?: string;
    awayTeam?: string;
    startTime?: string;
    date?: string;
    player1?: string;
    player2?: string;
    venue?: string;
    quality: string[];
}

interface StreamsManagementProps {
    // Убираем props, компонент сам будет загружать данные
}

const StreamsManagement: React.FC<StreamsManagementProps> = () => {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [streamsLoading, setStreamsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStream, setEditingStream] = useState<Stream | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        streamUrl: 'https://f4u.online/hls/stream1/index.m3u8',
        fallbackUrl: '',
        scheduledTime: '',
        sport: 'Футбол',
        tournament: '',
        homeTeam: '',
        awayTeam: '',
        status: 'upcoming' as Stream['status'],
        quality: ['1080p', '720p', '480p']
    });

    // Функция для загрузки стримов
    const loadStreams = async () => {
        setStreamsLoading(true);
        try {
            const response = await fetch('https://f4u.online/api/admin/streams/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке стримов');
            }

            const data = await response.json();
            console.log('Загруженные стримы:', data);

            // API возвращает объект с полем streams
            const streamsArray = Array.isArray(data.streams) ? data.streams : [];
            setStreams(streamsArray);
        } catch (error) {
            console.error('Ошибка загрузки стримов:', error);
            setStreams([]);
        } finally {
            setStreamsLoading(false);
        }
    };

    // Загружаем стримы при монтировании компонента
    useEffect(() => {
        loadStreams();
    }, []);

    // API методы для управления стримами
    const createStream = async (streamData: any) => {
        try {
            const response = await fetch('https://f4u.online/api/admin/streams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(streamData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании стрима');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка создания стрима:', error);
            throw error;
        }
    };

    const updateStream = async (id: number, streamData: any) => {
        try {
            const response = await fetch(`https://f4u.online/api/admin/streams/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(streamData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении стрима');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления стрима:', error);
            throw error;
        }
    };

    const deleteStream = async (id: number) => {
        try {
            const response = await fetch(`https://f4u.online/api/admin/streams/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении стрима');
            }

            return true;
        } catch (error) {
            console.error('Ошибка удаления стрима:', error);
            throw error;
        }
    };

    const handleOpenModal = async (stream?: Stream) => {
        if (stream) {
            setEditingStream(stream);

            // Поскольку мы уже загружаем полную информацию через /api/admin/streams/all,
            // можем использовать данные напрямую без дополнительного запроса

            // Форматируем scheduledTime для datetime-local input
            let formattedScheduledTime = '';
            if (stream.scheduledTime) {
                const date = new Date(stream.scheduledTime);
                formattedScheduledTime = date.toISOString().slice(0, 16);
            }

            setFormData({
                title: stream.title || '',
                description: stream.description || '',
                streamUrl: stream.streamUrl || '',
                fallbackUrl: stream.fallbackUrl || '',
                scheduledTime: formattedScheduledTime,
                sport: stream.sport || 'Футбол',
                tournament: stream.tournament || '',
                homeTeam: stream.homeTeam || '',
                awayTeam: stream.awayTeam || '',
                status: stream.status || 'upcoming',
                quality: stream.quality || ['1080p', '720p', '480p']
            });
        } else {
            setEditingStream(null);
            setFormData({
                title: '',
                description: '',
                streamUrl: 'https://f4u.online/hls/stream1/index.m3u8',
                fallbackUrl: '',
                scheduledTime: '',
                sport: 'Футбол',
                tournament: '',
                homeTeam: '',
                awayTeam: '',
                status: 'upcoming',
                quality: ['1080p', '720p', '480p']
            });
        }
        setShowModal(true);
    }; const handleCloseModal = () => {
        setShowModal(false);
        setEditingStream(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Подготавливаем данные для отправки
            const submitData = {
                title: formData.title,
                description: formData.description || '',
                streamUrl: formData.streamUrl,
                fallbackUrl: formData.fallbackUrl || '',
                scheduledTime: formData.scheduledTime ? new Date(formData.scheduledTime).toISOString() : '',
                sport: formData.sport,
                tournament: formData.tournament || '',
                homeTeam: formData.homeTeam,
                awayTeam: formData.awayTeam,
                status: formData.status,
                // Убираем поля, которые не нужны для API
            };

            if (editingStream) {
                await updateStream(editingStream.id, submitData);
            } else {
                await createStream(submitData);
            }

            loadStreams();
            handleCloseModal();
        } catch (error) {
            console.error('Ошибка при сохранении эфира:', error);
            alert('Ошибка при сохранении эфира');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот стрим?')) {
            try {
                await deleteStream(id);
                loadStreams();
            } catch (error) {
                alert('Ошибка при удалении стрима');
            }
        }
    };

    const handleStatusChange = async (id: number, newStatus: Stream['status']) => {
        try {
            const updateData: Partial<Stream> = {
                status: newStatus,
                startTime: newStatus === 'active' ? new Date().toISOString() : undefined
            };

            await updateStream(id, updateData);
            loadStreams();
        } catch (error) {
            alert('Ошибка при изменении статуса стрима');
        }
    };

    const getStatusColor = (status: Stream['status']) => {
        switch (status) {
            case 'active': return '#22c55e';
            case 'upcoming': return '#f59e0b';
            case 'ended': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status: Stream['status']) => {
        switch (status) {
            case 'active': return 'В эфире';
            case 'upcoming': return 'Ожидает';
            case 'ended': return 'Завершен';
            default: return 'Неизвестно';
        }
    };

    return (
        <div className="streams-management">
            <div className="management-header">
                <h2>Расписание трансляций</h2>
                <div className="header-actions">
                    <button
                        className="refresh-btn"
                        onClick={loadStreams}
                        title="Обновить список"
                    >
                        🔄 Обновить
                    </button>
                    <button
                        className="add-btn"
                        onClick={() => handleOpenModal()}
                    >
                        ➕ Добавить эфир
                    </button>
                </div>
            </div>

            <div className="schedule-list">
                {streamsLoading ? (
                    <div className="streams-loading">
                        <div className="loading-spinner">⏳</div>
                        <p>Загрузка стримов...</p>
                    </div>
                ) : streams.length === 0 ? (
                    <div className="no-streams">
                        <div className="no-streams-icon">📺</div>
                        <h3>Нет активных эфиров</h3>
                        <p>Создайте первый эфир, чтобы начать трансляцию</p>
                        <button
                            className="create-first-btn"
                            onClick={() => handleOpenModal()}
                        >
                            Создать эфир
                        </button>
                    </div>
                ) : (
                    streams.map(stream => (
                        <div key={stream.id} className="schedule-item">
                            <div className="schedule-time">
                                <div className="match-date">
                                    {stream.scheduledTime ? new Date(stream.scheduledTime).toLocaleDateString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit'
                                    }) : 'Сегодня'}
                                </div>
                                <div className="match-time">
                                    {stream.scheduledTime ? new Date(stream.scheduledTime).toLocaleTimeString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : '--:--'}
                                </div>
                            </div>

                            <div className="schedule-teams">
                                <div className="team-names">
                                    <div className="team">{stream.homeTeam || stream.player1 || 'Команда 1'}</div>
                                    <div className="vs">VS</div>
                                    <div className="team">{stream.awayTeam || stream.player2 || 'Команда 2'}</div>
                                </div>
                                {(stream.venue || stream.tournament) && (
                                    <div className="venue">
                                        {stream.tournament && <span>{stream.tournament}</span>}
                                        {stream.venue && stream.tournament && <span> • </span>}
                                        {stream.venue && <span>{stream.venue}</span>}
                                    </div>
                                )}
                            </div>

                            <div className="schedule-status">
                                <div className="status-badge" data-status={stream.status}>
                                    <span
                                        className="status-indicator"
                                        style={{ backgroundColor: getStatusColor(stream.status) }}
                                    />
                                    <span className="status-text">
                                        {getStatusText(stream.status)}
                                    </span>
                                </div>

                                {stream.status === 'active' && (
                                    <div className="viewers-count">
                                        👥 {(stream.viewers || 0).toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <div className="schedule-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => handleOpenModal(stream)}
                                    title="Редактировать"
                                >
                                    ✏️
                                </button>

                                {stream.status === 'upcoming' && (
                                    <button
                                        className="start-btn compact"
                                        onClick={() => handleStatusChange(stream.id, 'active')}
                                        title="Запустить эфир"
                                    >
                                        ▶️
                                    </button>
                                )}

                                {stream.status === 'active' && (
                                    <button
                                        className="stop-btn compact"
                                        onClick={() => handleStatusChange(stream.id, 'ended')}
                                        title="Завершить эфир"
                                    >
                                        ⏹️
                                    </button>
                                )}

                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(stream.id)}
                                    title="Удалить"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Модальное окно для создания/редактирования стрима */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingStream ? 'Редактировать эфир' : 'Создать новый эфир'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}>✕</button>
                        </div>

                        <form className="stream-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Название эфира</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Например: Эль Класико: Реал vs Барселона"
                                        required
                                    />
                                </div>

                                {/* <div className="form-group">
                                    <label>Описание (опционально)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Краткое описание эфира"
                                        rows={3}
                                    />
                                </div> */}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Домашняя команда</label>
                                    <input
                                        type="text"
                                        value={formData.homeTeam}
                                        onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                                        placeholder="Название домашней команды"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Гостевая команда</label>
                                    <input
                                        type="text"
                                        value={formData.awayTeam}
                                        onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                                        placeholder="Название гостевой команды"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Спорт</label>
                                    <input
                                        type="text"
                                        value={formData.sport}
                                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                        placeholder="Например: Футбол, Баскетбол, Теннис"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Турнир</label>
                                    <input
                                        type="text"
                                        value={formData.tournament}
                                        onChange={(e) => setFormData({ ...formData, tournament: e.target.value })}
                                        placeholder="Например: Чемпионат мира, Лига чемпионов"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Запланированное время</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduledTime}
                                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Статус</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Stream['status'] })}
                                    >
                                        <option value="upcoming">Ожидает</option>
                                        <option value="active">В эфире</option>
                                        <option value="ended">Завершен</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stream URL</label>
                                <input
                                    type="url"
                                    value={formData.streamUrl}
                                    onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                                    placeholder="https://f4u.online/hls/stream1/index.m3u8"
                                    required
                                />
                                <small>Базовый URL: https://f4u.online/hls/</small>
                            </div>

                            <div className="form-group">
                                <label>Fallback URL (опционально)</label>
                                <input
                                    type="url"
                                    value={formData.fallbackUrl}
                                    onChange={(e) => setFormData({ ...formData, fallbackUrl: e.target.value })}
                                    placeholder="https://backup.example.com/stream"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={handleCloseModal}>
                                    Отмена
                                </button>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Сохранение...' : editingStream ? 'Обновить' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreamsManagement;
