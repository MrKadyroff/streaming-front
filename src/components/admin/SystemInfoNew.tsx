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
        <div className="system-info">
            <h3>Информация о системе</h3>

            <div className="info-grid">
                <div className="info-card">
                    <div className="info-value">{serverHealth}</div>
                    <div className="info-label">Статус сервера</div>
                </div>

                <div className="info-card">
                    <div className="info-value">{matches.length}</div>
                    <div className="info-label">Всего матчей</div>
                </div>

                <div className="info-card">
                    <div className="info-value">{apiUsers.length}</div>
                    <div className="info-label">Пользователи</div>
                </div>

                <div className="info-card">
                    <div className="info-value">{apiReports.length}</div>
                    <div className="info-label">Отчеты</div>
                </div>

                <div className="info-card">
                    <div className="info-value">{hlsStreams.length}</div>
                    <div className="info-label">HLS потоки</div>
                </div>

                <div className="info-card">
                    <div className="info-value">{allAds.length}</div>
                    {/* <div className="info-label">Реклама</div> */}
                </div>
            </div>
        </div>
    );
};

export default SystemInfo;
