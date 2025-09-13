import axios from 'axios';

const API_BASE_URL = 'https://f4u.online';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// TypeScript interfaces based on Swagger documentation
export interface CreateAdDto {
    title: string;
    type: string;
    position: string;
    imageUrl: string;
    clickUrl: string;
    startDate: string; // format: date-time
    endDate: string; // format: date-time
    priority: number; // format: int32
    targetAudience: string;
}

export interface CreateMatchDto {
    homeTeam: string;
    awayTeam: string;
    date: string; // format: date-time
    time: string;
    tournament: string;
    sport: string;
    venue: string;
}

export interface CreateStreamDto {
    title: string;
    description?: string;
    streamUrl: string;
    fallbackUrl?: string;
    scheduledTime?: string; // format: date-time
    sport?: string;
    tournament?: string;
    homeTeam?: string;
    awayTeam?: string;
}

export interface ResolveReportDto {
    action: string;
    comment?: string;
}

export interface UpdateUserStatusDto {
    reason?: string;
    duration?: string;
}

// Ads
export const getAds = (params?: { type?: string; status?: string }) => api.get('/api/admin/ads', { params });
export const getAd = (id: string | number) => api.get(`/api/admin/ads/${id}`);
export const createAd = (data: CreateAdDto) => api.post('/api/admin/ads', data);
export const updateAd = (id: string | number, data: CreateAdDto) => api.put(`/api/admin/ads/${id}`, data);
export const deleteAd = (id: string | number) => api.delete(`/api/admin/ads/${id}`);
export const activateAd = (id: string | number) => api.put(`/api/admin/ads/${id}/activate`);
export const deactivateAd = (id: string | number) => api.put(`/api/admin/ads/${id}/deactivate`);
export const getAdStats = (id: string | number) => api.get(`/api/admin/ads/${id}/stats`);

// Matches
export const getMatches = () => api.get('/api/admin/schedule');
export const getMatch = (id: string | number) => api.get(`/api/admin/schedule/${id}`);
export const createMatch = (data: CreateMatchDto) => api.post('/api/admin/schedule', data);
export const updateMatch = (id: string | number, data: CreateMatchDto) => api.put(`/api/admin/schedule/${id}`, data);
export const deleteMatch = (id: string | number) => api.delete(`/api/admin/schedule/${id}`);

// Streams
export const getStreams = () => api.get('/api/admin/streams');
export const getStream = (id: string | number) => api.get(`/api/admin/streams/${id}`);
export const createStream = (data: CreateStreamDto) => api.post('/api/admin/streams', data);
export const updateStream = (id: string | number, data: CreateStreamDto) => api.put(`/api/admin/streams/${id}`, data);
export const deleteStream = (id: string | number) => api.delete(`/api/admin/streams/${id}`);
export const startStream = (id: string | number) => api.put(`/api/admin/streams/${id}/start`);
export const stopStream = (id: string | number) => api.put(`/api/admin/streams/${id}/stop`);

// Reports
export const getReports = () => api.get('/api/admin/reports');
export const getReport = (id: string | number) => api.get(`/api/admin/reports/${id}`);
export const resolveReport = (id: string | number, data: ResolveReportDto) => api.put(`/api/admin/reports/${id}/resolve`, data);
export const createReport = (data: any) => api.post('/api/admin/reports', data);
export const updateReport = (id: string | number, data: any) => api.put(`/api/admin/reports/${id}`, data);
export const deleteReport = (id: string | number) => api.delete(`/api/admin/reports/${id}`);

// Users
export const getUsers = (params?: { role?: string; status?: string }) => api.get('/api/admin/users', { params });
export const getUser = (id: string | number) => api.get(`/api/admin/users/${id}`);
export const banUser = (id: string | number, data?: UpdateUserStatusDto) => api.put(`/api/admin/users/${id}/ban`, data);
export const unbanUser = (id: string | number) => api.put(`/api/admin/users/${id}/unban`);
export const createUser = (data: any) => api.post('/api/admin/users', data);
export const updateUser = (id: string | number, data: any) => api.put(`/api/admin/users/${id}`, data);
export const deleteUser = (id: string | number) => api.delete(`/api/admin/users/${id}`);

// HLS Streams (public endpoint)
export const getHlsStreams = () => api.get('/api/hls/streams');

// Health Check
export const getHealth = () => api.get('/Health');

// Webhook endpoints (for reference)
// POST /hooks/rtmp/on_publish
// POST /hooks/rtmp/on_publish_done  
// POST /stream/done
// POST /stream/validate

export default api;
