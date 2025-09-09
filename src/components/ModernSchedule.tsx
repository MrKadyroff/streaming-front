import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Match } from '../types';
import ModernMatchCard from '../components/ModernMatchCard';
import MatchViewModal from '../components/MatchViewModal';
import './ModernSchedule.css';

const ModernSchedule: React.FC = () => {
    const { matches } = useData();
    const [modalMatch, setModalMatch] = useState<Match | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

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

    const getDateSubtitle = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Получаем уникальные даты для быстрой навигации
    const availableDates = groupedMatches.map(([date]) => date);

    const filteredGroupedMatches = selectedDate
        ? groupedMatches.filter(([date]) => date === selectedDate)
        : groupedMatches.slice(0, 7); // Показываем только первые 7 дней

    return (
        <div className="modern-schedule-page">
            <div className="schedule-hero">
                <div className="hero-content">
                    <h1>Расписание матчей</h1>
                    <p>Следите за расписанием предстоящих футбольных матчей</p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">{scheduledMatches.length}</span>
                            <span className="stat-label">Предстоящих матчей</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{groupedMatches.length}</span>
                            <span className="stat-label">Дней с матчами</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="schedule-container">
                {/* Быстрая навигация по датам */}
                {availableDates.length > 1 && (
                    <div className="date-navigation">
                        <h3>Быстрый переход</h3>
                        <div className="date-pills">
                            <button
                                className={`date-pill ${!selectedDate ? 'active' : ''}`}
                                onClick={() => setSelectedDate('')}
                            >
                                Все дни
                            </button>
                            {availableDates.slice(0, 10).map(date => (
                                <button
                                    key={date}
                                    className={`date-pill ${selectedDate === date ? 'active' : ''}`}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <span className="pill-day">{formatDateHeader(date)}</span>
                                    <span className="pill-date">{getDateSubtitle(date)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Список матчей по дням */}
                <div className="schedule-content">
                    {filteredGroupedMatches.length > 0 ? (
                        filteredGroupedMatches.map(([date, dayMatches], index) => (
                            <div key={date} className="schedule-day">
                                <div className="day-header">
                                    <div className="day-info">
                                        <h2 className="day-title">{formatDateHeader(date)}</h2>
                                        <span className="day-subtitle">{getDateSubtitle(date)}</span>
                                    </div>
                                    <div className="day-stats">
                                        <span className="matches-count">{dayMatches.length}</span>
                                        <span className="matches-label">матчей</span>
                                    </div>
                                </div>

                                <div className="matches-grid">
                                    {dayMatches.map((match, matchIndex) => (
                                        <ModernMatchCard
                                            key={match.id}
                                            match={match}
                                            onClick={handleMatchClick}
                                            variant={matchIndex === 0 && index === 0 ? 'featured' : 'default'}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-matches">
                            <div className="no-matches-icon">⚽</div>
                            <h3>Нет запланированных матчей</h3>
                            <p>В выбранный период нет футбольных матчей</p>
                            {selectedDate && (
                                <button
                                    className="show-all-btn"
                                    onClick={() => setSelectedDate('')}
                                >
                                    Показать все дни
                                </button>
                            )}
                        </div>
                    )}
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

export default ModernSchedule;
