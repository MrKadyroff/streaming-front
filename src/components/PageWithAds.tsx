import React from 'react';
import { useAds } from '../contexts/BannerContext';
import PromoBanner from './PromoBanner';

interface PageWithBannersProps {
    children: React.ReactNode;
}

const PageWithBanners: React.FC<PageWithBannersProps> = ({ children }) => {
    const { leftSideAds, rightSideAds, horizontalAds } = useAds();

    console.log('🎯 PageWithBanners получил объявления:');
    console.log('- Левые:', leftSideAds);
    console.log('- Правые:', rightSideAds);
    console.log('- Горизонтальные:', horizontalAds);

    // Дополнительная отладка
    console.log('🎯 Рендерим левые объявления:', leftSideAds);
    console.log('🎯 Рендерим правые объявления:', rightSideAds);

    return (
        <div className="page-with-banners">
            {/* Left sidebar banners */}
            <div className="left-banners">
                {leftSideAds.length > 0 ? (
                    leftSideAds.map(banner => {
                        console.log('🎯 Рендерим левое объявление:', banner);
                        return <PromoBanner key={banner.id} banner={banner} />;
                    })
                ) : (
                    <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
                        Нет левых объявлений
                    </div>
                )}
            </div>

            {/* Main content with horizontal banners */}
            <div className="main-content-banners">
                {horizontalAds.length > 0 && (
                    <>
                        {(() => {
                            console.log('🎯 Рендерим горизонтальное объявление:', horizontalAds[0]);
                            return null;
                        })()}
                        <PromoBanner banner={horizontalAds[0]} />
                    </>
                )}

                {children}

                {horizontalAds.length > 1 && (
                    <>
                        {(() => {
                            console.log('🎯 Рендерим второе горизонтальное объявление:', horizontalAds[1]);
                            return null;
                        })()}
                        <PromoBanner banner={horizontalAds[1]} />
                    </>
                )}
            </div>

            {/* Right sidebar banners */}
            <div className="right-banners">
                {rightSideAds.length > 0 ? (
                    rightSideAds.map(banner => {
                        console.log('🎯 Рендерим правое объявление:', banner);
                        return <PromoBanner key={banner.id} banner={banner} />;
                    })
                ) : (
                    <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
                        Нет правых объявлений
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageWithBanners;
