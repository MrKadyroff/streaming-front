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
    allAds: BannerData[];
    onOpenMatchModal: () => void;
    onOpenAdForm: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    serverHealth,
    matches,
    apiUsers,
    apiReports,
    hlsStreams,
    allAds,
    onOpenMatchModal,
    onOpenAdForm
}) => {
    return (
        <div className="tab-content">
            <div className="admin-grid">
                <div className="admin-card">
                    <h3>Управление матчами</h3>
                    <p>Добавление и редактирование спортивных событий</p>
                    <button
                        className="admin-btn"
                        onClick={onOpenMatchModal}
                    >
                        Открыть
                    </button>
                </div>

                <div className="admin-card">
                    <h3>Управление рекламой</h3>
                    <p>Добавление и настройка рекламных баннеров</p>
                    <button
                        className="admin-btn"
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
