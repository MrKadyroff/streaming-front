import React from 'react';
import { Match } from '../types';
import './FootballMatchCard.css';

interface FootballMatchCardProps {
    match: Match;
    onClick: (match: Match) => void;
    isSelected?: boolean;
    isMainCard?: boolean;
}

const FootballMatchCard: React.FC<FootballMatchCardProps> = ({
    match,
    onClick,
    isSelected = false,
    isMainCard = false
}) => {
    const handleClick = () => {
        onClick(match);
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5); // HH:MM
    };

    const getStatusText = () => {
        if (match.isLive) {
            return (
                <span className="status live">
                    <span className="live-dot"></span>
                    В ЭФИРЕ
                </span>
            );
        }
        return (
            <span className="status upcoming">
                {formatTime(match.time)}
            </span>
        );
    };

    const getScore = () => {
        if (match.score && match.isLive) {
            return (
                <div className="score">
                    <span className="score-value">
                        {match.score.home ?? 0} - {match.score.away ?? 0}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={`football-match-card ${isSelected ? 'selected' : ''} ${isMainCard ? 'main-card' : ''}`}
            onClick={handleClick}
        >
            {isMainCard && (
                <div className="football-field-bg">
                    <div className="field-lines"></div>
                    <div className="center-circle"></div>
                    <div className="penalty-area left"></div>
                    <div className="penalty-area right"></div>
                </div>
            )}

            <div className="match-content">
                <div className="match-header">
                    <div className="tournament-info">
                        <span className="tournament">{match.tournament}</span>
                        {getStatusText()}
                    </div>
                </div>

                <div className="teams-section">
                    <div className="team home-team">
                        {match.homeTeam?.logo ? (
                            <img
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.shortName}
                                className="team-logo"
                            />
                        ) : (
                            <div className="team-logo-placeholder">
                                {match.player1.slice(0, 3).toUpperCase()}
                            </div>
                        )}
                        <div className="team-info">
                            <h3 className="team-name">
                                {match.homeTeam?.shortName || match.player1}
                            </h3>
                            {match.homeTeam?.venue && (
                                <span className="team-venue">{match.homeTeam.venue}</span>
                            )}
                        </div>
                    </div>

                    <div className="match-center">
                        {getScore() || (
                            <div className="vs-separator">
                                <span>VS</span>
                            </div>
                        )}
                    </div>

                    <div className="team away-team">
                        <div className="team-info">
                            <h3 className="team-name">
                                {match.awayTeam?.shortName || match.player2}
                            </h3>
                            {match.awayTeam?.venue && (
                                <span className="team-venue">{match.awayTeam.venue}</span>
                            )}
                        </div>
                        {match.awayTeam?.logo ? (
                            <img
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.shortName}
                                className="team-logo"
                            />
                        ) : (
                            <div className="team-logo-placeholder">
                                {match.player2.slice(0, 3).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {isMainCard && match.homeTeam?.squad && match.awayTeam?.squad && (
                    <div className="squad-preview">
                        <div className="squad-section">
                            <h4>Состав {match.homeTeam.shortName}</h4>
                            <div className="players-list">
                                {match.homeTeam.squad.slice(0, 3).map(player => (
                                    <div key={player.id} className="player-item">
                                        <span className="player-number">{player.shirtNumber}</span>
                                        <span className="player-name">{player.name}</span>
                                        <span className="player-position">{player.position}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="squad-section">
                            <h4>Состав {match.awayTeam.shortName}</h4>
                            <div className="players-list">
                                {match.awayTeam.squad.slice(0, 3).map(player => (
                                    <div key={player.id} className="player-item">
                                        <span className="player-number">{player.shirtNumber}</span>
                                        <span className="player-name">{player.name}</span>
                                        <span className="player-position">{player.position}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {match.venue && (
                    <div className="match-venue">
                        <span>Стадион: {match.venue}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FootballMatchCard;
