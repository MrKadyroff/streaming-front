import React from 'react';
import { Match } from '../types';
import './ModernMatchCard.css';

interface ModernMatchCardProps {
    match: Match;
    onClick: (match: Match) => void;
    isSelected?: boolean;
    variant?: 'default' | 'compact' | 'featured';
}

const ModernMatchCard: React.FC<ModernMatchCardProps> = ({
    match,
    onClick,
    isSelected = false,
    variant = 'default'
}) => {
    const handleClick = () => {
        onClick(match);
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5); // HH:MM
    };

    const getStatusBadge = () => {
        if (match.isLive) {
            return (
                <div className="status-badge live">
                    <div className="live-indicator" />
                    <span>LIVE</span>
                </div>
            );
        }
        return (
            <div className="status-badge upcoming">
                <span>{formatTime(match.time)}</span>
            </div>
        );
    };

    const getScore = () => {
        if (match.score && match.isLive) {
            return (
                <div className="match-score">
                    <span>{match.score.home ?? 0}</span>
                    <span className="score-separator">-</span>
                    <span>{match.score.away ?? 0}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={`modern-match-card ${variant} ${isSelected ? 'selected' : ''} ${match.isLive ? 'live' : ''}`}
            onClick={handleClick}
        >
            <div className="card-header">
                <div className="tournament-badge">
                    {match.tournament}
                </div>
                {getStatusBadge()}
            </div>

            <div className="teams-container">
                <div className="team home-team">
                    <div className="team-logo-container">
                        {match.homeTeam?.logo ? (
                            <img
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.shortName}
                                className="team-logo"
                            />
                        ) : (
                            <div className="team-logo-placeholder">
                                {(match.homeTeam?.shortName || match.player1).slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="team-info">
                        <h3 className="team-name">
                            {match.homeTeam?.shortName || match.player1}
                        </h3>
                        {match.homeTeam?.venue && variant === 'featured' && (
                            <span className="team-venue">{match.homeTeam.venue}</span>
                        )}
                    </div>
                </div>

                <div className="match-center">
                    {getScore() || (
                        <div className="vs-container">
                            <span className="vs-text">VS</span>
                        </div>
                    )}
                </div>

                <div className="team away-team">
                    <div className="team-info">
                        <h3 className="team-name">
                            {match.awayTeam?.shortName || match.player2}
                        </h3>
                        {match.awayTeam?.venue && variant === 'featured' && (
                            <span className="team-venue">{match.awayTeam.venue}</span>
                        )}
                    </div>
                    <div className="team-logo-container">
                        {match.awayTeam?.logo ? (
                            <img
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.shortName}
                                className="team-logo"
                            />
                        ) : (
                            <div className="team-logo-placeholder">
                                {(match.awayTeam?.shortName || match.player2).slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {match.venue && variant === 'featured' && (
                <div className="match-venue">
                    <svg className="venue-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{match.venue}</span>
                </div>
            )}

            {match.isLive && (
                <div className="live-overlay" />
            )}
        </div>
    );
};

export default ModernMatchCard;
