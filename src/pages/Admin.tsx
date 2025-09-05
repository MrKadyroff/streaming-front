import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../contexts/AdsContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AdData } from '../components/AdBanner';
import MatchModal from '../components/MatchModal';
import { Match } from '../types';
import './Admin.css';

const Admin: React.FC = () => {
    const { ads, addAd, updateAd, deleteAd, toggleAdStatus } = useAds();
    const { matches, addMatch, updateMatch, deleteMatch, toggleMatchStatus } = useData();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showAdForm, setShowAdForm] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [editingAd, setEditingAd] = useState<AdData | null>(null);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        gifUrl: '',
        clickUrl: '',
        type: 'vertical' as 'vertical' | 'square' | 'horizontal',
    });

    const handleSubmitAd = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAd) {
            updateAd(editingAd.id, { ...formData, isActive: editingAd.isActive });
            setEditingAd(null);
        } else {
            addAd({ ...formData, isActive: true });
        }
        setFormData({ title: '', imageUrl: '', gifUrl: '', clickUrl: '', type: 'vertical' });
        setShowAdForm(false);
    };

    const handleEdit = (ad: AdData) => {
        setEditingAd(ad);
        setFormData({
            title: ad.title,
            imageUrl: ad.imageUrl || '',
            gifUrl: ad.gifUrl || '',
            clickUrl: ad.clickUrl || '',
            type: ad.type,
        });
        setShowAdForm(true);
    };

    const handleMatchSubmit = (matchData: Omit<Match, 'id'>) => {
        if (editingMatch) {
            updateMatch(editingMatch.id, matchData);
        } else {
            addMatch(matchData);
        }
        setEditingMatch(null);
        setShowMatchModal(false);
    };

    const handleEditMatch = (match: Match) => {
        setEditingMatch(match);
        setShowMatchModal(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-title">
                        <h1>Административная панель</h1>
                        <p>Управление контентом и настройками</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </div>

            <main className="admin-content">
                <div className="admin-grid">
                    <div className="admin-card">
                        <h3>Управление матчами</h3>
                        <p>Добавление и редактирование спортивных событий</p>
                        <button
                            className="admin-btn"
                            onClick={() => setShowMatchModal(true)}
                        >
                            Открыть
                        </button>
                    </div>

                    {/* <div className="admin-card">
                        <h3>Управление потоками</h3>
                        <p>Настройка ссылок на видео трансляции</p>
                        <button className="admin-btn">Открыть</button>
                    </div>

                    <div className="admin-card">
                        <h3>� Управление турнирами</h3>
                        <p>Создание и настройка турниров</p>
                        <button className="admin-btn">Открыть</button>
                    </div>

                    <div className="admin-card">
                        <h3>� Статистика</h3>
                        <p>Просмотр аналитики и метрик</p>
                        <button className="admin-btn">Открыть</button>
                    </div>

                    <div className="admin-card">
                        <h3>� Пользователи</h3>
                        <p>Управление пользователями системы</p>
                        <button className="admin-btn">Открыть</button>
                    </div> */}

                    <div className="admin-card">
                        <h3>� Управление рекламой</h3>
                        <p>Добавление и настройка рекламных баннеров</p>
                        <button
                            className="admin-btn"
                            onClick={() => setShowAdForm(true)}
                        >
                            Открыть
                        </button>
                    </div>
                </div>

                {/* Match Modal */}
                <MatchModal
                    isOpen={showMatchModal}
                    onClose={() => {
                        setShowMatchModal(false);
                        setEditingMatch(null);
                    }}
                    onSubmit={handleMatchSubmit}
                    editMatch={editingMatch}
                />

                {/* Ads Management Section */}
                {showAdForm && (
                    <div className="admin-modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{editingAd ? 'Редактировать рекламу' : 'Добавить рекламу'}</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        setShowAdForm(false);
                                        setEditingAd(null);
                                        setFormData({ title: '', imageUrl: '', gifUrl: '', clickUrl: '', type: 'vertical' });
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitAd} className="ad-form">
                                <div className="form-group">
                                    <label>Название:</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Тип баннера:</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                    >
                                        <option value="vertical">Вертикальный (160x600)</option>
                                        <option value="square">Квадратный (160x160)</option>
                                        <option value="horizontal">Горизонтальный (728x90)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>URL изображения:</label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>URL GIF:</label>
                                    <input
                                        type="url"
                                        value={formData.gifUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, gifUrl: e.target.value }))}
                                        placeholder="https://example.com/animation.gif"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ссылка при клике:</label>
                                    <input
                                        type="url"
                                        value={formData.clickUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clickUrl: e.target.value }))}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingAd ? 'Обновить' : 'Добавить'}
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowAdForm(false);
                                            setEditingAd(null);
                                        }}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Matches List */}
                <div className="admin-info">
                    <h2>Спортивные матчи</h2>
                    <div className="matches-list">
                        {matches.map(match => (
                            <div key={match.id} className="match-item">
                                <div className="match-info">
                                    <div className="match-title">
                                        {match.player1} vs {match.player2}
                                    </div>
                                    <div className="match-details">
                                        {match.tournament} | {match.date} {match.time} |
                                        <span className={`match-status ${match.status}`}>
                                            {match.status === 'live' ? 'В эфире' :
                                                match.status === 'upcoming' ? 'Предстоящий' : 'Завершен'}
                                        </span>
                                    </div>
                                </div>
                                <div className="match-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditMatch(match)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleMatchStatus(match.id)}
                                    >
                                        {match.isLive ? '⏸️' : '▶️'}
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteMatch(match.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Matches List */}
                <div className="admin-info">
                    <h2>Управление матчами</h2>
                    <div className="matches-list">
                        {matches.map(match => (
                            <div key={match.id} className="match-item">
                                <div className="match-info">
                                    <div className="match-title">
                                        {match.player1} vs {match.player2}
                                    </div>
                                    <div className="match-details">
                                        <span className="match-tournament">{match.tournament}</span>
                                        <span className="match-datetime">{match.date} в {match.time}</span>
                                        <span className={`match-status ${match.status}`}>
                                            {match.status === 'live' ? 'В эфире' :
                                                match.status === 'upcoming' ? 'Предстоящий' : 'Завершен'}
                                        </span>
                                    </div>
                                </div>
                                <div className="match-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditMatch(match)}
                                        title="Редактировать матч"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleMatchStatus(match.id)}
                                        title="Переключить статус"
                                    >
                                        {match.isLive ? '⏸️' : '▶️'}
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteMatch(match.id)}
                                        title="Удалить матч"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ads List */}
                <div className="admin-info">
                    <h2>� Рекламные баннеры</h2>
                    <div className="ads-list">
                        {ads.map(ad => (
                            <div key={ad.id} className="ad-item">
                                <div className="ad-info">
                                    <div className="ad-title">{ad.title}</div>
                                    <div className="ad-type">{ad.type} ({ad.isActive ? 'Активен' : 'Неактивен'})</div>
                                </div>
                                <div className="ad-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(ad)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleAdStatus(ad.id)}
                                    >
                                        {ad.isActive ? '⏸️' : '▶️'}
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteAd(ad.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-info">
                    <h2>Информация о системе</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Версия:</span>
                            <span className="info-value">1.0.0</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Активных потоков:</span>
                            <span className="info-value">{matches.filter(m => m.isLive).length}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Всего матчей:</span>
                            <span className="info-value">{matches.length}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Статус сервера:</span>
                            <span className="info-value status-online">Онлайн</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
