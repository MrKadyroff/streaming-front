// ./Player.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import Hls from 'hls.js';
import './player.css';
async function probeHls(url, timeoutMs) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            redirect: 'follow',
            signal: ac.signal,
        });
        if (!res.ok) return false;
        const txt = (await res.text()).slice(0, 2048);
        return txt.includes('#EXTM3U');
    } catch {
        return false;
    } finally {
        clearTimeout(t);
    }
}

export default function Player({
    primarySrc,
    fallbackSrc,
    checkIntervalMs = 5000,
    requestTimeoutMs = 3000,
    autoPlayMuted = true,
    retryBaseDelayMs = 3000,
    retryMaxDelayMs = 15000,
}) {
    const [effSrc, setEffSrc] = useState(fallbackSrc);
    const [effType, setEffType] = useState('video');

    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);
    const retryTimerRef = useRef(null);

    const [retryAttempt, setRetryAttempt] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [muted, setMuted] = useState(autoPlayMuted);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLive, setIsLive] = useState(false);

    const [hasActiveStream, setHasActiveStream] = useState(false);
    const [lastError, setLastError] = useState(null);

    // Новые фичи
    const [playbackRate, setPlaybackRate] = useState(1);
    const [levels, setLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(-1);
    const [reloadNonce, setReloadNonce] = useState(0);

    function clearRetryTimer() {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
    }
    function scheduleRetry(nextAttempt) {
        clearRetryTimer();
        const attempt = nextAttempt ?? retryAttempt + 1;
        const delay = Math.min(
            retryMaxDelayMs,
            retryBaseDelayMs * Math.pow(1.7, Math.max(0, attempt - 1))
        );
        retryTimerRef.current = setTimeout(() => setRetryAttempt(attempt), delay);
    }

    // Первичная проверка
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const ok = await probeHls(primarySrc, requestTimeoutMs);
            if (cancelled) return;
            if (ok) {
                setHasActiveStream(true);
                setEffSrc(primarySrc);
                setEffType('hls');
                setRetryAttempt(0);
            } else {
                setHasActiveStream(false);
                setEffSrc(fallbackSrc);
                setEffType('video');
                scheduleRetry(1);
            }
        })();
        return () => { cancelled = true; clearRetryTimer(); };
    }, [primarySrc, fallbackSrc]);

    // Инициализация источника
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !effSrc) return;

        setLastError(null);
        setDuration(0);
        setLevels([]);
        setCurrentLevel(-1);

        video.muted = muted;
        video.volume = volume;
        video.playbackRate = playbackRate;

        if (effType === 'hls' && Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 30,
                backBufferLength: 30,
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                const src = reloadNonce ? `${effSrc}?r=${reloadNonce}` : effSrc;
                hls.loadSource(src);
            });
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                const parsedLevels = (hls.levels || []).map((lv, i) => ({
                    index: i,
                    height: lv.height,
                    bitrate: lv.bitrate,
                    name: lv.height ? `${lv.height}p` : `${Math.round(lv.bitrate / 1000)}kbps`,
                }));
                setLevels(parsedLevels);
                setCurrentLevel(hls.currentLevel ?? -1);
            });
            hls.attachMedia(video);
        } else {
            video.src = reloadNonce ? `${effSrc}?r=${reloadNonce}` : effSrc;
            video.load();
        }

        return () => {
            clearRetryTimer();
            if (hlsRef.current) {
                try { hlsRef.current.destroy(); } catch { }
                hlsRef.current = null;
            }
        };
    }, [effSrc, effType, reloadNonce]);

    // Слушатели
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
        };
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (v) {
            v.muted = muted;
            v.volume = volume;
        }
    }, [muted, volume]);

    useEffect(() => {
        const v = videoRef.current;
        if (v) v.playbackRate = playbackRate;
    }, [playbackRate]);

    // Управление
    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) v.play().catch(() => { }); else v.pause();
    };
    const togglePiP = async () => {
        const v = videoRef.current;
        if (!v) return;
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await v.requestPictureInPicture();
        }
    };
    const reloadStream = () => setReloadNonce(n => n + 1);
    const takeScreenshot = () => {
        const v = videoRef.current;
        if (!v) return;
        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            if (!blob) return;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `frame-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
        });
    };
    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };
    const changeQuality = e => {
        const idx = Number(e.target.value);
        setCurrentLevel(idx);
        if (hlsRef.current) hlsRef.current.currentLevel = idx;
    };

    return (
        <div className="player" ref={containerRef}>
            <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                preload="metadata"
                className="player-video"
                onClick={togglePlay}
            />

            <div className="controls-bar">
                <button className="btn" onClick={togglePlay}>
                    {isPlaying ? '❚❚' : '▶'}
                </button>
                <button className="btn" onClick={() => setMuted(m => !m)}>
                    {muted ? '🔇' : '🔊'}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
                <select value={playbackRate} onChange={e => setPlaybackRate(Number(e.target.value))}>
                    {[0.5, 1, 1.5, 2].map(r => <option key={r} value={r}>{r}×</option>)}
                </select>
                {effType === 'hls' && levels.length > 0 && (
                    <select value={currentLevel} onChange={changeQuality}>
                        <option value={-1}>Auto</option>
                        {levels.map(lv => (
                            <option key={lv.index} value={lv.index}>{lv.name}</option>
                        ))}
                    </select>
                )}
                <button className="btn" onClick={togglePiP}>🗔 PiP</button>
                <button className="btn" onClick={takeScreenshot}>📷</button>
                <button className="btn" onClick={reloadStream}>↻</button>
                <button className="btn" onClick={toggleFullscreen}>
                    {isFullscreen ? '⤓' : '⤢'}
                </button>
            </div>
        </div>
    );
}
