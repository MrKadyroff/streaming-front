import React from 'react';
import { useAds } from '../contexts/BannerContext';

const BannersDebug: React.FC = () => {
    const { ads, leftSideAds, rightSideAds, horizontalAds } = useAds();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '300px',
            background: 'white',
            border: '2px solid green',
            padding: '10px',
            zIndex: 9999,
            maxHeight: '100vh',
            overflow: 'auto'
        }}>
            <h3>Отладка баннеров</h3>

            <h4>Все объявления ({ads.length}):</h4>
            {ads.map(banner => (
                <div key={banner.id} style={{ marginBottom: '10px', border: '1px solid gray', padding: '5px' }}>
                    <div><strong>ID:</strong> {banner.id}</div>
                    <div><strong>Заголовок:</strong> {banner.title}</div>
                    <div><strong>Тип:</strong> {banner.type}</div>
                    <div><strong>Активно:</strong> {banner.isActive ? 'Да' : 'Нет'}</div>
                    <div><strong>URL:</strong> {banner.imageUrl}</div>
                </div>
            ))}

            <h4>Левые ({leftSideAds.length}):</h4>
            {leftSideAds.map(banner => (
                <div key={`left-${banner.id}`}>{banner.title}</div>
            ))}

            <h4>Правые ({rightSideAds.length}):</h4>
            {rightSideAds.map(banner => (
                <div key={`right-${banner.id}`}>{banner.title}</div>
            ))}

            <h4>Горизонтальные ({horizontalAds.length}):</h4>
            {horizontalAds.map(banner => (
                <div key={`horizontal-${banner.id}`}>{banner.title}</div>
            ))}
        </div>
    );
};

export default BannersDebug;
