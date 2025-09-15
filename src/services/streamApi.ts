import axios from 'axios';

const API_BASE_URL = 'https://f4u.online/';

export interface Stream {
    id: number;
    title: string;
    status: 'upcoming' | 'live' | 'ended' | 'offline';
    viewers: number | null;
    streamUrl: string;
    fallbackUrl: string;
    startTime: string | null;
    scheduledTime?: string | null;
    quality: string[];
    thumbnail?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    // Для обратной совместимости
    isActive?: boolean;
}

export interface StreamsResponse {
    streams: Stream[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class StreamApiService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
    });

    async getStreams(page: number = 1, limit: number = 20): Promise<StreamsResponse> {
        try {
            const response = await this.api.get(`/api/admin/streams`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching streams:', error);
            throw new Error('Не удалось загрузить список трансляций');
        }
    }

    async getActiveStreams(): Promise<Stream[]> {
        try {
            const response = await this.getStreams(1, 50);
            console.log('Полученные стримы:', response.streams);

            // Фильтруем стримы - берем все, у которых есть streamUrl
            const activeStreams = response.streams.filter(stream => {
                const hasStreamUrl = stream.streamUrl && stream.streamUrl.trim() !== '';
                console.log(`Стрим ${stream.title}: streamUrl=${stream.streamUrl}, hasUrl=${hasStreamUrl}`);
                return hasStreamUrl;
            });

            console.log('Активные стримы:', activeStreams);
            return activeStreams;
        } catch (error) {
            console.error('Error fetching active streams:', error);
            return [];
        }
    }

    async getUpcomingStreams(): Promise<Stream[]> {
        try {
            const response = await this.getStreams(1, 50);
            // Фильтруем предстоящие стримы
            const upcomingStreams = response.streams.filter(stream =>
                stream.status === 'upcoming' && (stream.scheduledTime || stream.startTime)
            );

            // Сортируем по времени начала (используем scheduledTime приоритетно)
            return upcomingStreams.sort((a, b) => {
                const timeA = new Date((a.scheduledTime || a.startTime)!).getTime();
                const timeB = new Date((b.scheduledTime || b.startTime)!).getTime();
                return timeA - timeB;
            });
        } catch (error) {
            console.error('Error fetching upcoming streams:', error);
            return [];
        }
    }

    async getFirstActiveStream(): Promise<Stream | null> {
        try {
            const activeStreams = await this.getActiveStreams();
            return activeStreams.length > 0 ? activeStreams[0] : null;
        } catch (error) {
            console.error('Error fetching first active stream:', error);
            return null;
        }
    }
}

export const streamApi = new StreamApiService();
