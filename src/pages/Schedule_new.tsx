import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Match } from '../types';
import MatchViewModal from '../components/MatchViewModal';
import { footballTeams } from '../data/footballTeams';
import './Schedule.css';

const Schedule: React.FC = () => {
    const { matches } = useData();
    const [modalMatch, setModalMatch] = useState<Match | null>(null);

    // Генерируем дополнительные матчи для демонстрации
    const generateAdditionalMatches = (): Match[] => {
        const additionalMatches: Match[] = [];
        const sports = ['football', 'tennis', 'basketball', 'hockey'];
        const tournaments = {
            football: ['Премьер-лига', 'Лига чемпионов', 'Кубок России', 'Лига Европы'],
            tennis: ['ATP Tour', 'WTA Tour', 'Кубок Дэвиса', 'Fed Cup'],
            basketball: ['НБА', 'Евролига', 'ВТБ лига', 'NCAA'],
            hockey: ['НХЛ', 'КХЛ', 'Чемпионат мира', 'Евротур']
        };

        // Генерируем матчи на следующие 3 дня
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            // 3-5 матчей в день
            const matchesPerDay = Math.floor(Math.random() * 3) + 3;

            for (let j = 0; j < matchesPerDay; j++) {
                const sport = sports[Math.floor(Math.random() * sports.length)];
                const tournamentsList = tournaments[sport as keyof typeof tournaments];
                const tournament = tournamentsList[Math.floor(Math.random() * tournamentsList.length)];

                let player1 = '', player2 = '', homeTeam, awayTeam;

                if (sport === 'football') {
                    const team1 = footballTeams[Math.floor(Math.random() * footballTeams.length)];
                    const team2 = footballTeams[Math.floor(Math.random() * footballTeams.length)];
                    if (team1.id !== team2.id) {
                        player1 = team1.name;
                        player2 = team2.name;
                        homeTeam = team1;
                        awayTeam = team2;
                    }
                } else {
                    const players = {
                        tennis: ['Новак Джокович', 'Рафаэль Надаль', 'Роджер Федерер', 'Энди Маррей', 'Арина Соболенко', 'Ига Свентек'],
                        basketball: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Nuggets', 'Suns'],
                        hockey: ['Rangers', 'Bruins', 'Penguins', 'Capitals', 'Lightning', 'Avalanche']
                    };
                    const playersList = players[sport as keyof typeof players];
                    player1 = playersList[Math.floor(Math.random() * playersList.length)];
                    do {
                        player2 = playersList[Math.floor(Math.random() * playersList.length)];
                    } while (player2 === player1);
                }

                const hour = Math.floor(Math.random() * 12) + 10; // 10:00 - 21:00
                const minute = Math.random() > 0.5 ? '00' : '30';
                const time = `${hour.toString().padStart(2, '0')}:${minute}`;

                additionalMatches.push({
                    id: `generated-${i}-${j}`,
                    player1,
                    player2,
                    date: dateString,
                    time,
                    tournament,
                    sport,
                    isLive: false,
                    status: 'upcoming',
                    homeTeam,
                    awayTeam,
                    venue: sport === 'football' ? (homeTeam?.venue || 'Стадион') : undefined
                });
            }
        }

        return additionalMatches;
    };

    // Объединяем реальные и сгенерированные матчи
    const allMatches = [...matches, ...generateAdditionalMatches()];

    // Фильтруем только запланированные матчи (не в эфире)
    const scheduledMatches = allMatches.filter(match => !match.isLive);

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
                                <span className="day-count">{dayMatches.length} матчей</span>
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
