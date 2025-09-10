import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BannerData } from '../components/PromoBanner';
import { getAds, createAd as apiCreateAd, updateAd as apiUpdateAd, deleteAd as apiDeleteAd, activateAd, deactivateAd, CreateAdDto } from '../api';

interface AdsContextType {
    ads: BannerData[];
    leftSideAds: BannerData[];
    rightSideAds: BannerData[];
    horizontalAds: BannerData[];
    addAd: (banner: Omit<BannerData, 'id'>) => void;
    updateAd: (id: string, updates: Partial<BannerData>) => void;
    deleteAd: (id: string) => void;
    toggleAdStatus: (id: string) => void;
    loadAds: () => Promise<void>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const useAds = () => {
    const context = useContext(AdsContext);
    if (!context) {
        throw new Error('useAds must be used within an AdsProvider');
    }
    return context;
};

interface AdsProviderProps {
    children: ReactNode;
}

export const AdsProvider: React.FC<AdsProviderProps> = ({ children }) => {
    const [ads, setAds] = useState<BannerData[]>([]);

    // Загружаем рекламу с API при запуске
    useEffect(() => {
        loadAds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Вспомогательная функция для преобразования BannerData в CreateAdDto
    const convertBannerToDto = (banner: Omit<BannerData, 'id'> | Partial<BannerData>): CreateAdDto => {
        return {
            title: banner.title || '',
            type: banner.type || 'vertical',
            position: banner.type === 'horizontal' ? 'header' : 'sidebar',
            imageUrl: banner.imageUrl || banner.gifUrl || '',
            clickUrl: banner.clickUrl || '',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 год
            priority: 1,
            targetAudience: 'sports'
        };
    };

    // Вспомогательная функция для преобразования API данных в BannerData
    const convertApiToBanner = (apiData: any): BannerData => {
        return {
            id: apiData.id.toString(),
            title: apiData.title,
            type: apiData.type || 'vertical',
            imageUrl: apiData.imageUrl || '',
            gifUrl: apiData.imageUrl || '',
            clickUrl: apiData.clickUrl || '',
            isActive: apiData.status === 'active',
            priority: apiData.priority || 1,
            startDate: apiData.startDate,
            endDate: apiData.endDate,
            position: apiData.position || (apiData.type === 'horizontal' ? 'header' : 'sidebar')
        };
    };

    const loadAds = async () => {
        try {
            const response = await getAds();
            console.log('📥 Ответ API для загрузки рекламы:', response.data);

            // API возвращает данные в формате {"ads": [...], "total": 6}
            const apiBanners = response.data?.ads?.map(convertApiToBanner) || [];
            console.log('✅ Обработанные объявления:', apiBanners);

            setAds(apiBanners);
        } catch (error) {
            console.error('Ошибка загрузки рекламы с API:', error);
            setAds([]);
        }
    };

    // Фильтрация рекламы по типам и позициям
    const leftSideAds = ads.filter(banner => banner.isActive && (banner.type === 'vertical' || banner.type === 'square'));
    const rightSideAds = ads.filter(banner => banner.isActive && (banner.type === 'vertical' || banner.type === 'square'));
    const horizontalAds = ads.filter(banner => banner.isActive && banner.type === 'horizontal');

    // Дебаг информация
    console.log('🔍 Текущие объявления в контексте:', ads);
    console.log('🔍 Активные левые объявления:', leftSideAds);
    console.log('🔍 Активные правые объявления:', rightSideAds);
    console.log('🔍 Активные горизонтальные объявления:', horizontalAds);

    const addAd = async (bannerData: Omit<BannerData, 'id'>) => {
        try {
            // Преобразуем данные для API
            const dto = convertBannerToDto(bannerData);
            console.log('🔄 Отправляем данные для создания рекламы:', dto);

            // Сначала добавляем через API
            const response = await apiCreateAd(dto);
            console.log('✅ Ответ API при создании:', response.data);

            // Затем добавляем в локальное состояние
            const newBanner: BannerData = {
                ...bannerData,
                id: (response.data?.ad?.id || response.data?.id || Date.now()).toString(),
                isActive: false // Новая реклама создается как неактивная
            };
            setAds(prev => [...prev, newBanner]);

            // Перезагружаем данные для синхронизации
            await loadAds();
        } catch (error) {
            console.error('Ошибка создания рекламы через API:', error);
            // Если API недоступно, добавляем только локально
            const newBanner: BannerData = {
                ...bannerData,
                id: Date.now().toString(),
            };
            setAds(prev => [...prev, newBanner]);
        }
    };

    const updateAd = async (id: string, updates: Partial<BannerData>) => {
        try {
            // Преобразуем данные для API
            const dto = convertBannerToDto(updates);
            // Сначала обновляем через API
            await apiUpdateAd(id, dto);
            // Затем обновляем локальное состояние
            setAds(prev => prev.map(banner =>
                banner.id === id ? { ...banner, ...updates } : banner
            ));
        } catch (error) {
            console.error('Ошибка обновления рекламы через API:', error);
            // Если API недоступно, обновляем только локально
            setAds(prev => prev.map(banner =>
                banner.id === id ? { ...banner, ...updates } : banner
            ));
        }
    };

    const deleteAd = async (id: string) => {
        try {
            // Сначала удаляем через API
            await apiDeleteAd(id);
            // Затем удаляем из локального состояния
            setAds(prev => prev.filter(banner => banner.id !== id));
        } catch (error) {
            console.error('Ошибка удаления рекламы через API:', error);
            // Если API недоступно, удаляем только локально
            setAds(prev => prev.filter(banner => banner.id !== id));
        }
    };

    const toggleAdStatus = async (id: string) => {
        const banner = ads.find(b => b.id === id);
        if (!banner) return;

        try {
            // Переключаем статус через API
            if (banner.isActive) {
                await deactivateAd(id);
            } else {
                await activateAd(id);
            }
            // Затем обновляем локальное состояние
            setAds(prev => prev.map(b =>
                b.id === id ? { ...b, isActive: !b.isActive } : b
            ));
        } catch (error) {
            console.error('Ошибка переключения статуса рекламы через API:', error);
            // Если API недоступно, переключаем только локально
            setAds(prev => prev.map(b =>
                b.id === id ? { ...b, isActive: !b.isActive } : b
            ));
        }
    };

    return (
        <AdsContext.Provider value={{
            ads,
            leftSideAds,
            rightSideAds,
            horizontalAds,
            addAd,
            updateAd,
            deleteAd,
            toggleAdStatus,
            loadAds
        }}>
            {children}
        </AdsContext.Provider>
    );
};
