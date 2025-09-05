import React from 'react';
import { Match } from '../types';
import MatchPlayer from './MatchPlayer';
import './MatchViewModal.css';

interface MatchViewModalProps {
    match: Match;
    onClose: () => void;
}

const MatchViewModal: React.FC<MatchViewModalProps> = ({ match, onClose }) => {
    return (
        <div className="match-view-modal-overlay" onClick={onClose}>
            <div className="match-view-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{match.player1} vs {match.player2}</h2>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-content">
                    <MatchPlayer match={match} />

                    <div className="match-details">
                        <div className="match-info">
                            <span className="label">Турнир:</span>
                            <span>{match.tournament}</span>
                        </div>
                        <div className="match-info">
                            <span className="label">Дата:</span>
                            <span>{match.date} в {match.time}</span>
                        </div>
                        <div className="match-info">
                            <span className="label">Спорт:</span>
                            <span>{match.sport}</span>
                        </div>
                        <div className="match-info">
                            <span className="label">Статус:</span>
                            <span className={`status ${match.status}`}>
                                {match.isLive ? 'В эфире' : 'Запланировано'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchViewModal;
