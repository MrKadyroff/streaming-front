import React, { useState } from 'react';
import { FootballTeamInfo } from '../types';
import { footballTeams, teamsByLeague } from '../data/footballTeams';
import './TeamSelector.css';

interface TeamSelectorProps {
    selectedTeam: FootballTeamInfo | null;
    onTeamSelect: (team: FootballTeamInfo | null) => void;
    placeholder?: string;
    label?: string;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
    selectedTeam,
    onTeamSelect,
    placeholder = "Выберите команду",
    label
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeague, setSelectedLeague] = useState<string>('all');

    const filteredTeams = () => {
        let teams = selectedLeague === 'all'
            ? footballTeams
            : teamsByLeague[selectedLeague as keyof typeof teamsByLeague] || [];

        if (searchQuery) {
            teams = teams.filter(team =>
                team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                team.shortName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return teams;
    };

    const handleTeamSelect = (team: FootballTeamInfo) => {
        onTeamSelect(team);
        setIsOpen(false);
        setSearchQuery('');
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onTeamSelect(null);
    };

    return (
        <div className="team-selector">
            {label && <label className="team-selector-label">{label}</label>}

            <div className="team-selector-container">
                <div
                    className={`team-selector-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedTeam ? (
                        <div className="selected-team">
                            <img
                                src={selectedTeam.logo}
                                alt={selectedTeam.name}
                                className="team-logo-small"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="team-name">{selectedTeam.name}</span>
                            <button
                                className="clear-selection"
                                onClick={clearSelection}
                                type="button"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <span className="placeholder">{placeholder}</span>
                    )}
                    <span className="dropdown-arrow">▼</span>
                </div>

                {isOpen && (
                    <div className="team-selector-dropdown">
                        <div className="dropdown-header">
                            <input
                                type="text"
                                placeholder="Поиск команды..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="team-search"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <select
                                value={selectedLeague}
                                onChange={(e) => setSelectedLeague(e.target.value)}
                                className="league-filter"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option value="all">Все лиги</option>
                                {Object.keys(teamsByLeague).map(league => (
                                    <option key={league} value={league}>
                                        {league}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="teams-list">
                            {filteredTeams().map(team => (
                                <div
                                    key={team.id}
                                    className="team-option"
                                    onClick={() => handleTeamSelect(team)}
                                >
                                    <img
                                        src={team.logo}
                                        alt={team.name}
                                        className="team-logo-small"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="team-info">
                                        <span className="team-name">{team.name}</span>
                                        <span className="team-short">{team.shortName}</span>
                                        {team.venue && (
                                            <span className="team-venue">{team.venue}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {filteredTeams().length === 0 && (
                                <div className="no-teams">
                                    Команды не найдены
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamSelector;
