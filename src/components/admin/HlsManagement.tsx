import React from 'react';
import './HlsManagement.css';

interface HlsManagementProps {
    hlsStreams: any[];
}

const HlsManagement: React.FC<HlsManagementProps> = ({ hlsStreams }) => {
    return (
        <div className="tab-content">
            <div className="hls-management">
                <h2>HLS Потоки</h2>
                {hlsStreams.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📹</div>
                        <h3>HLS потоки не найдены</h3>
                        <p>Потоки будут отображаться здесь при их активации</p>
                    </div>
                ) : (
                    <div className="streams-list">
                        {hlsStreams.map((stream, index) => (
                            <div key={index} className="stream-card">
                                <h4>{stream.title || `Поток ${index + 1}`}</h4>
                                <p>URL: {stream.url}</p>
                                <p>Статус: {stream.status || 'активен'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HlsManagement;
