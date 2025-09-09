import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Match } from '../types';
import CategoryNavigation from '../components/CategoryNavigation';
import MatchList from '../components/MatchList';
import Player from '../components/Player';
import './Home.css';

const Home: React.FC = () => {
    const {
        categories,
        liveMatches,
        selectedCategory,
        setSelectedCategory
    } = useData();

    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    // Автоматически выбираем первый live матч при загрузке
    useEffect(() => {
        if (liveMatches.length > 0 && !selectedMatch) {
            setSelectedMatch(liveMatches[0]);
        }
    }, [liveMatches, selectedMatch]);

    const handleMatchClick = (match: Match) => {
        // Только для live матчей
        if (match.isLive && match.status === 'live') {
            setSelectedMatch(match);
        }
    };

    const closePlayer = () => {
        setSelectedMatch(null);
    };

    // Фильтруем только реально активные эфиры
    const activeLiveMatches = liveMatches.filter((match: Match) =>
        match.isLive &&
        match.status === 'live' &&
        (match.streamUrl || match.previewImage)
    );

    return (
        <div className="home-page">
            <div className="home-header">
                <h1>Прямые эфиры</h1>
                <p>Смотрите спортивные события в прямом эфире</p>
            </div>

            <CategoryNavigation
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <main className="home-content">
                {activeLiveMatches.length === 0 ? (
                    <div className="no-streams">
                        <div className="no-streams-content">
                            <span className="no-streams-icon">TV</span>
                            <h3>Нет активных эфиров</h3>
                            <p>В данный момент нет прямых трансляций</p>
                            <p>Проверьте <a href="/schedule">расписание</a> предстоящих матчей</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Основной видеоплеер */}
                        {selectedMatch && (
                            <div className="player-section">
                                <div className="player-header">
                                    <div className="player-title">
                                        <h2>{selectedMatch.player1} vs {selectedMatch.player2}</h2>
                                        <div className="player-meta">
                                            <span className="tournament">🏆 {selectedMatch.tournament}</span>
                                            <span className="live-indicator">
                                                <span className="live-dot"></span>
                                                ПРЯМОЙ ЭФИР
                                            </span>
                                        </div>
                                    </div>
                                    <button className="close-player" onClick={closePlayer} title="Закрыть плеер">
                                        ✕
                                    </button>
                                </div>
                                <Player
                                    primarySrc={selectedMatch.streamUrl || ''}
                                    fallbackSrc={selectedMatch.fallbackUrl}
                                    className="main-player"
                                    previewImage={selectedMatch.previewImage}
                                    matchTitle={`${selectedMatch.player1} vs ${selectedMatch.player2}`}
                                    isLive={selectedMatch.isLive && selectedMatch.status === 'live'}
                                />
                            </div>
                        )}

                        {/* Список активных эфиров */}
                        <div className="live-streams-section">
                            <MatchList
                                matches={activeLiveMatches}
                                title="🔴 Активные эфиры"
                                onMatchClick={handleMatchClick}
                                selectedMatchId={selectedMatch?.id}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Home;
