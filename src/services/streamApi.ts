import axios from 'axios';

const API_BASE_URL = 'http://185.4.180.54:5001/api';

export interface Stream {
    id: string;
    title: string;
    streamUrl: string;
    isActive: boolean;
    thumbnail?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
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
            const response = await this.api.get(`/admin/streams`, {
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
            return response.streams.filter(stream =>
                stream.isActive &&
                stream.streamUrl &&
                stream.streamUrl.includes('.m3u8')
            );
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
