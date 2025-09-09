import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Match } from '../types';
import MatchPlayer from '../components/MatchPlayer';
import ModernMatchCard from '../components/ModernMatchCard';
import './ModernHome.css';

const ModernHome: React.FC = () => {
    const {
        liveMatches,
        upcomingMatches
    } = useData();

    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    // Автоматически выбираем первый live матч при загрузке
    useEffect(() => {
        if (liveMatches.length > 0 && !selectedMatch) {
            setSelectedMatch(liveMatches[0]);
        }
    }, [liveMatches, selectedMatch]);

    const handleMatchClick = (match: Match) => {
        setSelectedMatch(match);
    };

    const closePlayer = () => {
        setSelectedMatch(null);
    };

    // Фильтруем только футбольные матчи
    const activeLiveMatches = liveMatches.filter((match: Match) =>
        match.sport === 'football' &&
        match.isLive &&
        match.status === 'live'
    );

    // Ближайшие матчи
    const upcomingFootballMatches = upcomingMatches.filter((match: Match) =>
        match.sport === 'football'
    );

    const featuredMatch = upcomingFootballMatches[0];
    const otherUpcomingMatches = upcomingFootballMatches.slice(1, 7); // Показываем до 6 дополнительных

    return (
        <div className="modern-home-page">
            {/* Hero Section */}
            <div className="home-hero">
                <div className="hero-content">
                    <h1>Прямые трансляции футбола</h1>
                    <p>Смотрите лучшие футбольные матчи в прямом эфире</p>
                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-number">{activeLiveMatches.length}</span>
                            <span className="stat-label">Прямых эфиров</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{upcomingFootballMatches.length}</span>
                            <span className="stat-label">Предстоящих матчей</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-container">
                {/* Основной видеоплеер */}
                {selectedMatch && selectedMatch.isLive && (
                    <div className="player-section">
                        <div className="player-header">
                            <div className="player-info">
                                <h2>{selectedMatch.player1} vs {selectedMatch.player2}</h2>
                                <div className="player-meta">
                                    <span className="tournament">{selectedMatch.tournament}</span>
                                    <div className="live-badge">
                                        <div className="live-dot" />
                                        <span>ПРЯМОЙ ЭФИР</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="close-player"
                                onClick={closePlayer}
                                title="Закрыть плеер"
                                aria-label="Закрыть плеер"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <MatchPlayer
                            match={selectedMatch}
                            isMainPlayer={true}
                        />
                    </div>
                )}

                {/* Ближайший матч */}
                {featuredMatch && (
                    <section className="featured-section">
                        <h2>Ближайший матч</h2>
                        <ModernMatchCard
                            match={featuredMatch}
                            onClick={handleMatchClick}
                            isSelected={selectedMatch?.id === featuredMatch.id}
                            variant="featured"
                        />
                    </section>
                )}

                {/* Активные эфиры */}
                {activeLiveMatches.length > 0 && (
                    <section className="live-section">
                        <div className="section-header">
                            <h2>
                                <div className="live-indicator" />
                                Прямые эфиры
                            </h2>
                            <span className="matches-count">{activeLiveMatches.length}</span>
                        </div>
                        <div className="matches-grid">
                            {activeLiveMatches.map((match: Match) => (
                                <ModernMatchCard
                                    key={match.id}
                                    match={match}
                                    onClick={handleMatchClick}
                                    isSelected={selectedMatch?.id === match.id}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Предстоящие матчи */}
                {otherUpcomingMatches.length > 0 && (
                    <section className="upcoming-section">
                        <div className="section-header">
                            <h2>Предстоящие матчи</h2>
                            <Link to="/schedule" className="view-all-link">
                                Все матчи
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                </svg>
                            </Link>
                        </div>
                        <div className="matches-grid">
                            {otherUpcomingMatches.map((match: Match) => (
                                <ModernMatchCard
                                    key={match.id}
                                    match={match}
                                    onClick={handleMatchClick}
                                    isSelected={selectedMatch?.id === match.id}
                                    variant="compact"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Сообщение если нет матчей */}
                {activeLiveMatches.length === 0 && upcomingFootballMatches.length === 0 && (
                    <div className="no-matches">
                        <div className="no-matches-icon">⚽</div>
                        <h3>Нет доступных матчей</h3>
                        <p>В данный момент нет футбольных трансляций</p>
                        <Link to="/schedule" className="schedule-link">
                            <span>Посмотреть расписание</span>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernHome;
