export interface Match {
    id: string;
    player1: string;
    player2: string;
    date: string;
    time: string;
    tournament: string;
    sport: string;
    isLive: boolean;
    status: 'upcoming' | 'live' | 'finished';
    streamUrl?: string;
    fallbackUrl?: string;
    previewImage?: string;
    // Футбольные данные
    homeTeam?: FootballTeamInfo;
    awayTeam?: FootballTeamInfo;
    score?: {
        home: number | null;
        away: number | null;
    };
    venue?: string;
}

export interface FootballTeamInfo {
    id: number;
    name: string;
    shortName: string;
    logo: string;
    founded?: number;
    venue?: string;
    squad?: PlayerInfo[];
}

export interface PlayerInfo {
    id: number;
    name: string;
    position: string;
    dateOfBirth?: string;
    nationality?: string;
    shirtNumber?: number;
}

export interface Tournament {
    id: string;
    name: string;
    sport: string;
    startDate: string;
    endDate: string;
    location: string;
}

export interface Stream {
    id: string;
    matchId: string;
    url: string;
    quality: 'auto' | '1080p' | '720p' | '480p' | '360p';
    isActive: boolean;
}

export interface SportCategory {
    id: string;
    name: string;
    slug: string;
    icon: string;
}

export type Theme = 'light' | 'dark';

export interface PlayerConfig {
    primarySrc: string;
    fallbackSrc?: string;
    checkIntervalMs?: number;
    requestTimeoutMs?: number;
    autoPlayMuted?: boolean;
    retryBaseDelayMs?: number;
    retryMaxDelayMs?: number;
}

export interface VideoLevel {
    index: number;
    height?: number;
    bitrate: number;
    name: string;
}
