import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AdData } from '../components/AdBanner';

interface AdsContextType {
    ads: AdData[];
    leftSideAds: AdData[];
    rightSideAds: AdData[];
    horizontalAds: AdData[];
    addAd: (ad: Omit<AdData, 'id'>) => void;
    updateAd: (id: string, updates: Partial<AdData>) => void;
    deleteAd: (id: string) => void;
    toggleAdStatus: (id: string) => void;
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
    const [ads, setAds] = useState<AdData[]>([
        {
            id: '1',
            title: 'Спортивные ставки',
            gifUrl: 'https://media.giphy.com/media/3o7aCRloybJlXpNjSU/giphy.gif',
            clickUrl: '#',
            type: 'vertical',
            isActive: true,
        },
        {
            id: '2',
            title: 'Спортивное питание',
            gifUrl: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
            clickUrl: '#',
            type: 'square',
            isActive: true,
        },
        {
            id: '3',
            title: 'Спортивная одежда',
            gifUrl: 'https://media.giphy.com/media/l0Iydl9zWjbLvLv6U/giphy.gif',
            clickUrl: '#',
            type: 'vertical',
            isActive: true,
        },
        {
            id: '4',
            title: 'Казино онлайн',
            gifUrl: 'https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif',
            clickUrl: '#',
            type: 'square',
            isActive: true,
        },
        {
            id: '5',
            title: 'Прогнозы экспертов',
            gifUrl: 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
            clickUrl: '#',
            type: 'horizontal',
            isActive: true,
        },
        {
            id: '6',
            title: 'Спортивные новости',
            gifUrl: 'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif',
            clickUrl: '#',
            type: 'horizontal',
            isActive: true,
        },
        {
            id: '7',
            title: 'Фитнес программы',
            gifUrl: 'https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif',
            clickUrl: '#',
            type: 'square',
            isActive: true,
        },
        {
            id: '8',
            title: 'Спортивная экипировка',
            gifUrl: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
            clickUrl: '#',
            type: 'vertical',
            isActive: true,
        },
    ]);

    const leftSideAds = ads.filter(ad => ad.isActive && (ad.type === 'vertical' || ad.type === 'square') && parseInt(ad.id) % 2 === 1);
    const rightSideAds = ads.filter(ad => ad.isActive && (ad.type === 'vertical' || ad.type === 'square') && parseInt(ad.id) % 2 === 0);
    const horizontalAds = ads.filter(ad => ad.isActive && ad.type === 'horizontal');

    const addAd = (adData: Omit<AdData, 'id'>) => {
        const newAd: AdData = {
            ...adData,
            id: Date.now().toString(),
        };
        setAds(prev => [...prev, newAd]);
    };

    const updateAd = (id: string, updates: Partial<AdData>) => {
        setAds(prev => prev.map(ad =>
            ad.id === id ? { ...ad, ...updates } : ad
        ));
    };

    const deleteAd = (id: string) => {
        setAds(prev => prev.filter(ad => ad.id !== id));
    };

    const toggleAdStatus = (id: string) => {
        setAds(prev => prev.map(ad =>
            ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
        ));
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
        }}>
            {children}
        </AdsContext.Provider>
    );
};
