import React, { useState, useEffect } from 'react';
import { getHlsStreams, createStream, updateStream, deleteStream } from '../api';
import './HlsManagement.css';

interface HlsStream {
    id: string;
    name: string;
    url: string;
    status: string;
    quality: string;
    bitrate: number;
    viewers: number;
    createdAt: string;
    updatedAt: string;
}

const HlsManagement: React.FC = () => {
    const [streams, setStreams] = useState<HlsStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStream, setEditingStream] = useState<HlsStream | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        status: 'offline',
        quality: '720p',
        bitrate: 2000
    });

    useEffect(() => {
        loadStreams();
    }, []);

    const loadStreams = async () => {
        try {
            setLoading(true);
            const response = await getHlsStreams();
            setStreams(response.data);
        } catch (error) {
            console.error('Ошибка загрузки HLS потоков:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const streamDto = {
                title: formData.name,
                streamUrl: formData.url,
                status: formData.status,
                quality: [formData.quality]
            };

            if (editingStream) {
                await updateStream(editingStream.id, streamDto);
            } else {
                await createStream(streamDto);
            }
            setFormData({ name: '', url: '', status: 'offline', quality: '720p', bitrate: 2000 });
            setShowForm(false);
            setEditingStream(null);
            loadStreams();
        } catch (error) {
            console.error('Ошибка сохранения HLS потока:', error);
        }
    };

    const handleEdit = (stream: HlsStream) => {
        setEditingStream(stream);
        setFormData({
            name: stream.name,
            url: stream.url,
            status: stream.status,
            quality: stream.quality,
            bitrate: stream.bitrate
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Удалить HLS поток?')) {
            try {
                await deleteStream(id);
                loadStreams();
            } catch (error) {
                console.error('Ошибка удаления HLS потока:', error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return '#28a745';
            case 'offline': return '#6c757d';
            case 'error': return '#dc3545';
            case 'starting': return '#ffc107';
            default: return '#6c757d';
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case '1080p': return '#6f42c1';
            case '720p': return '#007bff';
            case '480p': return '#17a2b8';
            case '360p': return '#28a745';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return <div className="loading">Загрузка HLS потоков...</div>;
    }

    return (
        <div className="hls-management">
            <div className="hls-header">
                <h2>Управление HLS потоками</h2>
                <button
                    className="add-btn"
                    onClick={() => setShowForm(true)}
                >
                    Добавить поток
                </button>
            </div>

            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingStream ? 'Редактировать' : 'Добавить'} HLS поток</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingStream(null);
                                    setFormData({ name: '', url: '', status: 'offline', quality: '720p', bitrate: 2000 });
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Название потока:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL потока:</label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://example.com/stream.m3u8"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Статус:</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="offline">Оффлайн</option>
                                        <option value="live">В эфире</option>
                                        <option value="starting">Запуск</option>
                                        <option value="error">Ошибка</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Качество:</label>
                                    <select
                                        value={formData.quality}
                                        onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value }))}
                                    >
                                        <option value="360p">360p</option>
                                        <option value="480p">480p</option>
                                        <option value="720p">720p</option>
                                        <option value="1080p">1080p</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Битрейт (kbps):</label>
                                <input
                                    type="number"
                                    value={formData.bitrate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bitrate: parseInt(e.target.value) }))}
                                    min="500"
                                    max="10000"
                                    step="100"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit">
                                    {editingStream ? 'Обновить' : 'Создать'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingStream(null);
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="streams-list">
                {streams.length === 0 ? (
                    <div className="no-streams">HLS потоки не найдены</div>
                ) : (
                    <div className="streams-grid">
                        {streams.map(stream => (
                            <div key={stream.id} className="stream-card">
                                <div className="stream-header">
                                    <h3 className="stream-name">{stream.name}</h3>
                                    <div className="stream-indicators">
                                        <span
                                            className="stream-status"
                                            style={{ backgroundColor: getStatusColor(stream.status) }}
                                        >
                                            {stream.status}
                                        </span>
                                        <span
                                            className="stream-quality"
                                            style={{ backgroundColor: getQualityColor(stream.quality) }}
                                        >
                                            {stream.quality}
                                        </span>
                                    </div>
                                </div>

                                <div className="stream-info">
                                    <div className="stream-url">
                                        <strong>URL:</strong>
                                        <a href={stream.url} target="_blank" rel="noopener noreferrer">
                                            {stream.url}
                                        </a>
                                    </div>
                                    <div className="stream-stats">
                                        <div className="stat">
                                            <span className="stat-label">Битрейт:</span>
                                            <span className="stat-value">{stream.bitrate} kbps</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Зрители:</span>
                                            <span className="stat-value">{stream.viewers}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="stream-dates">
                                    <p><strong>Создан:</strong> {new Date(stream.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Обновлен:</strong> {new Date(stream.updatedAt).toLocaleDateString()}</p>
                                </div>

                                <div className="stream-actions">
                                    <button
                                        className="play-btn"
                                        onClick={() => window.open(stream.url, '_blank')}
                                        disabled={stream.status !== 'live'}
                                    >
                                        ▶️ Воспроизвести
                                    </button>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(stream)}
                                    >
                                        ✏️ Редактировать
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(stream.id)}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HlsManagement;
