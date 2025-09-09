import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../contexts/AdsContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AdData } from '../components/AdBanner';
import MatchModal from '../components/MatchModal';
import { Match } from '../types';
import {
    getStreams,
    getUsers,
    getAds,
    getMatches,
    getReports,
    getHealth,
    createMatch,
    updateMatch as apiUpdateMatch,
    deleteMatch as apiDeleteMatch,
    createAd,
    updateAd as apiUpdateAd,
    deleteAd as apiDeleteAd,
    activateAd,
    deactivateAd,
    CreateAdDto,
    CreateMatchDto
} from '../api';
import './Admin.css';

// ...existing code from Admin.tsx (component logic, state, useEffect, handlers, and return JSX)...
const Admin: React.FC = () => {
    const { addAd, updateAd, deleteAd } = useAds();
    const { matches, addMatch, updateMatch, deleteMatch } = useData();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'matches' | 'ads' | 'users' | 'reports' | 'hls'>('dashboard');
    const [showAdForm, setShowAdForm] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [editingAd, setEditingAd] = useState<AdData | null>(null);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [serverHealth, setServerHealth] = useState<string>('Проверка...');
    const [apiUsers, setApiUsers] = useState<any[]>([]);
    const [apiReports, setApiReports] = useState<any[]>([]);
    const [hlsStreams, setHlsStreams] = useState<any[]>([]);
    const [allAds, setAllAds] = useState<AdData[]>([]);
    const [filteredAds, setFilteredAds] = useState<AdData[]>([]);
    const [adsFilter, setAdsFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [adsSort, setAdsSort] = useState<'priority' | 'title' | 'date'>('priority');
    const [adsLoading, setAdsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        gifUrl: '',
        clickUrl: '',
        type: 'vertical' as 'vertical' | 'square' | 'horizontal',
    });

    // Загружаем данные с API при запуске компонента
    useEffect(() => {
        loadApiData();
    }, []);

    // Фильтрация и сортировка рекламы
    useEffect(() => {
        console.log('Фильтрация рекламы. Всего объявлений:', allAds.length);
        console.log('Все объявления:', allAds);

        let filtered = [...allAds];

        // Применяем фильтр
        if (adsFilter === 'active') {
            filtered = filtered.filter(ad => ad.isActive);
            console.log('После фильтра "активные":', filtered.length);
        } else if (adsFilter === 'inactive') {
            filtered = filtered.filter(ad => !ad.isActive);
            console.log('После фильтра "неактивные":', filtered.length);
        }

        // Применяем сортировку
        filtered.sort((a, b) => {
            switch (adsSort) {
                case 'priority':
                    return (b.priority || 0) - (a.priority || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
                default:
                    return 0;
            }
        });

        console.log('Финальный отфильтрованный список:', filtered);
        setFilteredAds(filtered);
    }, [allAds, adsFilter, adsSort]);

    const loadApiData = async () => {
        setAdsLoading(true);
        try {
            console.log('🔥 Начинаем загрузку данных с API...');

            // Проверяем здоровье сервера
            console.log('🔍 Проверяем здоровье сервера...');
            await getHealth();
            setServerHealth('Онлайн');
            console.log('✅ Сервер в сети');

            // Загружаем все данные
            console.log('📡 Загружаем данные с API...');
            const [streamsRes, usersRes, reportsRes, adsRes] = await Promise.all([
                getStreams().catch(err => {
                    console.error('❌ Ошибка загрузки стримов:', err);
                    return { data: [] };
                }),
                getUsers().catch(err => {
                    console.error('❌ Ошибка загрузки пользователей:', err);
                    return { data: [] };
                }),
                getReports().catch(err => {
                    console.error('❌ Ошибка загрузки отчетов:', err);
                    return { data: [] };
                }),
                getAds().catch(err => {
                    console.error('❌ Ошибка загрузки рекламы:', err);
                    return { data: [] };
                })
            ]);

            console.log('📊 Результаты API запросов:');
            console.log('- Стримы:', streamsRes);
            console.log('- Пользователи:', usersRes);
            console.log('- Отчеты:', reportsRes);
            console.log('- 🎯 РЕКЛАМА:', adsRes);

            setApiUsers(usersRes?.data || []);
            setApiReports(reportsRes?.data || []);
            setHlsStreams([]);

            // Загружаем рекламные объявления с улучшенной обработкой
            console.log('🎯 === ОБРАБОТКА РЕКЛАМЫ ===');
            console.log('🔍 Полный ответ API для рекламы:', JSON.stringify(adsRes, null, 2));

            let adsArray = [];

            // Пробуем разные варианты структуры ответа
            if (adsRes && adsRes.data && Array.isArray(adsRes.data.ads)) {
                console.log('📁 Найден массив в adsRes.data.ads');
                adsArray = adsRes.data.ads;
            } else if (adsRes && Array.isArray(adsRes.data)) {
                console.log('📁 Найден массив в adsRes.data');
                adsArray = adsRes.data;
            } else if (adsRes && Array.isArray(adsRes)) {
                console.log('📁 adsRes сам является массивом');
                adsArray = adsRes;
            } else if (adsRes && adsRes.data && Array.isArray(adsRes.data.data)) {
                console.log('📁 Найден массив в adsRes.data.data');
                adsArray = adsRes.data.data;
            } else {
                console.log('🚨 Не удалось найти массив рекламы. Структура ответа:');
                console.log('🔍 typeof adsRes:', typeof adsRes);
                console.log('🔍 adsRes keys:', adsRes ? Object.keys(adsRes) : 'adsRes is null/undefined');
                if (adsRes && adsRes.data) {
                    console.log('🔍 typeof adsRes.data:', typeof adsRes.data);
                    console.log('🔍 adsRes.data keys:', Object.keys(adsRes.data));
                }
            }

            console.log('📦 Найденный массив рекламы:', adsArray);
            console.log('📏 Длина массива:', adsArray ? adsArray.length : 'undefined');

            if (adsArray && adsArray.length > 0) {
                console.log('✅ Обрабатываем рекламные объявления...');
                console.log('🔍 Первое объявление:', adsArray[0]);

                const adsData = adsArray.map((ad: any, index: number) => {
                    console.log(`🏷️ Обрабатываем объявление ${index + 1}:`, ad);
                    const processed = {
                        id: ad.id || ad._id || `mock-${Date.now()}-${index}`,
                        title: ad.title || 'Без названия',
                        type: ad.type || 'vertical',
                        imageUrl: ad.imageUrl || '',
                        gifUrl: ad.imageUrl || ad.gifUrl || '',
                        clickUrl: ad.clickUrl || '',
                        isActive: ad.status === 'active' || Boolean(ad.isActive !== undefined ? ad.isActive : ad.active),
                        priority: ad.priority || 1,
                        startDate: ad.startDate || new Date().toISOString(),
                        endDate: ad.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        position: ad.position || (ad.type === 'horizontal' ? 'header' : 'sidebar')
                    };
                    console.log(`✅ Обработанное объявление ${index + 1}:`, processed);
                    return processed;
                });

                console.log('🎯 Финальные обработанные данные рекламы:', adsData);
                setAllAds(adsData);
                console.log(`✅ Загружено рекламных объявлений: ${adsData.length}`);
            } else {
                console.log('⚠️ Массив рекламы пустой или не найден');
                setAllAds([]);
                console.log('💭 Возможные причины:');
                console.log('   - Сервер вернул пустой массив');
                console.log('   - Неправильная структура ответа API');
                console.log('   - Ошибка в API запросе');
            }

        } catch (error) {
            console.error('💥 Ошибка загрузки данных с API:', error);
            setServerHealth('Оффлайн');

            // Показываем более подробную информацию об ошибке
            if (error instanceof Error) {
                console.error('📝 Детали ошибки:', error.message);
                console.error('📚 Stack trace:', error.stack);
            }

            // Проверяем, является ли ошибка HTTP ошибкой
            if (error && typeof error === 'object' && 'response' in error) {
                const httpError = error as any;
                console.error('🌐 Ошибка HTTP:', httpError.response?.status);
                console.error('📄 Ответ сервера:', httpError.response?.data);
            }
        } finally {
            setAdsLoading(false);
        }
    };

    const handleSubmitAd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdsLoading(true);
        try {
            const dto: CreateAdDto = {
                title: formData.title,
                type: formData.type,
                position: formData.type === 'horizontal' ? 'header' : 'sidebar',
                imageUrl: formData.imageUrl || formData.gifUrl || '',
                clickUrl: formData.clickUrl || '',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 1,
                targetAudience: 'sports'
            };

            if (editingAd) {
                // Обновляем существующую рекламу через API
                await apiUpdateAd(editingAd.id, dto);
                // Обновляем локальное состояние
                const updatedAd: AdData = {
                    ...editingAd,
                    title: formData.title,
                    type: formData.type,
                    imageUrl: formData.imageUrl,
                    gifUrl: formData.gifUrl,
                    clickUrl: formData.clickUrl,
                    position: dto.position,
                    priority: dto.priority,
                    startDate: dto.startDate,
                    endDate: dto.endDate
                };
                setAllAds(prev => prev.map(ad => ad.id === editingAd.id ? updatedAd : ad));
                setEditingAd(null);
            } else {
                // Создаем новую рекламу через API
                const response = await createAd(dto);
                // Добавляем в локальное состояние
                const newAd: AdData = {
                    id: response.data.id || Date.now().toString(),
                    title: formData.title,
                    type: formData.type,
                    imageUrl: formData.imageUrl,
                    gifUrl: formData.gifUrl,
                    clickUrl: formData.clickUrl,
                    isActive: true,
                    position: dto.position,
                    priority: dto.priority,
                    startDate: dto.startDate,
                    endDate: dto.endDate
                };
                setAllAds(prev => [...prev, newAd]);
            }

            setFormData({ title: '', imageUrl: '', gifUrl: '', clickUrl: '', type: 'vertical' });
            setShowAdForm(false);

            // Обновляем данные с сервера для синхронизации
            await loadApiData();
        } catch (error) {
            console.error('Ошибка при сохранении рекламы:', error);
            alert('Ошибка при сохранении рекламы. Проверьте соединение с сервером.');
        } finally {
            setAdsLoading(false);
        }
    };

    const handleDeleteMatch = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот матч?')) {
            try {
                await apiDeleteMatch(id);
                deleteMatch(id);
                loadApiData();
            } catch (error) {
                console.error('Ошибка при удалении матча:', error);
            }
        }
    };

    const handleMatchSubmit = async (matchData: Omit<Match, 'id'>) => {
        try {
            const dto: CreateMatchDto = {
                homeTeam: typeof matchData.homeTeam === 'string' ? matchData.homeTeam : matchData.homeTeam?.name || matchData.player1,
                awayTeam: typeof matchData.awayTeam === 'string' ? matchData.awayTeam : matchData.awayTeam?.name || matchData.player2,
                date: matchData.date || new Date().toISOString(),
                time: matchData.time || '00:00',
                tournament: matchData.tournament || '',
                sport: matchData.sport || 'football',
                venue: matchData.venue || '',
                status: matchData.status || 'upcoming'
            };

            if (editingMatch) {
                await apiUpdateMatch(editingMatch.id, dto);
                updateMatch(editingMatch.id, matchData);
            } else {
                await createMatch(dto);
                addMatch(matchData);
            }
            setShowMatchModal(false);
            setEditingMatch(null);
            loadApiData();
        } catch (error) {
            console.error('Ошибка при сохранении матча:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDeleteAd = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить это рекламное объявление?')) {
            setAdsLoading(true);
            try {
                // Удаляем через API
                await apiDeleteAd(id);

                // Обновляем локальное состояние
                setAllAds(prev => prev.filter(ad => ad.id !== id));

                // Перезагружаем данные для синхронизации
                await loadApiData();

                console.log('Рекламное объявление успешно удалено');
            } catch (error) {
                console.error('Ошибка при удалении рекламы:', error);
                alert('Ошибка при удалении рекламы. Проверьте соединение с сервером.');
            } finally {
                setAdsLoading(false);
            }
        }
    };

    const handleToggleAd = async (ad: AdData) => {
        setAdsLoading(true);
        try {
            // Переключаем активность через API
            if (ad.isActive) {
                await deactivateAd(ad.id);
            } else {
                await activateAd(ad.id);
            }

            // Обновляем локальное состояние
            const updatedAd = { ...ad, isActive: !ad.isActive };
            setAllAds(prev => prev.map(a => a.id === ad.id ? updatedAd : a));

            // Перезагружаем данные для синхронизации
            await loadApiData();

            console.log(`Реклама ${updatedAd.isActive ? 'активирована' : 'деактивирована'}`);
        } catch (error) {
            console.error('Ошибка при изменении статуса рекламы:', error);
            alert('Ошибка при изменении статуса рекламы. Проверьте соединение с сервером.');
        } finally {
            setAdsLoading(false);
        }
    };

    const handleEditAd = (ad: AdData) => {
        setEditingAd(ad);
        setFormData({
            title: ad.title,
            imageUrl: ad.imageUrl || '',
            gifUrl: ad.gifUrl || '',
            clickUrl: ad.clickUrl || '',
            type: ad.type
        });
        setShowAdForm(true);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-title">
                        <h1>Панель администратора</h1>
                        <p>Управление спортивной платформой</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </div>

            <main className="admin-content">
                {/* Навигация по вкладкам */}
                <div className="tabs-nav">
                    <button
                        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Панель управления
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matches')}
                    >
                        Матчи
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ads')}
                    >
                        Реклама
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Пользователи
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Отчеты
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'hls' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hls')}
                    >
                        HLS Потоки
                    </button>
                </div>

                {/* Контент вкладок */}
                {activeTab === 'dashboard' && (
                    <div className="tab-content">
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

                            <div className="admin-card">
                                <h3>Управление рекламой</h3>
                                <p>Добавление и настройка рекламных баннеров</p>
                                <button
                                    className="admin-btn"
                                    onClick={() => setShowAdForm(true)}
                                >
                                    Открыть
                                </button>
                            </div>
                            <div className="admin-card">
                                <h3>Активная реклама</h3>
                                <p>Быстрый обзор активных объявлений</p>
                                {allAds.filter(a => a.isActive).length === 0 ? (
                                    <div className="empty-state small">
                                        <div className="empty-icon">📢</div>
                                        <p>Нет активной рекламы</p>
                                    </div>
                                ) : (
                                    <ul className="mini-list">
                                        {allAds.filter(a => a.isActive).slice(0, 5).map(ad => (
                                            <li key={ad.id} className="mini-list-item">
                                                <span className="mini-title">{ad.title}</span>
                                                <div className="mini-actions">
                                                    <button className="btn btn-xs" title="Редактировать" onClick={() => { setActiveTab('ads'); handleEditAd(ad); }}>✏️</button>
                                                    <button className="btn btn-xs" title="Выключить" onClick={() => handleToggleAd(ad)}>🔄</button>
                                                    <button className="btn btn-xs btn-danger" title="Удалить" onClick={() => handleDeleteAd(ad.id)}>🗑️</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Системная информация */}
                        <div className="admin-info">
                            <h2>Информация о системе</h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Статус сервера:</span>
                                    <span className={`info-value ${serverHealth === 'Онлайн' ? 'status-online' : 'status-offline'}`}>
                                        {serverHealth}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Всего матчей:</span>
                                    <span className="info-value">{matches.length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Активных потоков:</span>
                                    <span className="info-value">{matches.filter(m => m.isLive).length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">API Пользователи:</span>
                                    <span className="info-value">{apiUsers.length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">API Отчеты:</span>
                                    <span className="info-value">{apiReports.length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">HLS Стримы:</span>
                                    <span className="info-value">{hlsStreams.length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Всего рекламы:</span>
                                    <span className="info-value">{allAds.length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Активной рекламы:</span>
                                    <span className="info-value">{allAds.filter(ad => ad.isActive).length}</span>
                                </div>
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
                                                placeholder="https://example.com/target"
                                            />
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" disabled={adsLoading}>
                                                {adsLoading ? 'Сохранение...' : (editingAd ? 'Обновить' : 'Добавить')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAdForm(false);
                                                    setEditingAd(null);
                                                }}
                                                disabled={adsLoading}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Вкладка управления матчами */}
                {activeTab === 'matches' && (
                    <div className="tab-content">
                        <div className="matches-management">
                            <div className="section-header">
                                <h2>Управление матчами</h2>
                                <button
                                    className="btn btn-primary add-btn"
                                    onClick={() => {
                                        setEditingMatch(null);
                                        setShowMatchModal(true);
                                    }}
                                >
                                    Добавить матч
                                </button>
                            </div>

                            <div className="matches-container">
                                {matches.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📋</div>
                                        <h3>Матчи не найдены</h3>
                                        <p>Создайте первый матч для начала работы</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowMatchModal(true)}
                                        >
                                            Создать матч
                                        </button>
                                    </div>
                                ) : (
                                    <div className="matches-table-container">
                                        <table className="matches-table">
                                            <thead>
                                                <tr>
                                                    <th>Команды</th>
                                                    <th>Турнир</th>
                                                    <th>Дата и время</th>
                                                    <th>Статус</th>
                                                    <th>Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {matches.map((match: Match) => (
                                                    <tr key={match.id} className="match-row">
                                                        <td className="teams-cell">
                                                            <div className="teams-info">
                                                                <span className="team-name">{match.player1}</span>
                                                                <span className="vs-text">против</span>
                                                                <span className="team-name">{match.player2}</span>
                                                            </div>
                                                        </td>
                                                        <td className="tournament-cell">
                                                            <div className="tournament-info">
                                                                <div className="tournament-name">{match.tournament}</div>
                                                                <div className="sport-name">{match.sport}</div>
                                                            </div>
                                                        </td>
                                                        <td className="datetime-cell">
                                                            <div className="datetime-info">
                                                                <div className="date">{new Date(match.date).toLocaleDateString('ru-RU')}</div>
                                                                <div className="time">{match.time}</div>
                                                            </div>
                                                        </td>
                                                        <td className="status-cell">
                                                            <span className={`status-badge ${match.status}`}>
                                                                {match.status === 'live' ? 'В ЭФИРЕ' :
                                                                    match.status === 'upcoming' ? 'Скоро' :
                                                                        match.status === 'finished' ? 'Завершен' : match.status}
                                                            </span>
                                                        </td>
                                                        <td className="actions-cell">
                                                            <div className="actions-group">
                                                                <button
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={() => {
                                                                        setEditingMatch(match);
                                                                        setShowMatchModal(true);
                                                                    }}
                                                                    title="Редактировать матч"
                                                                >
                                                                    Изменить
                                                                </button>
                                                                <button
                                                                    className={`btn btn-sm ${match.status === 'live' ? 'btn-warning' : 'btn-success'}`}
                                                                    onClick={() => {
                                                                        const newStatus = match.status === 'live' ? 'upcoming' : 'live';
                                                                        updateMatch(match.id, { ...match, status: newStatus, isLive: newStatus === 'live' });
                                                                    }}
                                                                    title={match.status === 'live' ? "Остановить трансляцию" : "Начать трансляцию"}
                                                                >
                                                                    {match.status === 'live' ? 'Остановить' : 'Запустить'}
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleDeleteMatch(match.id)}
                                                                    title="Удалить матч"
                                                                >
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Вкладка управления рекламой */}
                {activeTab === 'ads' && (
                    <div className="tab-content">
                        <div className="ads-management">
                            <div className="section-header">
                                <div className="section-title-group">
                                    <h2>Управление рекламой</h2>
                                    <div className="section-sub">
                                        <span>Всего: {allAds.length}</span>
                                        <span> • Активные: {allAds.filter(a => a.isActive).length}</span>
                                        <span> • Неактивные: {allAds.filter(a => !a.isActive).length}</span>
                                    </div>
                                </div>
                                <div className="section-actions">
                                    <button
                                        className="btn"
                                        onClick={() => setAdsFilter('all')}
                                        title="Показать все"
                                    >
                                        Показать все
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => setAdsFilter('active')}
                                        title="Показать активные"
                                    >
                                        Активные
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => setAdsFilter('inactive')}
                                        title="Показать неактивные"
                                    >
                                        Неактивные
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={loadApiData}
                                        disabled={adsLoading}
                                        title="Обновить список"
                                    >
                                        {adsLoading ? 'Обновление...' : 'Обновить'}
                                    </button>
                                    <button
                                        className="btn btn-primary add-btn"
                                        onClick={() => {
                                            setEditingAd(null);
                                            setFormData({ title: '', imageUrl: '', gifUrl: '', clickUrl: '', type: 'vertical' });
                                            setShowAdForm(true);
                                        }}
                                    >
                                        Добавить рекламу
                                    </button>
                                </div>
                            </div>

                            {/* Фильтры и сортировка */}
                            <div className="filters-section">
                                <div className="filter-group">
                                    <label>Фильтр по статусу:</label>
                                    <select
                                        value={adsFilter}
                                        onChange={(e) => setAdsFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                        className="filter-select"
                                    >
                                        <option value="all">Все</option>
                                        <option value="active">Активные</option>
                                        <option value="inactive">Неактивные</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Сортировка:</label>
                                    <select
                                        value={adsSort}
                                        onChange={(e) => setAdsSort(e.target.value as 'priority' | 'title' | 'date')}
                                        className="filter-select"
                                    >
                                        <option value="priority">По приоритету</option>
                                        <option value="title">По названию</option>
                                        <option value="date">По дате создания</option>
                                    </select>
                                </div>
                            </div>

                            <div className="ads-container">
                                {filteredAds.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📢</div>
                                        <h3>Рекламные объявления не найдены</h3>
                                        <p>
                                            {adsFilter === 'active' ? 'Нет активных объявлений' :
                                                adsFilter === 'inactive' ? 'Нет неактивных объявлений' :
                                                'Создайте первое рекламное объявление для начала работы'}
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowAdForm(true)}
                                        >
                                            Создать рекламу
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="ads-table-container">
                                            <table className="ads-table">
                                                <thead>
                                                    <tr>
                                                        <th>Название</th>
                                                        <th>Статус</th>
                                                        <th>Плейсмент</th>
                                                        <th>Даты действия</th>
                                                        <th>Приоритет</th>
                                                        <th>Действия</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAds.map((ad: AdData) => (
                                                        <tr key={ad.id} className="ad-row">
                                                            <td className="title-cell">
                                                                <div className="ad-title-info">
                                                                    <span className="ad-title">{ad.title}</span>
                                                                    <div className="ad-preview">
                                                                        {(ad.imageUrl || ad.gifUrl) && (
                                                                            <img
                                                                                src={ad.imageUrl || ad.gifUrl}
                                                                                alt={ad.title}
                                                                                className="ad-thumbnail"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="status-cell">
                                                                <span className={`status-badge ${ad.isActive ? 'active' : 'inactive'}`}>
                                                                    {ad.isActive ? '✅ Активна' : '❌ Неактивна'}
                                                                </span>
                                                            </td>
                                                            <td className="placement-cell">
                                                                <div className="placement-info">
                                                                    <div className="placement-type">{ad.type}</div>
                                                                    <div className="placement-position">{ad.position || 'Не указано'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="dates-cell">
                                                                <div className="dates-info">
                                                                    <div className="start-date">
                                                                        С: {ad.startDate ? new Date(ad.startDate).toLocaleDateString('ru-RU') : 'Не указано'}
                                                                    </div>
                                                                    <div className="end-date">
                                                                        До: {ad.endDate ? new Date(ad.endDate).toLocaleDateString('ru-RU') : 'Не указано'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="priority-cell">
                                                                <span className="priority-value">{ad.priority || 1}</span>
                                                            </td>
                                                            <td className="actions-cell">
                                                                <div className="actions-group">
                                                                    <button
                                                                        className="btn btn-outline btn-sm"
                                                                        onClick={() => handleEditAd(ad)}
                                                                        title="Редактировать рекламу"
                                                                        disabled={adsLoading}
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        className={`btn btn-sm ${ad.isActive ? 'btn-warning' : 'btn-success'}`}
                                                                        onClick={() => handleToggleAd(ad)}
                                                                        title={ad.isActive ? "Деактивировать" : "Активировать"}
                                                                        disabled={adsLoading}
                                                                    >
                                                                        🔄
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => handleDeleteAd(ad.id)}
                                                                        title="Удалить рекламу"
                                                                        disabled={adsLoading}
                                                                    >
                                                                        ❌
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="ads-cards-container mobile-only">
                                            {filteredAds.map((ad: AdData) => (
                                                <div key={ad.id} className="ad-card">
                                                    <div className="ad-card-header">
                                                        <h4 className="ad-card-title">{ad.title}</h4>
                                                        <span className={`ad-card-status status-badge ${ad.isActive ? 'active' : 'inactive'}`}>
                                                            {ad.isActive ? '✅' : '❌'}
                                                        </span>
                                                    </div>

                                                    {(ad.imageUrl || ad.gifUrl) && (
                                                        <div className="ad-card-preview">
                                                            <img
                                                                src={ad.imageUrl || ad.gifUrl}
                                                                alt={ad.title}
                                                                className="ad-thumbnail"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="ad-card-info">
                                                        <div className="ad-card-info-item">
                                                            <span className="ad-card-info-label">Тип:</span>
                                                            <span className="ad-card-info-value">{ad.type}</span>
                                                        </div>
                                                        <div className="ad-card-info-item">
                                                            <span className="ad-card-info-label">Приоритет:</span>
                                                            <span className="ad-card-info-value">{ad.priority || 1}</span>
                                                        </div>
                                                        <div className="ad-card-info-item">
                                                            <span className="ad-card-info-label">Период:</span>
                                                            <span className="ad-card-info-value">
                                                                {ad.startDate ? new Date(ad.startDate).toLocaleDateString('ru-RU') : 'Не указано'}
                                                                {' - '}
                                                                {ad.endDate ? new Date(ad.endDate).toLocaleDateString('ru-RU') : 'Не указано'}
                                                            </span>
                                                        </div>
                                                        <div className="ad-card-info-item">
                                                            <span className="ad-card-info-label">Плейсмент:</span>
                                                            <span className="ad-card-info-value">{ad.position || 'Не указано'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="ad-card-actions">
                                                        <button
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleEditAd(ad)}
                                                            disabled={adsLoading}
                                                        >
                                                            ✏️ Изменить
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${ad.isActive ? 'btn-warning' : 'btn-success'}`}
                                                            onClick={() => handleToggleAd(ad)}
                                                            disabled={adsLoading}
                                                        >
                                                            🔄 {ad.isActive ? 'Деактивировать' : 'Активировать'}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDeleteAd(ad.id)}
                                                            disabled={adsLoading}
                                                        >
                                                            ❌ Удалить
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Вкладка управления пользователями */}
                {activeTab === 'users' && (
                    <div className="tab-content">
                        <div className="users-management">
                            <h2>Управление пользователями</h2>
                            {apiUsers.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">👥</div>
                                    <h3>Пользователи не найдены</h3>
                                    <p>Пользователи появятся после регистрации на платформе</p>
                                </div>
                            ) : (
                                <div className="users-list">
                                    {apiUsers.map((user, index) => (
                                        <div key={index} className="user-card">
                                            <div className="user-info">
                                                <h4>{user.name || user.username || `Пользователь ${index + 1}`}</h4>
                                                <p>{user.email || 'Email не указан'}</p>
                                                <p>Роль: {user.role || 'user'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Вкладка управления отчетами */}
                {activeTab === 'reports' && (
                    <div className="tab-content">
                        <div className="reports-management">
                            <h2>Отчеты системы</h2>
                            {apiReports.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📊</div>
                                    <h3>Отчеты не найдены</h3>
                                    <p>Отчеты будут генерироваться автоматически</p>
                                </div>
                            ) : (
                                <div className="reports-list">
                                    {apiReports.map((report, index) => (
                                        <div key={index} className="report-card">
                                            <h4>{report.title || `Отчет ${index + 1}`}</h4>
                                            <p>{report.description || 'Описание отсутствует'}</p>
                                            <small>{report.date || 'Дата не указана'}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Вкладка управления HLS потоками */}
                {activeTab === 'hls' && (
                    <div className="tab-content">
                        <div className="hls-management">
                            <h2>HLS Потоки</h2>
                            {hlsStreams.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📹</div>
                                    <h3>HLS потоки не найдены</h3>
                                    <p>Потоки будут отображаться здесь при их активации</p>
                                </div>
                            ) : (
                                <div className="streams-list">
                                    {hlsStreams.map((stream, index) => (
                                        <div key={index} className="stream-card">
                                            <h4>{stream.title || `Поток ${index + 1}`}</h4>
                                            <p>URL: {stream.url}</p>
                                            <p>Статус: {stream.status || 'активен'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
