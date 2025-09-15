import React from 'react';
import { BannerData } from '../PromoBanner';
import { Match } from '../../types';

interface SystemInfoProps {
    serverHealth: string;
    matches: Match[];
    apiUsers: any[];
    apiReports: any[];
    hlsStreams: any[];
    allAds: BannerData[];
}

const SystemInfo: React.FC<SystemInfoProps> = ({
    serverHealth,
    matches,
    apiUsers,
    apiReports,
    hlsStreams,
    allAds
}) => {
    return (
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
                {/* <div className="info-item">
                    <span className="info-label">API Отчеты:</span>
                    <span className="info-value">{apiReports.length}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">HLS Стримы:</span>
                    <span className="info-value">{hlsStreams.length}</span>
                </div> */}
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
    );
};

export default SystemInfo;
