import React from 'react';

export interface BannerData {
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

interface PromoBannerProps {
    banner: BannerData;
    onClick?: (banner: BannerData) => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ banner, onClick }) => {
    console.log('🎨 PromoBanner рендерится с данными:', banner);
    const [imageError, setImageError] = React.useState(false);

    const handleClick = () => {
        if (onClick) {
            onClick(banner);
        } else if (banner.clickUrl) {
            window.open(banner.clickUrl, '_blank');
        }
    };

    const handleImageError = () => {
        console.error('❌ Ошибка загрузки изображения:', banner.gifUrl || banner.imageUrl);
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log('✅ Изображение загружено:', banner.gifUrl || banner.imageUrl);
        setImageError(false);
    };

    return (
        <div
            className={`promo-banner ${banner.type}`}
            onClick={handleClick}
            style={{
                cursor: banner.clickUrl || onClick ? 'pointer' : 'default',
                border: '2px solid green', // Временно для отладки
                backgroundColor: 'lightblue' // Временно для отладки
            }}
        >
            <div className="banner-content">
                {(banner.gifUrl || banner.imageUrl) && !imageError ? (
                    <img
                        src={banner.gifUrl || banner.imageUrl}
                        alt={banner.title}
                        className="banner-gif"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                    />
                ) : (
                    <div className="banner-placeholder">
                        <div>Promo</div>
                        {/* <div>Реклама</div> */}
                        <div>{banner.title}</div>
                        {imageError && <div style={{ color: 'red', fontSize: '10px' }}>Ошибка загрузки</div>}
                    </div>
                )}
                {/* <div className="promo-label">Реклама</div> */}
            </div>
        </div>
    );
};

export default PromoBanner;
