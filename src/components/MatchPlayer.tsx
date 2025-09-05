import React from 'react';
import Player from './Player';
import { Match } from '../types';

interface MatchPlayerProps {
    match: Match;
    isMainPlayer?: boolean;
}

const MatchPlayer: React.FC<MatchPlayerProps> = ({ match, isMainPlayer = true }) => {
    if (!match.isLive && match.previewImage) {
        return (
            <div className="match-preview">
                <img
                    src={match.previewImage}
                    alt={`${match.player1} vs ${match.player2}`}
                    className="preview-image"
                />
                <div className="preview-overlay">
                    <div className="preview-info">
                        <h3>{match.player1} vs {match.player2}</h3>
                        <p>{match.date} в {match.time}</p>
                        <p>{match.tournament}</p>
                        <div className="preview-status">
                            Запланировано
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (match.isLive && match.streamUrl) {
        return (
            <Player
                primarySrc={match.streamUrl}
                fallbackSrc={match.fallbackUrl}
                previewImage={match.previewImage}
            />
        );
    }

    return (
        <div className="match-not-available">
            <p>Трансляция недоступна</p>
        </div>
    );
};

export default MatchPlayer;
