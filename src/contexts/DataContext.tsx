import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Match, SportCategory } from '../types';
import { getMatches } from '../api';

interface DataContextProps {
    matches: Match[];
    liveMatches: Match[];
    upcomingMatches: Match[];
    categories: SportCategory[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    loadMatches: () => Promise<void>;
    addMatch: (match: Omit<Match, 'id'>) => void;
    updateMatch: (id: string, match: Omit<Match, 'id'>) => void;
    deleteMatch: (id: string) => void;
    isLoading: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

const mockCategories: SportCategory[] = [
    { id: 'football', name: 'Футбол', slug: 'football', icon: '' }
];

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Computed values
    const liveMatches = matches.filter(match => match.isLive && match.status === 'live');
    const upcomingMatches = matches.filter(match => !match.isLive && match.status === 'upcoming');

    const loadMatches = async () => {
        setIsLoading(true);
        try {
            const response = await getMatches();
            const apiMatches = response.data.matches || response.data;
            const convertedMatches: Match[] = apiMatches.map((apiMatch: Record<string, any>) => ({
                id: apiMatch.id?.toString() || '',
                player1: typeof apiMatch.homeTeam === 'string' ? apiMatch.homeTeam : apiMatch.player1 || (apiMatch.homeTeam?.name ?? 'Команда 1'),
                player2: typeof apiMatch.awayTeam === 'string' ? apiMatch.awayTeam : apiMatch.player2 || (apiMatch.awayTeam?.name ?? 'Команда 2'),
                date: apiMatch.date || new Date().toISOString().split('T')[0],
                time: apiMatch.time || '00:00',
                tournament: apiMatch.tournament || 'Турнир',
                sport: apiMatch.sport || 'football',
                isLive: apiMatch.status === 'live' || false,
                status: apiMatch.status || 'upcoming',
                streamUrl: apiMatch.streamUrl || '',
                previewImage: apiMatch.previewImage || '',
                homeTeam: apiMatch.homeTeam,
                awayTeam: apiMatch.awayTeam,
                venue: apiMatch.venue || ''
            }));
            setMatches(convertedMatches);
        } catch (error) {
            setMatches([]);
        } finally {
            setIsLoading(false);
        }
    };

    const addMatch = (match: Omit<Match, 'id'>) => {
        const newMatch = {
            ...match,
            id: Date.now().toString()
        };
        setMatches(prev => [...prev, newMatch]);
    };

    const updateMatch = (id: string, match: Omit<Match, 'id'>) => {
        setMatches(prev => prev.map(m => m.id === id ? { ...match, id } : m));
    };

    const deleteMatch = (id: string) => {
        setMatches(prev => prev.filter(m => m.id !== id));
    };

    useEffect(() => {
        loadMatches();
    }, []);

    return (
        <DataContext.Provider
            value={{
                matches,
                liveMatches,
                upcomingMatches,
                categories: mockCategories,
                selectedCategory,
                setSelectedCategory,
                loadMatches,
                addMatch,
                updateMatch,
                deleteMatch,
                isLoading
            }}
        >
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
