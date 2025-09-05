import React from 'react';
import { useAds } from '../contexts/AdsContext';
import AdBanner from './AdBanner';

interface PageWithAdsProps {
    children: React.ReactNode;
}

const PageWithAds: React.FC<PageWithAdsProps> = ({ children }) => {
    const { leftSideAds, rightSideAds, horizontalAds } = useAds();

    return (
        <div className="page-with-ads">
            {/* Left sidebar ads */}
            <div className="left-ads">
                {leftSideAds.map(ad => (
                    <AdBanner key={ad.id} ad={ad} />
                ))}
            </div>

            {/* Main content with horizontal ads */}
            <div className="main-content-ads">
                {horizontalAds.length > 0 && (
                    <AdBanner ad={horizontalAds[0]} />
                )}

                {children}

                {horizontalAds.length > 1 && (
                    <AdBanner ad={horizontalAds[1]} />
                )}
            </div>

            {/* Right sidebar ads */}
            <div className="right-ads">
                {rightSideAds.map(ad => (
                    <AdBanner key={ad.id} ad={ad} />
                ))}
            </div>
        </div>
    );
};

export default PageWithAds;
