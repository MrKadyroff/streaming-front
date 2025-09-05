import axios from 'axios';

// API для получения данных о футбольных командах и матчах
// Используем бесплатный API Football-Data.org
const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';
const API_KEY = 'YOUR_API_KEY'; // Нужно будет получить бесплатный ключ

// Интерфейсы для типизации
export interface FootballTeam {
    id: number;
    name: string;
    shortName: string;
    tla: string; // Three Letter Abbreviation
    crest: string; // URL логотипа
    founded: number;
    venue: string;
    website: string;
    squad?: Player[];
}

export interface Player {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
    shirtNumber?: number;
}

export interface FootballMatch {
    id: number;
    homeTeam: FootballTeam;
    awayTeam: FootballTeam;
    utcDate: string;
    status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED';
    matchday: number;
    competition: {
        id: number;
        name: string;
        emblem: string;
    };
    score?: {
        fullTime: {
            home: number | null;
            away: number | null;
        };
    };
}

export interface Competition {
    id: number;
    name: string;
    code: string;
    emblem: string;
    currentSeason: {
        id: number;
        startDate: string;
        endDate: string;
        currentMatchday: number;
    };
}

// Создаем инстанс axios с базовой конфигурацией
const footballApi = axios.create({
    baseURL: FOOTBALL_API_BASE,
    headers: {
        'X-Auth-Token': API_KEY,
    },
});

// Основные функции API
export const footballApiService = {
    // Получить популярные лиги
    async getCompetitions(): Promise<Competition[]> {
        try {
            const response = await footballApi.get('/competitions');
            return response.data.competitions;
        } catch (error) {
            console.error('Error fetching competitions:', error);
            // Возвращаем моковые данные в случае ошибки
            return getMockCompetitions();
        }
    },

    // Получить команды лиги
    async getTeams(competitionId: number): Promise<FootballTeam[]> {
        try {
            const response = await footballApi.get(`/competitions/${competitionId}/teams`);
            return response.data.teams;
        } catch (error) {
            console.error('Error fetching teams:', error);
            return getMockTeams();
        }
    },

    // Получить состав команды
    async getTeamSquad(teamId: number): Promise<Player[]> {
        try {
            const response = await footballApi.get(`/teams/${teamId}`);
            return response.data.squad || [];
        } catch (error) {
            console.error('Error fetching team squad:', error);
            return getMockPlayers();
        }
    },

    // Получить матчи лиги
    async getMatches(competitionId?: number, dateFrom?: string, dateTo?: string): Promise<FootballMatch[]> {
        try {
            let url = '/matches';
            const params = new URLSearchParams();

            if (competitionId) {
                url = `/competitions/${competitionId}/matches`;
            }
            if (dateFrom) params.append('dateFrom', dateFrom);
            if (dateTo) params.append('dateTo', dateTo);

            const queryString = params.toString();
            if (queryString) url += `?${queryString}`;

            const response = await footballApi.get(url);
            return response.data.matches;
        } catch (error) {
            console.error('Error fetching matches:', error);
            return getMockMatches();
        }
    },

    // Получить конкретную команду
    async getTeam(teamId: number): Promise<FootballTeam> {
        try {
            const response = await footballApi.get(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching team:', error);
            return getMockTeams()[0];
        }
    }
};

// Моковые данные для разработки (когда API недоступен)
function getMockCompetitions(): Competition[] {
    return [
        {
            id: 2021,
            name: 'Premier League',
            code: 'PL',
            emblem: 'https://crests.football-data.org/PL.png',
            currentSeason: {
                id: 2024,
                startDate: '2024-08-17',
                endDate: '2025-05-25',
                currentMatchday: 3
            }
        },
        {
            id: 2014,
            name: 'La Liga',
            code: 'PD',
            emblem: 'https://crests.football-data.org/PD.png',
            currentSeason: {
                id: 2024,
                startDate: '2024-08-18',
                endDate: '2025-05-25',
                currentMatchday: 3
            }
        },
        {
            id: 2002,
            name: 'Bundesliga',
            code: 'BL1',
            emblem: 'https://crests.football-data.org/BL1.png',
            currentSeason: {
                id: 2024,
                startDate: '2024-08-23',
                endDate: '2025-05-17',
                currentMatchday: 2
            }
        }
    ];
}

function getMockTeams(): FootballTeam[] {
    return [
        {
            id: 86,
            name: 'Real Madrid CF',
            shortName: 'Real Madrid',
            tla: 'RMA',
            crest: 'https://crests.football-data.org/86.png',
            founded: 1902,
            venue: 'Santiago Bernabéu',
            website: 'http://www.realmadrid.com'
        },
        {
            id: 81,
            name: 'FC Barcelona',
            shortName: 'Barcelona',
            tla: 'FCB',
            crest: 'https://crests.football-data.org/81.png',
            founded: 1899,
            venue: 'Camp Nou',
            website: 'http://www.fcbarcelona.com'
        },
        {
            id: 57,
            name: 'Arsenal FC',
            shortName: 'Arsenal',
            tla: 'ARS',
            crest: 'https://crests.football-data.org/57.png',
            founded: 1886,
            venue: 'Emirates Stadium',
            website: 'http://www.arsenal.com'
        },
        {
            id: 61,
            name: 'Chelsea FC',
            shortName: 'Chelsea',
            tla: 'CHE',
            crest: 'https://crests.football-data.org/61.png',
            founded: 1905,
            venue: 'Stamford Bridge',
            website: 'http://www.chelseafc.com'
        }
    ];
}

function getMockPlayers(): Player[] {
    return [
        {
            id: 1,
            name: 'Vinícius Júnior',
            position: 'Left Winger',
            dateOfBirth: '2000-07-12',
            nationality: 'Brazil',
            shirtNumber: 7
        },
        {
            id: 2,
            name: 'Jude Bellingham',
            position: 'Central Midfield',
            dateOfBirth: '2003-06-29',
            nationality: 'England',
            shirtNumber: 5
        },
        {
            id: 3,
            name: 'Kylian Mbappé',
            position: 'Centre-Forward',
            dateOfBirth: '1998-12-20',
            nationality: 'France',
            shirtNumber: 9
        }
    ];
}

function getMockMatches(): FootballMatch[] {
    const teams = getMockTeams();
    return [
        {
            id: 1,
            homeTeam: teams[0], // Real Madrid
            awayTeam: teams[1], // Barcelona
            utcDate: '2025-09-05T19:00:00Z',
            status: 'SCHEDULED',
            matchday: 5,
            competition: {
                id: 2014,
                name: 'La Liga',
                emblem: 'https://crests.football-data.org/PD.png'
            }
        },
        {
            id: 2,
            homeTeam: teams[2], // Arsenal
            awayTeam: teams[3], // Chelsea
            utcDate: '2025-09-05T16:30:00Z',
            status: 'LIVE',
            matchday: 4,
            competition: {
                id: 2021,
                name: 'Premier League',
                emblem: 'https://crests.football-data.org/PL.png'
            },
            score: {
                fullTime: {
                    home: 1,
                    away: 0
                }
            }
        }
    ];
}

export default footballApiService;
