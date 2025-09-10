import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Match } from '../types';
import MatchViewModal from '../components/MatchViewModal';
import './Schedule.css';

const Schedule: React.FC = () => {
    const { matches } = useData();
    const [modalMatch, setModalMatch] = useState<Match | null>(null);

    // Фильтруем только запланированные матчи (не в эфире)
    const scheduledMatches = matches.filter(match => !match.isLive);

    const handleMatchClick = (match: Match) => {
        if (match.isLive) {
            setModalMatch(match);
        }
    };

    const closeModal = () => {
        setModalMatch(null);
    };

    const groupMatchesByDate = (matches: Match[]) => {
        const grouped = matches.reduce((acc, match) => {
            const date = match.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(match);
            return acc;
        }, {} as Record<string, Match[]>);

        // Сортируем матчи внутри каждого дня по времени
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => a.time.localeCompare(b.time));
        });

        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    };

    const groupedMatches = groupMatchesByDate(scheduledMatches);

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Завтра';
        } else {
            return date.toLocaleDateString('ru', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        }
    };

    return (
        <div className="schedule-page">
            <div className="schedule-container">
                <div className="schedule-content">
                    {groupedMatches.slice(0, 3).map(([date, dayMatches], index) => (
                        <div key={date} className="schedule-day">
                            <div className="day-header">
                                <h2 className="day-title">{formatDateHeader(date)}</h2>
                                {/* <span className="day-count">{dayMatches.length} матчей</span> */}
                            </div>
                            <div className="matches-grid">
                                {dayMatches.map(match => (
                                    <div
                                        key={match.id}
                                        className="match-card"
                                        onClick={() => handleMatchClick(match)}
                                    >
                                        <div className="timeline-time">
                                            <span className="time-hour">{match.time.split(':')[0]}</span>
                                            <span className="time-minute">:{match.time.split(':')[1]}</span>
                                        </div>
                                        <div className="timeline-content">
                                            <div className="match-teams">
                                                <div className="team-info home-team">
                                                    {match.homeTeam?.logo && (
                                                        <img
                                                            src={match.homeTeam.logo}
                                                            alt={match.homeTeam.shortName}
                                                            className="team-logo-mini"
                                                        />
                                                    )}
                                                    <div className="team-details">
                                                        <span className="team-name">{match.homeTeam?.shortName || match.player1}</span>
                                                    </div>
                                                </div>
                                                <div className="match-vs">
                                                    <span className="vs-separator">VS</span>
                                                </div>
                                                <div className="team-info away-team">
                                                    <div className="team-details">
                                                        <span className="team-name">{match.awayTeam?.shortName || match.player2}</span>
                                                    </div>
                                                    {match.awayTeam?.logo && (
                                                        <img
                                                            src={match.awayTeam.logo}
                                                            alt={match.awayTeam.shortName}
                                                            className="team-logo-mini"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            {/* <div className="match-details">
                                                <span className="tournament-name">
                                                    {match.tournament}
                                                </span>
                                            </div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {modalMatch && (
                <MatchViewModal
                    match={modalMatch}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default Schedule;
