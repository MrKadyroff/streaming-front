import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { PlayerConfig, VideoLevel } from '../types';
import './player.css';

async function probeHls(url: string, timeoutMs: number): Promise<boolean> {
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

interface PlayerProps extends PlayerConfig {
    className?: string;
    previewImage?: string;
    matchTitle?: string;
    isLive?: boolean;
}

const Player: React.FC<PlayerProps> = ({
    primarySrc,
    fallbackSrc = '',
    checkIntervalMs = 5000,
    requestTimeoutMs = 3000,
    autoPlayMuted = true,
    retryBaseDelayMs = 3000,
    retryMaxDelayMs = 15000,
    className = '',
    previewImage,
    matchTitle,
    isLive = false
}) => {
    const [effSrc, setEffSrc] = useState<string>(fallbackSrc);
    const [effType, setEffType] = useState<'video' | 'hls'>('video');

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [retryAttempt, setRetryAttempt] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [muted, setMuted] = useState<boolean>(autoPlayMuted);
    const [volume, setVolume] = useState<number>(1);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [hasActiveStream, setHasActiveStream] = useState<boolean>(false);
    const [lastError, setLastError] = useState<string | null>(null);

    // Новые фичи
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [levels, setLevels] = useState<VideoLevel[]>([]);
    const [currentLevel, setCurrentLevel] = useState<number>(-1);
    const [reloadNonce, setReloadNonce] = useState<number>(0);

    const clearRetryTimer = (): void => {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
    };

    const scheduleRetry = useCallback((nextAttempt?: number): void => {
        clearRetryTimer();
        const attempt = nextAttempt ?? retryAttempt + 1;
        const delay = Math.min(
            retryMaxDelayMs,
            retryBaseDelayMs * Math.pow(1.7, Math.max(0, attempt - 1))
        );
        retryTimerRef.current = setTimeout(() => setRetryAttempt(attempt), delay);
    }, [retryAttempt, retryBaseDelayMs, retryMaxDelayMs]);

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

        return () => {
            cancelled = true;
            clearRetryTimer();
        };
    }, [primarySrc, fallbackSrc, requestTimeoutMs, scheduleRetry]);

    // Инициализация источника
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !effSrc) return;

        setLastError(null);
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
                const parsedLevels: VideoLevel[] = (hls.levels || []).map((lv, i) => ({
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
                try {
                    hlsRef.current.destroy();
                } catch (e) {
                    console.error('Error destroying HLS instance:', e);
                }
                hlsRef.current = null;
            }
        };
    }, [effSrc, effType, reloadNonce, muted, volume, playbackRate]);

    // Слушатели событий
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onError = (e: Event) => {
            const target = e.target as HTMLVideoElement;
            // setLastError(target.error?.message || 'Ошибка воспроизведения');
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('error', onError);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('error', onError);
        };
    }, []);

    // Fullscreen listener
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    // Управление
    const togglePlay = (): void => {
        const v = videoRef.current;
        if (!v) return;

        if (v.paused) {
            v.play().catch(console.error);
        } else {
            v.pause();
        }
    };

    const togglePiP = async (): Promise<void> => {
        const v = videoRef.current;
        if (!v) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await v.requestPictureInPicture();
            }
        } catch (error) {
            console.error('PiP error:', error);
        }
    };

    const reloadStream = (): void => {
        setReloadNonce(n => n + 1);
    };

    const takeScreenshot = (): void => {
        const v = videoRef.current;
        if (!v) return;

        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

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

    const toggleFullscreen = (): void => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const changeQuality = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const idx = Number(e.target.value);
        setCurrentLevel(idx);
        if (hlsRef.current) {
            hlsRef.current.currentLevel = idx;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newRate = Number(e.target.value);
        setPlaybackRate(newRate);
        if (videoRef.current) {
            videoRef.current.playbackRate = newRate;
        }
    };

    return (
        <div className={`player ${className}`} ref={containerRef}>
            {!isLive && previewImage ? (
                <div className="player-preview">
                    <img
                        src={previewImage}
                        alt={matchTitle || "Превью матча"}
                        className="preview-image"
                    />
                    <div className="preview-overlay">
                        <div className="preview-content">
                            <div className="preview-status">
                                <span className="preview-icon">⏰</span>
                                <span className="preview-text">Эфир скоро начнется</span>
                            </div>
                            {matchTitle && (
                                <div className="preview-title">{matchTitle}</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        muted={muted}
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="player-video"
                        onClick={togglePlay}
                    />

                    {lastError && (
                        <div className="player-error">
                            <span>Ошибка: {lastError}</span>
                            <button onClick={reloadStream}>Попробовать снова</button>
                        </div>
                    )}
                </>
            )}

            <div className="controls-bar">
                <button className="btn control-btn" onClick={togglePlay} title="Воспроизведение">
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <button className="btn control-btn" onClick={() => setMuted(m => !m)} title="Звук">
                    {muted ? 'Mute' : 'Sound'}
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    title="Громкость"
                />

                <select
                    value={playbackRate}
                    onChange={handlePlaybackRateChange}
                    className="speed-select"
                    title="Скорость"
                >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                        <option key={r} value={r}>{r}×</option>
                    ))}
                </select>

                {effType === 'hls' && levels.length > 0 && (
                    <select
                        value={currentLevel}
                        onChange={changeQuality}
                        className="quality-select"
                        title="Качество"
                    >
                        <option value={-1}>Авто</option>
                        {levels.map(lv => (
                            <option key={lv.index} value={lv.index}>{lv.name}</option>
                        ))}
                    </select>
                )}

                <button className="btn control-btn" onClick={togglePiP} title="Картинка в картинке">
                    PiP
                </button>

                <button className="btn control-btn" onClick={takeScreenshot} title="Скриншот">
                    Screenshot
                </button>

                <button className="btn control-btn" onClick={reloadStream} title="Обновить">
                    ↻
                </button>

                <button className="btn control-btn" onClick={toggleFullscreen} title="Полный экран">
                    {isFullscreen ? '⤓' : '⤢'}
                </button>
            </div>

            {!hasActiveStream && isLive && (
                <div className="stream-status">
                    <span>Поиск активного потока...</span>
                </div>
            )}
        </div>
    );
};

export default Player;
