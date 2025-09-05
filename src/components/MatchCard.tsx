import React from 'react';
import { Match } from '../types';
import './MatchCard.css';

interface MatchCardProps {
    match: Match;
    onClick: (match: Match) => void;
    className?: string;
    isSelected?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, className = '', isSelected = false }) => {
    const formatTime = (time: string) => {
        return time.slice(0, 5); // HH:MM
    };

    const formatDate = (date: string) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getSportIcon = (sport: string): string => {
        return '';
    };

    return (
        <div
            className={`match-card ${match.isLive ? 'live' : ''} ${isSelected ? 'selected' : ''} ${className}`}
            onClick={() => onClick(match)}
            data-sport={match.sport}
        >
            <div className="match-header">
                <div className="sport-info">
                    <span className="sport-icon">{getSportIcon(match.sport)}</span>
                    <span className="tournament">{match.tournament}</span>
                </div>
                {match.isLive && <div className="live-indicator">LIVE</div>}
            </div>

            <div className="match-main">
                <div className="players">
                    <div className="player player1">
                        {match.sport === 'football' && match.homeTeam?.logo ? (
                            <div className="team-with-logo">
                                <img
                                    src={match.homeTeam.logo}
                                    alt={match.homeTeam.shortName}
                                    className="team-logo-small"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <span className="player-name">{match.homeTeam.shortName || match.player1}</span>
                            </div>
                        ) : (
                            <span className="player-name">{match.player1}</span>
                        )}
                    </div>
                    <div className="vs">VS</div>
                    <div className="player player2">
                        {match.sport === 'football' && match.awayTeam?.logo ? (
                            <div className="team-with-logo">
                                <span className="player-name">{match.awayTeam.shortName || match.player2}</span>
                                <img
                                    src={match.awayTeam.logo}
                                    alt={match.awayTeam.shortName}
                                    className="team-logo-small"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        ) : (
                            <span className="player-name">{match.player2}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="match-footer">
                <div className="match-time">
                    <span className="date">{formatDate(match.date)}</span>
                    <span className="time">{formatTime(match.time)}</span>
                </div>
                <button className="watch-btn">
                    {match.isLive ? 'СМОТРЕТЬ' : 'РАСПИСАНИЕ'}
                </button>
            </div>
        </div>
    );
};

export default MatchCard;
