// ./PlayerTabs.jsx
import React, { useEffect, useState } from 'react';
import Player from './Player';
import './player.css';
export default function PlayerTabs() {
    const [streams, setStreams] = useState([]);
    const [selectedStreamId, setSelectedStreamId] = useState('');
    const demoSrc = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4';
    const HLS_ORIGIN = 'https://f4u.online';

    useEffect(() => {
        fetch('https://f4u.online:5001/streams')
            .then(r => r.json())
            .then(data => {
                setStreams(data);
                if (data.length) setSelectedStreamId(data[0].name);
            })
            .catch(console.error);
    }, []);

    function resolveUrl(pl) {
        if (!pl) return demoSrc;
        if (pl.startsWith('http')) return pl;
        return `${HLS_ORIGIN}${pl}`;
    }

    const selected = streams.find(s => s.name === selectedStreamId);
    const streamUrl = selected ? resolveUrl(selected.playlist) : demoSrc;

    return (
        <div>
            <div className="stream-selector">
                {streams.map(s => (
                    <button
                        key={s.name}
                        className={selectedStreamId === s.name ? 'stream-btn active' : 'stream-btn'}
                        onClick={() => setSelectedStreamId(s.name)}
                    >
                        {s.name}
                    </button>
                ))}
            </div>
            <Player key={streamUrl} primarySrc={streamUrl} fallbackSrc={demoSrc} />
        </div>
    );
}
