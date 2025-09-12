import axios from 'axios';

const API_BASE_URL = 'https://f4u.online/';

export interface Stream {
    id: number;
    title: string;
    status: 'upcoming' | 'live' | 'ended' | 'offline';
    viewers: number;
    streamUrl: string;
    fallbackUrl: string;
    startTime: string | null;
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
