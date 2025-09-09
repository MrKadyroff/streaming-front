import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdData } from '../components/AdBanner';
import { getAds, createAd as apiCreateAd, updateAd as apiUpdateAd, deleteAd as apiDeleteAd, activateAd, deactivateAd, CreateAdDto } from '../api';

interface AdsContextType {
    ads: AdData[];
    leftSideAds: AdData[];
    rightSideAds: AdData[];
    horizontalAds: AdData[];
    addAd: (ad: Omit<AdData, 'id'>) => void;
    updateAd: (id: string, updates: Partial<AdData>) => void;
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
    const [ads, setAds] = useState<AdData[]>([]);

    // Загружаем рекламу с API при запуске
    useEffect(() => {
        loadAds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Вспомогательная функция для преобразования AdData в CreateAdDto
    const convertAdToDto = (ad: Omit<AdData, 'id'> | Partial<AdData>): CreateAdDto => {
        return {
            title: ad.title || '',
            type: ad.type || 'vertical',
            position: ad.type === 'horizontal' ? 'header' : 'sidebar',
            imageUrl: ad.imageUrl || ad.gifUrl || '',
            clickUrl: ad.clickUrl || '',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 год
            priority: 1,
            targetAudience: 'sports'
        };
    };

    // Вспомогательная функция для преобразования API данных в AdData
    const convertApiToAd = (apiAd: any): AdData => {
        return {
            id: apiAd.id.toString(),
            title: apiAd.title,
            type: apiAd.type || 'vertical',
            imageUrl: apiAd.imageUrl || '',
            gifUrl: apiAd.imageUrl || '',
            clickUrl: apiAd.clickUrl || '',
            isActive: apiAd.status === 'active',
            priority: apiAd.priority || 1,
            startDate: apiAd.startDate,
            endDate: apiAd.endDate,
            position: apiAd.position || (apiAd.type === 'horizontal' ? 'header' : 'sidebar')
        };
    };

    const loadAds = async () => {
        try {
            const response = await getAds();
            console.log('📥 Ответ API для загрузки рекламы:', response.data);

            // API возвращает данные в формате {"ads": [...], "total": 6}
            const apiAds = response.data?.ads?.map(convertApiToAd) || [];
            console.log('✅ Обработанные объявления:', apiAds);

            setAds(apiAds);
        } catch (error) {
            console.error('Ошибка загрузки рекламы с API:', error);
            setAds([]);
        }
    };

    // Фильтрация рекламы по типам и позициям
    const leftSideAds = ads.filter(ad => ad.isActive && (ad.type === 'vertical' || ad.type === 'square'));
    const rightSideAds = ads.filter(ad => ad.isActive && (ad.type === 'vertical' || ad.type === 'square'));
    const horizontalAds = ads.filter(ad => ad.isActive && ad.type === 'horizontal');

    const addAd = async (adData: Omit<AdData, 'id'>) => {
        try {
            // Преобразуем данные для API
            const dto = convertAdToDto(adData);
            console.log('🔄 Отправляем данные для создания рекламы:', dto);

            // Сначала добавляем через API
            const response = await apiCreateAd(dto);
            console.log('✅ Ответ API при создании:', response.data);

            // Затем добавляем в локальное состояние
            const newAd: AdData = {
                ...adData,
                id: (response.data?.ad?.id || response.data?.id || Date.now()).toString(),
                isActive: false // Новая реклама создается как неактивная
            };
            setAds(prev => [...prev, newAd]);

            // Перезагружаем данные для синхронизации
            await loadAds();
        } catch (error) {
            console.error('Ошибка создания рекламы через API:', error);
            // Если API недоступно, добавляем только локально
            const newAd: AdData = {
                ...adData,
                id: Date.now().toString(),
            };
            setAds(prev => [...prev, newAd]);
        }
    };

    const updateAd = async (id: string, updates: Partial<AdData>) => {
        try {
            // Преобразуем данные для API
            const dto = convertAdToDto(updates);
            // Сначала обновляем через API
            await apiUpdateAd(id, dto);
            // Затем обновляем локальное состояние
            setAds(prev => prev.map(ad =>
                ad.id === id ? { ...ad, ...updates } : ad
            ));
        } catch (error) {
            console.error('Ошибка обновления рекламы через API:', error);
            // Если API недоступно, обновляем только локально
            setAds(prev => prev.map(ad =>
                ad.id === id ? { ...ad, ...updates } : ad
            ));
        }
    };

    const deleteAd = async (id: string) => {
        try {
            // Сначала удаляем через API
            await apiDeleteAd(id);
            // Затем удаляем из локального состояния
            setAds(prev => prev.filter(ad => ad.id !== id));
        } catch (error) {
            console.error('Ошибка удаления рекламы через API:', error);
            // Если API недоступно, удаляем только локально
            setAds(prev => prev.filter(ad => ad.id !== id));
        }
    };

    const toggleAdStatus = async (id: string) => {
        const ad = ads.find(a => a.id === id);
        if (!ad) return;

        try {
            // Переключаем статус через API
            if (ad.isActive) {
                await deactivateAd(id);
            } else {
                await activateAd(id);
            }
            // Затем обновляем локальное состояние
            setAds(prev => prev.map(a =>
                a.id === id ? { ...a, isActive: !a.isActive } : a
            ));
        } catch (error) {
            console.error('Ошибка переключения статуса рекламы через API:', error);
            // Если API недоступно, переключаем только локально
            setAds(prev => prev.map(a =>
                a.id === id ? { ...a, isActive: !a.isActive } : a
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
