import React from 'react';
import PlayerTabs from '../components/PlayerTabs';

export default function Home() {
    return (
        <main className="page page-home">
            <h1>Live Stream</h1>
            <p className="lead">Смотрите прямую трансляцию матчей и событий.</p>

            <div className="stream-container">
                <div className="player-section">
                    <PlayerTabs />
                </div>
            </div>
        </main>
    );
}
