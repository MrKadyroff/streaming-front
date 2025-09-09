import React from 'react';

export interface AdData {
    id: string;
    title: string;
    imageUrl?: string;
    gifUrl?: string;
    clickUrl?: string;
    type: 'vertical' | 'square' | 'horizontal';
    isActive: boolean;
    priority?: number;
    startDate?: string;
    endDate?: string;
    position?: string;
}

interface AdBannerProps {
    ad: AdData;
    onClick?: (ad: AdData) => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ ad, onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick(ad);
        } else if (ad.clickUrl) {
            window.open(ad.clickUrl, '_blank');
        }
    };

    return (
        <div
            className={`ad-banner ${ad.type}`}
            onClick={handleClick}
            style={{ cursor: ad.clickUrl || onClick ? 'pointer' : 'default' }}
        >
            <div className="ad-content">
                {ad.gifUrl || ad.imageUrl ? (
                    <img
                        src={ad.gifUrl || ad.imageUrl}
                        alt={ad.title}
                        className="ad-gif"
                    />
                ) : (
                    <div className="ad-placeholder">
                        <div>Ad</div>
                        <div>Реклама</div>
                        <div>{ad.title}</div>
                    </div>
                )}
                <div className="ad-label">AD</div>
            </div>
        </div>
    );
};

export default AdBanner;
