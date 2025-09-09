import React, { useState } from 'react';
import ModernMatchCard from './ModernMatchCard';
import { Match } from '../types';
import './ModernUIDemo.css';

const ModernUIDemo: React.FC = () => {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    // Демо данные
    const demoMatches: Match[] = [
        {
            id: 'demo-1',
            player1: 'Реал Мадрид',
            player2: 'Барселона',
            sport: 'football',
            tournament: 'Ла Лига',
            time: '22:00',
            date: '2024-12-08',
            isLive: true,
            status: 'live',
            score: { home: 2, away: 1 },
            venue: 'Сантьяго Бернабеу',
            homeTeam: {
                id: 1,
                name: 'Реал Мадрид',
                shortName: 'Реал',
                logo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
                venue: 'Мадрид'
            },
            awayTeam: {
                id: 2,
                name: 'ФК Барселона',
                shortName: 'Барселона',
                logo: 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
                venue: 'Барселона'
            }
        },
        {
            id: 'demo-2',
            player1: 'Манчестер Сити',
            player2: 'Ливерпуль',
            sport: 'football',
            tournament: 'АПЛ',
            time: '18:30',
            date: '2024-12-09',
            isLive: false,
            status: 'upcoming',
            venue: 'Этихад Стадиум',
            homeTeam: {
                id: 3,
                name: 'Манчестер Сити',
                shortName: 'Ман Сити',
                logo: '',
                venue: 'Манчестер'
            },
            awayTeam: {
                id: 4,
                name: 'Ливерпуль ФК',
                shortName: 'Ливерпуль',
                logo: '',
                venue: 'Ливерпуль'
            }
        },
        {
            id: 'demo-3',
            player1: 'ПСЖ',
            player2: 'Марсель',
            sport: 'football',
            tournament: 'Лига 1',
            time: '21:00',
            date: '2024-12-09',
            isLive: false,
            status: 'upcoming',
            venue: 'Парк де Пренс'
        }
    ];

    const handleMatchClick = (match: Match) => {
        setSelectedMatch(match);
        console.log('Выбран матч:', match.player1, 'vs', match.player2);
    };

    return (
        <div className="modern-ui-demo">
            <div className="demo-container">
                <div className="demo-header">
                    <h1>Современный UI для футбольных матчей</h1>
                    <p>Демонстрация улучшенного дизайна карточек матчей</p>
                </div>

                <div className="demo-section">
                    <h2>Живой матч (Featured)</h2>
                    <div className="demo-grid single">
                        <ModernMatchCard
                            match={demoMatches[0]}
                            onClick={handleMatchClick}
                            isSelected={selectedMatch?.id === demoMatches[0].id}
                            variant="featured"
                        />
                    </div>
                </div>

                <div className="demo-section">
                    <h2>Стандартные карточки</h2>
                    <div className="demo-grid">
                        {demoMatches.slice(1).map(match => (
                            <ModernMatchCard
                                key={match.id}
                                match={match}
                                onClick={handleMatchClick}
                                isSelected={selectedMatch?.id === match.id}
                                variant="default"
                            />
                        ))}
                    </div>
                </div>

                <div className="demo-section">
                    <h2>Компактные карточки</h2>
                    <div className="demo-grid">
                        {demoMatches.map(match => (
                            <ModernMatchCard
                                key={`compact-${match.id}`}
                                match={match}
                                onClick={handleMatchClick}
                                isSelected={selectedMatch?.id === match.id}
                                variant="compact"
                            />
                        ))}
                    </div>
                </div>

                <div className="demo-features">
                    <h2>Ключевые улучшения</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎨</div>
                            <h3>Glassmorphism дизайн</h3>
                            <p>Современный стеклянный эффект с размытием фона</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Отзывчивый дизайн</h3>
                            <p>Идеально адаптируется под любые размеры экрана</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Плавные анимации</h3>
                            <p>Аккуратные переходы без выхода за границы</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌙</div>
                            <h3>Темная тема</h3>
                            <p>Оптимизированная цветовая схема для комфорта глаз</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏷️</div>
                            <h3>Современная типографика</h3>
                            <p>Читаемые шрифты с правильной иерархией</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">♿</div>
                            <h3>Доступность</h3>
                            <p>Focus states и ARIA-атрибуты для лучшей доступности</p>
                        </div>
                    </div>
                </div>

                {selectedMatch && (
                    <div className="selected-match-info">
                        <h3>Выбранный матч:</h3>
                        <p>{selectedMatch.player1} vs {selectedMatch.player2}</p>
                        <p>Турнир: {selectedMatch.tournament}</p>
                        <p>Статус: {selectedMatch.isLive ? 'В эфире' : 'Предстоящий'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernUIDemo;
