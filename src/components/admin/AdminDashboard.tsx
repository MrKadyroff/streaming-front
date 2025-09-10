import React from 'react';
import SystemInfo from './SystemInfo';
import { BannerData } from '../PromoBanner';
import { Match } from '../../types';
import './AdminDashboard.css';

interface AdminDashboardProps {
    serverHealth: string;
    matches: Match[];
    apiUsers: any[];
    apiReports: any[];
    hlsStreams: any[];
    allStreams?: any[];
    allAds: BannerData[];
    onOpenMatchModal: () => void;
    onOpenAdForm: () => void;
    onOpenStreamsTab?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    serverHealth,
    matches,
    apiUsers,
    apiReports,
    hlsStreams,
    allStreams = [],
    allAds,
    onOpenMatchModal,
    onOpenAdForm,
    onOpenStreamsTab
}) => {
    return (
        <div className="tab-content">
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Управление матчами</h3>
                    <p>Добавление и редактирование спортивных событий</p>
                    <div className="card-stats">
                        <span>Всего матчей: {matches.length}</span>
                    </div>
                    <button
                        className="dashboard-btn"
                        onClick={onOpenMatchModal}
                    >
                        Открыть
                    </button>
                </div>

                <div className="dashboard-card">
                    <h3>Управление эфирами</h3>
                    <p>Запуск и контроль трансляций</p>
                    <div className="card-stats">
                        <span>Активных эфиров: {allStreams.filter(s => s.status === 'active').length}</span>
                        <span>Всего эфиров: {allStreams.length}</span>
                    </div>
                    <button
                        className="dashboard-btn"
                        onClick={onOpenStreamsTab}
                    >
                        Открыть
                    </button>
                </div>

                <div className="dashboard-card">
                    <h3>Управление рекламой</h3>
                    <p>Добавление и настройка рекламных баннеров</p>
                    <div className="card-stats">
                        <span>Активной рекламы: {allAds.filter(ad => ad.isActive).length}</span>
                        <span>Всего баннеров: {allAds.length}</span>
                    </div>
                    <button
                        className="dashboard-btn"
                        onClick={onOpenAdForm}
                    >
                        Открыть
                    </button>
                </div>
            </div>

            <SystemInfo
                serverHealth={serverHealth}
                matches={matches}
                apiUsers={apiUsers}
                apiReports={apiReports}
                hlsStreams={hlsStreams}
                allAds={allAds}
            />
        </div>
    );
};

export default AdminDashboard;
