import React from 'react';
import { Match } from '../../types';
import './MatchesManagement.css';

interface MatchesManagementProps {
    matches: Match[];
    onAddMatch: () => void;
    onEditMatch: (match: Match) => void;
    onDeleteMatch: (id: string) => void;
    onUpdateMatch: (id: string, updates: Partial<Match>) => void;
}

const MatchesManagement: React.FC<MatchesManagementProps> = ({
    matches,
    onAddMatch,
    onEditMatch,
    onDeleteMatch,
    onUpdateMatch
}) => {
    return (
        <div className="tab-content">
            <div className="matches-management">
                <div className="section-header">
                    <h2>Управление матчами</h2>
                    <button
                        className="btn btn-primary add-btn"
                        onClick={onAddMatch}
                    >
                        Добавить матч
                    </button>
                </div>

                <div className="matches-container">
                    {matches.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>Матчи не найдены</h3>
                            <p>Создайте первый матч для начала работы</p>
                            <button
                                className="btn btn-primary"
                                onClick={onAddMatch}
                            >
                                Создать матч
                            </button>
                        </div>
                    ) : (
                        <div className="matches-table-container">
                            <table className="matches-table">
                                <thead>
                                    <tr>
                                        <th>Команды</th>
                                        <th>Турнир</th>
                                        <th>Дата и время</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((match: Match) => (
                                        <tr key={match.id} className="match-row">
                                            <td className="teams-cell">
                                                <div className="teams-info">
                                                    <span className="team-name">{match.player1}</span>
                                                    <span className="vs-text">против</span>
                                                    <span className="team-name">{match.player2}</span>
                                                </div>
                                            </td>
                                            <td className="tournament-cell">
                                                <div className="tournament-info">
                                                    <div className="tournament-name">{match.tournament}</div>
                                                    <div className="sport-name">{match.sport}</div>
                                                </div>
                                            </td>
                                            <td className="datetime-cell">
                                                <div className="datetime-info">
                                                    <div className="date">{new Date(match.date).toLocaleDateString('ru-RU')}</div>
                                                    <div className="time">{match.time}</div>
                                                </div>
                                            </td>
                                            <td className="status-cell">
                                                <span className={`status-badge ${match.status}`}>
                                                    {match.status === 'live' ? 'В ЭФИРЕ' :
                                                        match.status === 'upcoming' ? 'Скоро' :
                                                            match.status === 'finished' ? 'Завершен' : match.status}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="actions-group">
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => onEditMatch(match)}
                                                        title="Редактировать матч"
                                                    >
                                                        Изменить
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${match.status === 'live' ? 'btn-warning' : 'btn-success'}`}
                                                        onClick={() => {
                                                            const newStatus = match.status === 'live' ? 'upcoming' : 'live';
                                                            onUpdateMatch(match.id, { ...match, status: newStatus, isLive: newStatus === 'live' });
                                                        }}
                                                        title={match.status === 'live' ? "Остановить трансляцию" : "Начать трансляцию"}
                                                    >
                                                        {match.status === 'live' ? 'Остановить' : 'Запустить'}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => onDeleteMatch(match.id)}
                                                        title="Удалить матч"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchesManagement;
