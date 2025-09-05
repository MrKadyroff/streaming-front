import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Match, SportCategory } from '../types';

interface DataContextType {
    matches: Match[];
    categories: SportCategory[];
    liveMatches: Match[];
    upcomingMatches: Match[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredMatches: Match[];
    addMatch: (match: Omit<Match, 'id'>) => void;
    updateMatch: (id: string, updates: Partial<Match>) => void;
    deleteMatch: (id: string) => void;
    toggleMatchStatus: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

// Моковые футбольные данные
const mockFootballMatches: Match[] = [
    {
        id: '1',
        player1: 'Real Madrid',
        player2: 'FC Barcelona',
        date: '2025-09-05',
        time: '19:00',
        tournament: 'La Liga',
        sport: 'football',
        isLive: true,
        status: 'live',
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        previewImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop',
        venue: 'Santiago Bernabéu',
        homeTeam: {
            id: 86,
            name: 'Real Madrid CF',
            shortName: 'Real Madrid',
            logo: 'https://crests.football-data.org/86.png',
            founded: 1902,
            venue: 'Santiago Bernabéu',
            squad: [
                {
                    id: 1,
                    name: 'Vinícius Júnior',
                    position: 'LW',
                    nationality: 'Brazil',
                    shirtNumber: 7
                },
                {
                    id: 2,
                    name: 'Jude Bellingham',
                    position: 'CM',
                    nationality: 'England',
                    shirtNumber: 5
                },
                {
                    id: 3,
                    name: 'Kylian Mbappé',
                    position: 'CF',
                    nationality: 'France',
                    shirtNumber: 9
                }
            ]
        },
        awayTeam: {
            id: 81,
            name: 'FC Barcelona',
            shortName: 'Barcelona',
            logo: 'https://crests.football-data.org/81.png',
            founded: 1899,
            venue: 'Camp Nou',
            squad: [
                {
                    id: 4,
                    name: 'Robert Lewandowski',
                    position: 'CF',
                    nationality: 'Poland',
                    shirtNumber: 9
                },
                {
                    id: 5,
                    name: 'Pedri',
                    position: 'CM',
                    nationality: 'Spain',
                    shirtNumber: 8
                },
                {
                    id: 6,
                    name: 'Gavi',
                    position: 'CM',
                    nationality: 'Spain',
                    shirtNumber: 6
                }
            ]
        },
        score: {
            home: 2,
            away: 1
        }
    },
    {
        id: '2',
        player1: 'Arsenal',
        player2: 'Chelsea',
        date: '2025-09-05',
        time: '16:30',
        tournament: 'Premier League',
        sport: 'football',
        isLive: false,
        status: 'upcoming',
        previewImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop',
        venue: 'Emirates Stadium',
        homeTeam: {
            id: 57,
            name: 'Arsenal FC',
            shortName: 'Arsenal',
            logo: 'https://crests.football-data.org/57.png',
            founded: 1886,
            venue: 'Emirates Stadium',
            squad: [
                {
                    id: 7,
                    name: 'Bukayo Saka',
                    position: 'RW',
                    nationality: 'England',
                    shirtNumber: 7
                },
                {
                    id: 8,
                    name: 'Martin Ødegaard',
                    position: 'CAM',
                    nationality: 'Norway',
                    shirtNumber: 8
                },
                {
                    id: 9,
                    name: 'Gabriel Jesus',
                    position: 'CF',
                    nationality: 'Brazil',
                    shirtNumber: 9
                }
            ]
        },
        awayTeam: {
            id: 61,
            name: 'Chelsea FC',
            shortName: 'Chelsea',
            logo: 'https://crests.football-data.org/61.png',
            founded: 1905,
            venue: 'Stamford Bridge',
            squad: [
                {
                    id: 10,
                    name: 'Cole Palmer',
                    position: 'CAM',
                    nationality: 'England',
                    shirtNumber: 20
                },
                {
                    id: 11,
                    name: 'Enzo Fernández',
                    position: 'CM',
                    nationality: 'Argentina',
                    shirtNumber: 8
                },
                {
                    id: 12,
                    name: 'Nicolas Jackson',
                    position: 'CF',
                    nationality: 'Senegal',
                    shirtNumber: 15
                }
            ]
        }
    },
    {
        id: '3',
        player1: 'Liverpool',
        player2: 'Manchester City',
        date: '2025-09-05',
        time: '21:00',
        tournament: 'Premier League',
        sport: 'football',
        isLive: false,
        status: 'upcoming',
        previewImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=450&fit=crop',
        venue: 'Anfield',
        homeTeam: {
            id: 64,
            name: 'Liverpool FC',
            shortName: 'Liverpool',
            logo: 'https://crests.football-data.org/64.png',
            founded: 1892,
            venue: 'Anfield'
        },
        awayTeam: {
            id: 65,
            name: 'Manchester City',
            shortName: 'Man City',
            logo: 'https://crests.football-data.org/65.png',
            founded: 1880,
            venue: 'Etihad Stadium'
        }
    }
];

const mockCategories: SportCategory[] = [
    { id: 'football', name: 'Футбол', slug: 'football', icon: '' }
];

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [matches, setMatches] = useState<Match[]>(mockFootballMatches);
    const [categories] = useState<SportCategory[]>(mockCategories);
    const [selectedCategory, setSelectedCategory] = useState<string>('football');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const liveMatches = matches.filter(match => match.isLive);
    const upcomingMatches = matches.filter(match => !match.isLive);

    const filteredMatches = matches.filter(match => {
        const matchesCategory = selectedCategory === 'all' || match.sport === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            match.player1.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.player2.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.tournament.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const addMatch = (matchData: Omit<Match, 'id'>) => {
        const newMatch: Match = {
            ...matchData,
            id: Date.now().toString(),
        };
        setMatches(prev => [...prev, newMatch]);
    };

    const updateMatch = (id: string, updates: Partial<Match>) => {
        setMatches(prev => prev.map(match =>
            match.id === id ? { ...match, ...updates } : match
        ));
    };

    const deleteMatch = (id: string) => {
        setMatches(prev => prev.filter(match => match.id !== id));
    };

    const toggleMatchStatus = (id: string) => {
        setMatches(prev => prev.map(match =>
            match.id === id ? {
                ...match,
                isLive: !match.isLive,
                status: match.isLive ? 'upcoming' : 'live'
            } : match
        ));
    };

    return (
        <DataContext.Provider value={{
            matches,
            categories,
            liveMatches,
            upcomingMatches,
            selectedCategory,
            setSelectedCategory,
            searchQuery,
            setSearchQuery,
            filteredMatches,
            addMatch,
            updateMatch,
            deleteMatch,
            toggleMatchStatus,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
