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
    const [allStreams, setAllStreams] = useState<Stream[]>([]);
    const [upcomingStreams, setUpcomingStreams] = useState<Stream[]>([]);
    const [streamLoading, setStreamLoading] = useState<boolean>(true);

    // Загружаем активные потоки
    useEffect(() => {
        const loadActiveStreams = async () => {
            setStreamLoading(true);
            try {
                console.log('Загружаем активные стримы...');
                const streams = await streamApi.getActiveStreams();
                console.log('Загруженные стримы:', streams);

                setAllStreams(streams);

                // Выбираем первый доступный стрим
                if (streams.length > 0) {
                    setActiveStream(streams[0]);
                    console.log('Выбран активный стрим:', streams[0]);
                } else {
                    setActiveStream(null);
                    console.log('Нет доступных стримов');
                }
            } catch (error) {
                console.error('Error loading active streams:', error);
                setActiveStream(null);
                setAllStreams([]);
            } finally {
                setStreamLoading(false);
            }
        };

        const loadUpcomingStreams = async () => {
            try {
                console.log('Загружаем предстоящие стримы...');
                const upcoming = await streamApi.getUpcomingStreams();
                console.log('Предстоящие стримы:', upcoming);
                setUpcomingStreams(upcoming);
            } catch (error) {
                console.error('Error loading upcoming streams:', error);
                setUpcomingStreams([]);
            }
        };

        loadActiveStreams();
        loadUpcomingStreams();

        // Обновляем потоки каждые 30 секунд
        const interval = setInterval(() => {
            loadActiveStreams();
            loadUpcomingStreams();
        }, 30000);

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

    // Функция для форматирования времени
    const formatStreamTime = (startTime: string) => {
        const date = new Date(startTime);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Функция для форматирования даты
    const formatStreamDate = (startTime: string) => {
        const date = new Date(startTime);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Завтра';
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit'
            });
        }
    };

    // Функция для получения понятного статуса
    const getStreamStatusText = (status: string) => {
        switch (status) {
            case 'live': return 'В эфире';
            case 'upcoming': return 'Скоро';
            case 'ended': return 'Завершен';
            case 'offline': return 'Офлайн';
            default: return 'Неизвестно';
        }
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
                            {activeStream && (
                                <span className="stream-count">
                                    ({allStreams.findIndex(s => s.id === activeStream.id) + 1} из {allStreams.length})
                                </span>
                            )}
                        </h2>

                        {/* Переключатель стримов */}
                        {allStreams.length > 1 && (
                            <div className="stream-selector">
                                {allStreams.map((stream, index) => (
                                    <button
                                        key={stream.id}
                                        className={`stream-btn ${activeStream?.id === stream.id ? 'active' : ''}`}
                                        onClick={() => setActiveStream(stream)}
                                        title={stream.title}
                                    >
                                        Поток {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <HLSPlayer stream={activeStream} />

                    {/* Информация о текущем стриме и расписание */}
                    <div className="stream-info-panel">
                        {activeStream && (
                            <div className="current-stream-info">
                                <h3>{activeStream.title}</h3>
                                <div className="stream-details">
                                    <span className="stream-status">
                                        <span className="status-dot"></span>
                                        {getStreamStatusText(activeStream.status)}
                                    </span>
                                    {(activeStream.viewers || 0) > 0 && (
                                        <span className="stream-viewers">
                                            👥 {activeStream.viewers || 0} зрителей
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Расписание предстоящих эфиров */}
                        {false && (
                            <div className="upcoming-schedule">
                                <h3 className="schedule-title">
                                    📅 Расписание трансляций
                                </h3>

                                {upcomingStreams.length > 0 ? (
                                    <div className="schedule-list">
                                        {upcomingStreams.slice(0, 4).map((stream) => (
                                            <div key={stream.id} className="schedule-item">
                                                <div className="schedule-time">
                                                    <div className="schedule-date">
                                                        {formatStreamDate(stream.startTime!)}
                                                    </div>
                                                    <div className="schedule-clock">
                                                        {formatStreamTime(stream.startTime!)}
                                                    </div>
                                                </div>
                                                <div className="schedule-content">
                                                    <div className="schedule-title-text">
                                                        {stream.title}
                                                    </div>
                                                    <div className="schedule-status">
                                                        <span className="status-badge upcoming-badge">
                                                            {getStreamStatusText(stream.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {upcomingStreams.length > 4 && (
                                            <div className="schedule-more">
                                                <Link to="/schedule" className="schedule-more-link">
                                                    Ещё {upcomingStreams.length - 4} трансляций →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="no-upcoming">
                                        <p>На данный момент нет запланированных трансляций</p>
                                    </div>
                                )}
                            </div>)}
                    </div>
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
