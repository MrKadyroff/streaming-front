import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Match } from '../types';
import MatchPlayer from '../components/MatchPlayer';
import FootballMatchCard from '../components/FootballMatchCard';
import HLSPlayer from '../components/HLSPlayer';
import BannersDebug from '../components/BannersDebug';
import { streamApi, Stream } from '../services/streamApi';
import './Home.css';

const Home: React.FC = () => {
    const {
        liveMatches,
        upcomingMatches
    } = useData();

    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [activeStream, setActiveStream] = useState<Stream | null>(null);
    const [streamLoading, setStreamLoading] = useState<boolean>(true);

    // Загружаем активный поток
    useEffect(() => {
        const loadActiveStream = async () => {
            setStreamLoading(true);
            try {
                const stream = await streamApi.getFirstActiveStream();
                setActiveStream(stream);
            } catch (error) {
                console.error('Error loading active stream:', error);
                setActiveStream(null);
            } finally {
                setStreamLoading(false);
            }
        };

        loadActiveStream();

        // Обновляем поток каждые 30 секунд
        const interval = setInterval(loadActiveStream, 30000);

        return () => clearInterval(interval);
    }, []);

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

    // Ближайшие матчи для показа на фоне поля
    const upcomingFootballMatches = upcomingMatches.filter((match: Match) =>
        match.sport === 'football'
    ).slice(0, 1); // Показываем только ближайший

    const otherUpcomingMatches = upcomingMatches.filter((match: Match) =>
        match.sport === 'football'
    ).slice(1); // Остальные в карточках

    return (
        <div className="home-page">
            {/* <BannersDebug /> */}
            <main className="home-content">
                {/* HLS Video Player Section */}
                <div className="hls-player-section">
                    <div className="section-header">
                        <h2>
                            <span className="soccer-emoji">⚽</span>
                            Онлайн трансляция
                            {streamLoading && <span className="loading-indicator">⏳</span>}
                        </h2>
                    </div>
                    <HLSPlayer stream={activeStream} />
                </div>

                {/* Ближайший матч на фоне футбольного поля */}
                {/* {upcomingFootballMatches.length > 0 && (
                    <div className="featured-match-section">
                        <h2>Ближайший матч</h2>
                        <FootballMatchCard
                            match={upcomingFootballMatches[0]}
                            onClick={handleMatchClick}
                            isSelected={selectedMatch?.id === upcomingFootballMatches[0].id}
                            isMainCard={true}
                        />
                    </div>
                )} */}

                {/* Активные эфиры */}
                {activeLiveMatches.length > 0 && (
                    <>
                        {/* Основной видеоплеер */}
                        {selectedMatch && selectedMatch.isLive && (
                            <div className="player-section">
                                <div className="player-header">
                                    <div className="player-title">
                                        <h2>{selectedMatch.player1} vs {selectedMatch.player2}</h2>
                                        <div className="player-meta">
                                            <span className="tournament">{selectedMatch.tournament}</span>
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
                                <MatchPlayer
                                    match={selectedMatch}
                                    isMainPlayer={true}
                                />
                            </div>
                        )}

                        {/* Список активных эфиров */}
                        <div className="live-streams-section">
                            <h2>Прямые эфиры</h2>
                            <div className="matches-grid">
                                {activeLiveMatches.map((match: Match) => (
                                    <FootballMatchCard
                                        key={match.id}
                                        match={match}
                                        onClick={handleMatchClick}
                                        isSelected={selectedMatch?.id === match.id}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Предстоящие матчи */}
                {/* {otherUpcomingMatches.length > 0 && (
                    <div className="upcoming-matches-section">
                        <h2>Предстоящие матчи</h2>
                        <div className="matches-grid">
                            {otherUpcomingMatches.map((match: Match) => (
                                <FootballMatchCard
                                    key={match.id}
                                    match={match}
                                    onClick={handleMatchClick}
                                    isSelected={selectedMatch?.id === match.id}
                                />
                            ))}
                        </div>
                    </div>
                )} */}

                {/* Сообщение если нет матчей */}
                {activeLiveMatches.length === 0 && upcomingFootballMatches.length === 0 && (
                    <div className="no-matches">
                        <div className="no-matches-content">
                            <h3>Нет доступных матчей</h3>
                            <p>В данный момент нет футбольных трансляций</p>
                            <p>Проверьте <Link to="/schedule">расписание</Link> предстоящих матчей</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
