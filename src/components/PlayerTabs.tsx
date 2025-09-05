import React from 'react';
import { Match } from '../types';
import Player from './Player';
import './PlayerTabs.css';

interface PlayerTabsProps {
    match: Match;
    onClose?: () => void;
}

const PlayerTabs: React.FC<PlayerTabsProps> = ({ match, onClose }) => {
    return (
        <div className="player-tabs">
            <div className="player-tabs-header">
                <h2 className="match-title">
                    {match.player1} vs {match.player2}
                </h2>
                {onClose && (
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                )}
            </div>

            <div className="player-container">
                {match.streamUrl ? (
                    <Player
                        primarySrc={match.streamUrl}
                        fallbackSrc={match.fallbackUrl}
                    />
                ) : (
                    <div className="no-stream">
                        <p>Поток недоступен</p>
                        <span>Трансляция этого матча в данный момент не ведется</span>
                    </div>
                )}
            </div>

            <div className="match-details">
                <div className="detail-item">
                    <span className="label">Турнир:</span>
                    <span className="value">{match.tournament}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Дата:</span>
                    <span className="value">{new Date(match.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Время:</span>
                    <span className="value">{match.time}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Статус:</span>
                    <span className={`value status ${match.status}`}>
                        {match.isLive ? 'В эфире' : 'Запланирован'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlayerTabs;
