import { useState, useEffect } from 'react';
import { BannerData } from '../PromoBanner';
import { Match } from '../../types';
import { Stream } from './StreamsManagement';
import {
    getStreams,
    getUsers,
    getAds,
    getReports,
    getHealth,
    createAd,
    updateAd as apiUpdateAd,
    deleteAd as apiDeleteAd,
    activateAd,
    deactivateAd,
    CreateAdDto
} from '../../api';

export const useAdminData = () => {
    const [serverHealth, setServerHealth] = useState<string>('Проверка...');
    const [apiUsers, setApiUsers] = useState<any[]>([]);
    const [apiReports, setApiReports] = useState<any[]>([]);
    const [hlsStreams, setHlsStreams] = useState<any[]>([]);
    const [allStreams, setAllStreams] = useState<Stream[]>([]);
    const [allAds, setAllAds] = useState<BannerData[]>([]);
    const [filteredAds, setFilteredAds] = useState<BannerData[]>([]);
    const [adsFilter, setAdsFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [adsSort, setAdsSort] = useState<'priority' | 'title' | 'date'>('priority');
    const [adsLoading, setAdsLoading] = useState<boolean>(false);
    const [streamsLoading, setStreamsLoading] = useState<boolean>(false);

    // Загружаем данные с API при запуске компонента
    useEffect(() => {
        loadApiData();
    }, []);

    // Фильтрация и сортировка рекламы
    useEffect(() => {


        let filtered = [...allAds];

        // Применяем фильтр
        if (adsFilter === 'active') {
            filtered = filtered.filter(ad => ad.isActive);

        } else if (adsFilter === 'inactive') {
            filtered = filtered.filter(ad => !ad.isActive);

        }

        // Применяем сортировку
        filtered.sort((a, b) => {
            switch (adsSort) {
                case 'priority':
                    return (b.priority || 0) - (a.priority || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
                default:
                    return 0;
            }
        });

        console.log('Финальный отфильтрованный список:', filtered);
        setFilteredAds(filtered);
    }, [allAds, adsFilter, adsSort]);

    const loadApiData = async () => {
        setAdsLoading(true);
        try {


            // Проверяем здоровье сервера

            await getHealth();
            setServerHealth('Онлайн');


            // Загружаем все данные
            console.log('📡 Загружаем данные с API...');
            const [streamsRes, usersRes, reportsRes, adsRes] = await Promise.all([
                getStreams().catch(err => {
                    console.error('❌ Ошибка загрузки стримов:', err);
                    return { data: { streams: [] } };
                }),
                getUsers().catch(err => {
                    console.error('❌ Ошибка загрузки пользователей:', err);
                    return { data: [] };
                }),
                getReports().catch(err => {
                    console.error('❌ Ошибка загрузки отчетов:', err);
                    return { data: [] };
                }),
                getAds().catch(err => {
                    console.error('❌ Ошибка загрузки рекламы:', err);
                    return { data: [] };
                })
            ]);

            // Обрабатываем стримы
            if (streamsRes?.data?.streams && Array.isArray(streamsRes.data.streams)) {
                setAllStreams(streamsRes.data.streams);
            } else {
                setAllStreams([]);
            }

            setApiUsers(usersRes?.data || []);
            setApiReports(reportsRes?.data || []);
            setHlsStreams([]);

            // Загружаем рекламные объявления с улучшенной обработкой

            let adsArray = [];

            // API возвращает данные в формате {"ads": [...], "total": 6}
            if (adsRes && adsRes.data && Array.isArray(adsRes.data.ads)) {

                adsArray = adsRes.data.ads;
            } else if (adsRes && Array.isArray(adsRes.data)) {

                adsArray = adsRes.data;
            } else {

                if (adsRes && adsRes.data) {

                }
                adsArray = [];
            }



            if (adsArray && adsArray.length > 0) {


                const adsData = adsArray.map((ad: any, index: number) => {

                    const processed = {
                        id: ad.id || ad._id || `mock-${Date.now()}-${index}`,
                        title: ad.title || 'Без названия',
                        type: ad.type || 'vertical',
                        imageUrl: ad.imageUrl || '',
                        gifUrl: ad.imageUrl || ad.gifUrl || '',
                        clickUrl: ad.clickUrl || '',
                        isActive: ad.status === 'active',
                        priority: ad.priority || 1,
                        startDate: ad.startDate || new Date().toISOString(),
                        endDate: ad.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        position: ad.position || (ad.type === 'horizontal' ? 'header' : 'sidebar')
                    };

                    return processed;
                });


                setAllAds(adsData);

            } else {

                setAllAds([]);

            }

        } catch (error) {

            setServerHealth('Оффлайн');

            // Показываем более подробную информацию об ошибке
            if (error instanceof Error) {

            }

            // Проверяем, является ли ошибка HTTP ошибкой
            if (error && typeof error === 'object' && 'response' in error) {
                const httpError = error as any;
                console.error('🌐 Ошибка HTTP:', httpError.response?.status);
                console.error('📄 Ответ сервера:', httpError.response?.data);
            }
        } finally {
            setAdsLoading(false);
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить это рекламное объявление?')) {
            setAdsLoading(true);
            try {
                // Удаляем через API
                await apiDeleteAd(id);

                // Обновляем локальное состояние
                setAllAds(prev => prev.filter(ad => ad.id !== id));

                // Перезагружаем данные для синхронизации
                await loadApiData();

                console.log('Рекламное объявление успешно удалено');
            } catch (error) {
                console.error('Ошибка при удалении рекламы:', error);
                alert('Ошибка при удалении рекламы. Проверьте соединение с сервером.');
            } finally {
                setAdsLoading(false);
            }
        }
    };

    const handleToggleAd = async (ad: BannerData) => {
        setAdsLoading(true);
        try {
            // Переключаем активность через API
            if (ad.isActive) {
                await deactivateAd(ad.id);
            } else {
                await activateAd(ad.id);
            }

            // Обновляем локальное состояние
            const updatedAd = { ...ad, isActive: !ad.isActive };
            setAllAds(prev => prev.map(a => a.id === ad.id ? updatedAd : a));

            // Перезагружаем данные для синхронизации
            await loadApiData();

            console.log(`Реклама ${updatedAd.isActive ? 'активирована' : 'деактивирована'}`);
        } catch (error) {
            console.error('Ошибка при изменении статуса рекламы:', error);
            alert('Ошибка при изменении статуса рекламы. Проверьте соединение с сервером.');
        } finally {
            setAdsLoading(false);
        }
    };

    const createAdFromForm = async (formData: any, editingAd: BannerData | null) => {
        setAdsLoading(true);
        try {
            const dto: CreateAdDto = {
                title: formData.title,
                type: formData.type,
                position: (formData.type === 'horizontal' ? 'header' : 'sidebar') as 'header' | 'sidebar',
                imageUrl: formData.imageUrl || formData.gifUrl || '',
                clickUrl: formData.clickUrl || '',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 1,
                targetAudience: 'sports'
            };


            if (editingAd) {
                // Обновляем существующую рекламу через API
                await apiUpdateAd(editingAd.id, dto);
                // Обновляем локальное состояние
                const updatedAd: BannerData = {
                    ...editingAd,
                    title: formData.title,
                    type: formData.type,
                    imageUrl: formData.imageUrl,
                    gifUrl: formData.gifUrl,
                    clickUrl: formData.clickUrl,
                    position: dto.position,
                    priority: dto.priority,
                    startDate: dto.startDate,
                    endDate: dto.endDate
                };
                setAllAds(prev => prev.map(ad => ad.id === editingAd.id ? updatedAd : ad));
            } else {
                // Создаем новую рекламу через API
                const response = await createAd(dto);

                // Добавляем в локальное состояние
                const newAd: BannerData = {
                    id: (response.data?.ad?.id || response.data?.id || Date.now()).toString(),
                    title: formData.title,
                    type: formData.type,
                    imageUrl: formData.imageUrl,
                    gifUrl: formData.gifUrl,
                    clickUrl: formData.clickUrl,
                    isActive: false, // Новая реклама создается как неактивная
                    position: dto.position,
                    priority: dto.priority,
                    startDate: dto.startDate,
                    endDate: dto.endDate
                };
                setAllAds(prev => [...prev, newAd]);
            }

            // Обновляем данные с сервера для синхронизации
            await loadApiData();
        } catch (error) {
            console.error('Ошибка при сохранении рекламы:', error);
            alert('Ошибка при сохранении рекламы. Проверьте соединение с сервером.');
            throw error;
        } finally {
            setAdsLoading(false);
        }
    };

    const loadStreams = async () => {
        setStreamsLoading(true);
        try {
            const streamsRes = await getStreams();
            if (streamsRes?.data?.streams && Array.isArray(streamsRes.data.streams)) {
                setAllStreams(streamsRes.data.streams);
            } else {
                setAllStreams([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки стримов:', error);
            setAllStreams([]);
        } finally {
            setStreamsLoading(false);
        }
    };

    return {
        serverHealth,
        apiUsers,
        apiReports,
        hlsStreams,
        allStreams,
        streamsLoading,
        allAds,
        filteredAds,
        adsFilter,
        adsSort,
        adsLoading,
        setAdsFilter,
        setAdsSort,
        loadApiData,
        loadStreams,
        handleDeleteAd,
        handleToggleAd,
        createAdFromForm
    };
};
