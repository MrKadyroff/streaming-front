import React from 'react';
import { BannerData } from '../PromoBanner';
import './AdsManagement.css';

interface AdsManagementProps {
    allAds: BannerData[];
    filteredAds: BannerData[];
    adsFilter: 'all' | 'active' | 'inactive';
    adsSort: 'priority' | 'title' | 'date';
    adsLoading: boolean;
    onAddAd: () => void;
    onEditAd: (banner: BannerData) => void;
    onDeleteAd: (id: string) => void;
    onToggleAd: (banner: BannerData) => void;
    onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
    onSortChange: (sort: 'priority' | 'title' | 'date') => void;
}

const AdsManagement: React.FC<AdsManagementProps> = ({
    allAds,
    filteredAds,
    adsFilter,
    adsSort,
    adsLoading,
    onAddAd,
    onEditAd,
    onDeleteAd,
    onToggleAd,
    onFilterChange,
    onSortChange
}) => {
    return (
        <div className="tab-content">
            <div className="banners-management">
                <div className="section-header">
                    <h2>Управление рекламой</h2>
                    <button
                        className="btn btn-primary add-btn"
                        onClick={onAddAd}
                    >
                        Добавить рекламу
                    </button>
                </div>

                {/* Отладочная информация - убираем в продакшене */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="debug-info" style={{
                        padding: '10px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontSize: '12px'
                    }}>
                        <strong>Отладка:</strong><br />
                        Всего объявлений: {allAds.length}<br />
                        Отфильтровано: {filteredAds.length}<br />
                        Текущий фильтр: {adsFilter}<br />
                        Сортировка: {adsSort}<br />
                        Состояние загрузки: {adsLoading ? 'Загружается...' : 'Готово'}
                    </div>
                )}

                {/* Фильтры и сортировка */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label htmlFor="adsFilter">Показать:</label>
                        <select
                            id="adsFilter"
                            value={adsFilter}
                            onChange={(e) => onFilterChange(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="all">Все объявления</option>
                            <option value="active">Активные</option>
                            <option value="inactive">Неактивные</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="adsSort">Сортировка:</label>
                        <select
                            id="adsSort"
                            value={adsSort}
                            onChange={(e) => onSortChange(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="priority">По приоритету</option>
                            <option value="title">По названию</option>
                            <option value="date">По дате</option>
                        </select>
                    </div>
                </div>

                {/* Список рекламы */}
                <div className="banners-container">
                    {adsLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Загрузка рекламных объявлений...</p>
                        </div>
                    ) : filteredAds.length === 0 ? (
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
                                onClick={onAddAd}
                            >
                                Создать объявление
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table view */}
                            <div className="banners-table-container desktop-only">
                                <table className="banners-table">
                                    <thead>
                                        <tr>
                                            <th>Превью</th>
                                            <th>Название</th>
                                            <th>Тип</th>
                                            <th>Статус</th>
                                            <th>Приоритет</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAds.map((ad: BannerData) => (
                                            <tr key={ad.id} className="banner-row">
                                                <td className="preview-cell">
                                                    <div className="banner-preview">
                                                        {(ad.imageUrl || ad.gifUrl) ? (
                                                            <img
                                                                src={ad.gifUrl || ad.imageUrl}
                                                                alt={ad.title}
                                                                className="preview-image"
                                                            />
                                                        ) : (
                                                            <div className="preview-placeholder">
                                                                <span>Нет изображения</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="title-cell">
                                                    <div className="banner-title">{ad.title}</div>
                                                    {ad.clickUrl && (
                                                        <div className="banner-url" title={ad.clickUrl}>
                                                            {ad.clickUrl.length > 50 ?
                                                                `${ad.clickUrl.substring(0, 50)}...` :
                                                                ad.clickUrl
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="type-cell">
                                                    <span className={`type-badge ${ad.type}`}>
                                                        {ad.type === 'vertical' ? 'Вертикальный' :
                                                            ad.type === 'square' ? 'Квадратный' :
                                                                ad.type === 'horizontal' ? 'Горизонтальный' : ad.type}
                                                    </span>
                                                </td>
                                                <td className="status-cell">
                                                    <span className={`status-badge ${ad.isActive ? 'active' : 'inactive'}`}>
                                                        {ad.isActive ? 'Активна' : 'Неактивна'}
                                                    </span>
                                                </td>
                                                <td className="priority-cell">
                                                    <span className="priority-value">{ad.priority || 1}</span>
                                                </td>
                                                <td className="actions-cell">
                                                    <div className="actions-group">
                                                        <button
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => onEditAd(ad)}
                                                            disabled={adsLoading}
                                                            title="Редактировать объявление"
                                                        >
                                                            Изменить
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${ad.isActive ? 'btn-warning' : 'btn-success'}`}
                                                            onClick={() => onToggleAd(ad)}
                                                            disabled={adsLoading}
                                                            title={ad.isActive ? 'Деактивировать' : 'Активировать'}
                                                        >
                                                            {ad.isActive ? 'Отключить' : 'Включить'}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => onDeleteAd(ad.id)}
                                                            disabled={adsLoading}
                                                            title="Удалить объявление"
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

                            {/* Mobile card view */}
                            <div className="banners-cards-container mobile-only">
                                {filteredAds.map((ad: BannerData) => (
                                    <div key={ad.id} className="banner-card">
                                        <div className="banner-card-header">
                                            <div className="banner-card-title">{ad.title}</div>
                                            <span className={`status-badge ${ad.isActive ? 'active' : 'inactive'}`}>
                                                {ad.isActive ? 'Активна' : 'Неактивна'}
                                            </span>
                                        </div>

                                        <div className="banner-card-content">
                                            <div className="banner-card-preview">
                                                {(ad.imageUrl || ad.gifUrl) ? (
                                                    <img
                                                        src={ad.gifUrl || ad.imageUrl}
                                                        alt={ad.title}
                                                        className="preview-image"
                                                    />
                                                ) : (
                                                    <div className="preview-placeholder">
                                                        <span>Нет изображения</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="banner-card-info">
                                                <div className="info-row">
                                                    <span className="info-label">Тип:</span>
                                                    <span className={`type-badge ${ad.type}`}>
                                                        {ad.type === 'vertical' ? 'Вертикальный' :
                                                            ad.type === 'square' ? 'Квадратный' :
                                                                ad.type === 'horizontal' ? 'Горизонтальный' : ad.type}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Приоритет:</span>
                                                    <span className="priority-value">{ad.priority || 1}</span>
                                                </div>
                                                {ad.clickUrl && (
                                                    <div className="info-row">
                                                        <span className="info-label">Ссылка:</span>
                                                        <span className="banner-url">{ad.clickUrl}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="banner-card-actions">
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => onEditAd(ad)}
                                                disabled={adsLoading}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                className={`btn btn-sm ${ad.isActive ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => onToggleAd(ad)}
                                                disabled={adsLoading}
                                            >
                                                {ad.isActive ? 'Отключить' : 'Включить'}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => onDeleteAd(ad.id)}
                                                disabled={adsLoading}
                                            >
                                                Удалить
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
    );
};

export default AdsManagement;
