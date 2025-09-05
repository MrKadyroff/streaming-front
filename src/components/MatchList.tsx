import React from 'react';
import { Match } from '../types';
import MatchCard from './MatchCard';
import './MatchList.css';

interface MatchListProps {
    matches: Match[];
    title: string;
    onMatchClick: (match: Match) => void;
    className?: string;
    selectedMatchId?: string;
}

const MatchList: React.FC<MatchListProps> = ({
    matches,
    title,
    onMatchClick,
    className = '',
    selectedMatchId
}) => {
    if (matches.length === 0) {
        return (
            <section className={`match-list ${className}`}>
                <h2 className="match-list-title">{title}</h2>
                <div className="no-matches">
                    <p>Нет доступных матчей</p>
                </div>
            </section>
        );
    }

    return (
        <section className={`match-list ${className}`}>
            <h2 className="match-list-title">{title}</h2>
            <div className="match-grid">
                {matches.map(match => (
                    <MatchCard
                        key={match.id}
                        match={match}
                        onClick={onMatchClick}
                        isSelected={selectedMatchId === match.id}
                    />
                ))}
            </div>
        </section>
    );
};

export default MatchList;
