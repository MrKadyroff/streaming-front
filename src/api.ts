import axios from 'axios';

const API_BASE = 'http://13.62.12.103/';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});

// Типы данных
export interface CreateAdDto {
    title: string;
    type: 'vertical' | 'square' | 'horizontal';
    position: 'header' | 'sidebar';
    imageUrl: string;
    clickUrl: string;
    startDate: string;
    endDate: string;
    priority: number;
    targetAudience: string;
}

export interface UpdateAdDto extends Partial<CreateAdDto> { }

export interface CreateMatchDto {
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    tournament: string;
    sport: string;
    venue: string;
    status: string;
}

export interface UpdateMatchDto extends Partial<CreateMatchDto> { }

// API функции
export const getStreams = () => api.get('/api/admin/streams');
export const getHlsStreams = () => api.get('/api/admin/streams');
export const getUsers = () => api.get('/api/admin/users');
export const getAds = () => api.get('/api/admin/ads');
export const getMatches = () => api.get('/api/admin/schedule');
export const getReports = () => api.get('/api/admin/reports');
export const getHealth = () => api.get('/health');

// Управление рекламой
export const createAd = (data: CreateAdDto) => api.post('/api/admin/ads', data);
export const updateAd = (id: string | number, data: UpdateAdDto) => api.put(`/api/admin/ads/${id}`, data);
export const deleteAd = (id: string | number) => api.delete(`/api/admin/ads/${id}`);
export const activateAd = (id: string | number) => api.put(`/api/admin/ads/${id}/activate`);
export const deactivateAd = (id: string | number) => api.put(`/api/admin/ads/${id}/deactivate`);

// Управление матчами
export const createMatch = (data: CreateMatchDto) => api.post('/api/admin/schedule', data);
export const updateMatch = (id: string | number, data: UpdateMatchDto) => api.put(`/api/admin/schedule/${id}`, data);
export const deleteMatch = (id: string | number) => api.delete(`/api/admin/schedule/${id}`);

// Управление пользователями
export const createUser = (data: any) => api.post('/api/admin/users', data);
export const updateUser = (id: string | number, data: any) => api.put(`/api/admin/users/${id}`, data);
export const deleteUser = (id: string | number) => api.delete(`/api/admin/users/${id}`);

// Управление жалобами
export const createReport = (data: any) => api.post('/api/admin/reports', data);
export const updateReport = (id: string | number, data: any) => api.put(`/api/admin/reports/${id}`, data);
export const deleteReport = (id: string | number) => api.delete(`/api/admin/reports/${id}`);

// Управление стримами
export const createStream = (data: any) => api.post('/api/admin/streams', data);
export const updateStream = (id: string | number, data: any) => api.put(`/api/admin/streams/${id}`, data);
export const deleteStream = (id: string | number) => api.delete(`/api/admin/streams/${id}`);

export default api;
