import React, { useState, useEffect } from 'react';
import './MatchModal.css';
import { Match, FootballTeamInfo } from '../types';
import TeamSelector from './TeamSelector';

interface MatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (match: Omit<Match, 'id'>) => void;
    editMatch?: Match | null;
}

const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, onSubmit, editMatch }) => {
    const [formData, setFormData] = useState({
        player1: '',
        player2: '',
        date: '',
        time: '',
        tournament: '',
        sport: 'tennis',
        isLive: false,
        status: 'upcoming' as 'live' | 'upcoming' | 'finished',
        streamUrl: '',
        previewImage: '',
        homeTeam: null as FootballTeamInfo | null,
        awayTeam: null as FootballTeamInfo | null,
        venue: ''
    });

    useEffect(() => {
        if (editMatch) {
            setFormData({
                player1: editMatch.player1,
                player2: editMatch.player2,
                date: editMatch.date,
                time: editMatch.time,
                tournament: editMatch.tournament,
                sport: editMatch.sport,
                isLive: editMatch.isLive,
                status: editMatch.status,
                streamUrl: editMatch.streamUrl || '',
                previewImage: editMatch.previewImage || '',
                homeTeam: editMatch.homeTeam || null,
                awayTeam: editMatch.awayTeam || null,
                venue: editMatch.venue || ''
            });
        } else {
            setFormData({
                player1: '',
                player2: '',
                date: '',
                time: '',
                tournament: '',
                sport: 'tennis',
                isLive: false,
                status: 'upcoming',
                streamUrl: '',
                previewImage: '',
                homeTeam: null,
                awayTeam: null,
                venue: ''
            });
        }
    }, [editMatch, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            homeTeam: formData.homeTeam || undefined,
            awayTeam: formData.awayTeam || undefined,
            venue: formData.venue || undefined
        };
        onSubmit(submitData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleTeamChange = (teamType: 'homeTeam' | 'awayTeam', team: FootballTeamInfo | null) => {
        setFormData(prev => ({
            ...prev,
            [teamType]: team,
            // Автоматически заполняем названия игроков/команд для футбола
            ...(formData.sport === 'football' && {
                [teamType === 'homeTeam' ? 'player1' : 'player2']: team?.name || ''
            })
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editMatch ? 'Редактировать матч' : 'Добавить матч'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="match-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="player1">Игрок/Команда 1:</label>
                            <input
                                type="text"
                                id="player1"
                                name="player1"
                                value={formData.player1}
                                onChange={handleChange}
                                required
                                disabled={formData.sport === 'football' && !!formData.homeTeam}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="player2">Игрок/Команда 2:</label>
                            <input
                                type="text"
                                id="player2"
                                name="player2"
                                value={formData.player2}
                                onChange={handleChange}
                                required
                                disabled={formData.sport === 'football' && !!formData.awayTeam}
                            />
                        </div>
                    </div>

                    {formData.sport === 'football' && (
                        <>
                            <div className="form-section-title">Футбольные команды</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <TeamSelector
                                        label="Домашняя команда:"
                                        selectedTeam={formData.homeTeam}
                                        onTeamSelect={(team) => handleTeamChange('homeTeam', team)}
                                        placeholder="Выберите домашнюю команду"
                                    />
                                </div>
                                <div className="form-group">
                                    <TeamSelector
                                        label="Гостевая команда:"
                                        selectedTeam={formData.awayTeam}
                                        onTeamSelect={(team) => handleTeamChange('awayTeam', team)}
                                        placeholder="Выберите гостевую команду"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="venue">Стадион:</label>
                                <input
                                    type="text"
                                    id="venue"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="Название стадиона"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Дата:</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="time">Время:</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tournament">Турнир:</label>
                            <input
                                type="text"
                                id="tournament"
                                name="tournament"
                                value={formData.tournament}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sport">Спорт:</label>
                            <select
                                id="sport"
                                name="sport"
                                value={formData.sport}
                                onChange={handleChange}
                                required
                            >
                                <option value="tennis">Теннис</option>
                                <option value="football">Футбол</option>
                                <option value="basketball">Баскетбол</option>
                                <option value="hockey">Хоккей</option>
                                <option value="nfl">NFL</option>
                                <option value="f1">F1</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="status">Статус:</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="upcoming">Предстоящий</option>
                                <option value="live">В эфире</option>
                                <option value="finished">Завершен</option>
                            </select>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isLive"
                                    checked={formData.isLive}
                                    onChange={handleChange}
                                />
                                Прямой эфир
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="streamUrl">URL стрима (опционально):</label>
                        <input
                            type="url"
                            id="streamUrl"
                            name="streamUrl"
                            value={formData.streamUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/stream.m3u8"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="previewImage">Превью изображение (опционально):</label>
                        <input
                            type="url"
                            id="previewImage"
                            name="previewImage"
                            value={formData.previewImage}
                            onChange={handleChange}
                            placeholder="https://example.com/preview.jpg"
                        />
                        {formData.previewImage && (
                            <div className="preview-thumbnail">
                                <img
                                    src={formData.previewImage}
                                    alt="Превью"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Отмена
                        </button>
                        <button type="submit" className="btn-submit">
                            {editMatch ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MatchModal;
