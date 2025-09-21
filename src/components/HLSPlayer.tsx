import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Stream } from '../services/streamApi';
import './HLSPlayer.css';

/* ===== Fullscreen API helpers ===== */
type FsElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
};
type FsDocument = Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitFullscreenElement?: Element | null;
};
const fsApi = {
    isActive(doc: FsDocument = document as FsDocument) {
        return !!(doc.fullscreenElement || doc.webkitFullscreenElement);
    },
    async request(el: FsElement) {
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    },
    async exit(doc: FsDocument = document as FsDocument) {
        if (doc.exitFullscreen) return doc.exitFullscreen();
        if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
    },
};

/* ===== Helper: проверка HLS ===== */
async function checkHlsExists(url: string, timeoutMs = 3000): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            redirect: 'follow',
            mode: 'cors',
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) return false;

        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/vnd.apple.mpegurl') || ct.includes('application/x-mpegURL')) {
            return true;
        }
        const text = (await res.text()).slice(0, 128);
        return text.includes('#EXTM3U');
    } catch {
        return false;
    }
}

interface HLSPlayerProps {
    stream: Stream | null;
    onError?: () => void;
    className?: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({ stream, onError, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const nudgeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(50);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const fsBusyRef = useRef(false);

    /* ===== Fullscreen toggle ===== */
    const toggleFullscreen = async () => {
        const root = containerRef.current as FsElement | null;
        const video = videoRef.current as any;
        if (!root) return;

        // iOS Safari
        if (video && typeof video.webkitEnterFullscreen === 'function' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
            try {
                video.webkitEnterFullscreen();
                return;
            } catch (e) {
                console.error('iOS video fullscreen error:', e);
            }
        }

        if (fsBusyRef.current) return;
        fsBusyRef.current = true;
        try {
            if (!fsApi.isActive()) {
                await fsApi.request(root);
            } else {
                await fsApi.exit();
            }
        } catch (e) {
            console.error('Fullscreen toggle error:', e);
        } finally {
            setTimeout(() => {
                fsBusyRef.current = false;
            }, 120);
        }
    };

    /* ===== Sync fullscreen state ===== */
    useEffect(() => {
        const doc = document as any;
        const onFsChange = () => setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement));
        const onFsError = (e: Event) => console.warn('fullscreenerror', e);

        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange as any);
        document.addEventListener('fullscreenerror', onFsError);
        document.addEventListener('webkitfullscreenerror', onFsError as any);

        const onIosEnd = () => setIsFullscreen(false);
        (videoRef.current as any)?.addEventListener?.('webkitendfullscreen', onIosEnd);

        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange as any);
            document.removeEventListener('fullscreenerror', onFsError);
            document.removeEventListener('webkitfullscreenerror', onFsError as any);
            (videoRef.current as any)?.removeEventListener?.('webkitendfullscreen', onIosEnd);
        };
    }, []);

    /* ===== Setup player ===== */
    useEffect(() => {
        let cancelled = false;

        async function setupPlayer() {
            const video = videoRef.current;
            const srcUrl = stream?.streamUrl?.trim() || '';
            if (!video || !srcUrl) return;

            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (nudgeTimerRef.current) {
                clearInterval(nudgeTimerRef.current);
                nudgeTimerRef.current = null;
            }

            setError(null);
            setIsLoading(true);

            const exists = await checkHlsExists(srcUrl, 3000);
            if (cancelled) return;

            if (!exists) {
                setError('Нет активных трансляций');
                setIsLoading(false);
                onError?.();
                return;
            }

            // Safari
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = srcUrl;
                const onLoadedMeta = () => {
                    try {
                        const s = video.seekable;
                        if (s && s.length) {
                            video.currentTime = s.end(s.length - 1) - 0.3;
                        }
                        video.play().catch(() => { });
                    } catch { }
                };
                video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
                video.load();
            }
            // Other browsers with hls.js
            else if (Hls.isSupported()) {
                const hls = new Hls({
                    lowLatencyMode: false,
                    startPosition: -1,
                    liveSyncDurationCount: 3,
                    liveMaxLatencyDurationCount: 10,
                    maxBufferLength: 10,
                    backBufferLength: 0,
                    enableWorker: true,
                    maxLiveSyncPlaybackRate: 1.1,
                });

                hlsRef.current = hls;
                hls.loadSource(srcUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    hls.startLoad(-1);
                    video.play().catch(() => { });
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (!data?.fatal) {
                        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                            const pos = (hls as any).liveSyncPosition as number;
                            if (Number.isFinite(pos)) {
                                try { video.currentTime = pos + 0.3; } catch { }
                            }
                        }
                        return;
                    }
                    console.error('HLS Error:', data);
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad(-1);
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hlsRef.current = null;
                        setError('Нет активных трансляций');
                        setIsLoading(false);
                        onError?.();
                    }
                });

                nudgeTimerRef.current = setInterval(() => {
                    const anyHls = hlsRef.current as any;
                    const pos: number | undefined = anyHls?.liveSyncPosition;
                    if (!videoRef.current || typeof pos !== 'number' || !isFinite(pos)) return;
                    try {
                        if (Math.abs(videoRef.current.currentTime - pos) > 2) {
                            videoRef.current.currentTime = pos + 0.2;
                        }
                    } catch { }
                }, 8000);
            } else {
                setError('Ваш браузер не поддерживает воспроизведение HLS');
                setIsLoading(false);
            }

            const handleLoadStart = () => setIsLoading(true);
            const handleCanPlay = () => setIsLoading(false);
            const handleWaiting = () => setIsLoading(true);
            const handlePlaying = () => setIsLoading(false);
            const handleError = () => {
                setError('Нет активных трансляций');
                setIsLoading(false);
                onError?.();
            };

            video.addEventListener('loadstart', handleLoadStart);
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('waiting', handleWaiting);
            video.addEventListener('playing', handlePlaying);
            video.addEventListener('error', handleError);

            video.muted = isMuted;
            video.volume = volume / 100;

            return () => {
                video.removeEventListener('loadstart', handleLoadStart);
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('waiting', handleWaiting);
                video.removeEventListener('playing', handlePlaying);
                video.removeEventListener('error', handleError);
            };
        }

        setupPlayer();

        return () => {
            cancelled = true;
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (nudgeTimerRef.current) {
                clearInterval(nudgeTimerRef.current);
                nudgeTimerRef.current = null;
            }
        };
    }, [stream?.streamUrl, onError]);

    /* ===== Mute / Volume ===== */
    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = isMuted;
    }, [isMuted]);
    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = volume / 100;
    }, [volume]);

    /* ===== Play/Pause ===== */
    const togglePlayPause = async () => {
        if (!videoRef.current) return;
        try {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                await videoRef.current.play();
                setIsPlaying(true);
            }
        } catch (e) {
            console.error('Error playing video:', e);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuted = !isMuted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const handleVolumeChange = (newVolume: number) => {
        if (!videoRef.current) return;
        videoRef.current.volume = newVolume / 100;
        setVolume(newVolume);
        if (newVolume === 0) {
            setIsMuted(true);
            videoRef.current.muted = true;
        } else if (isMuted) {
            setIsMuted(false);
            videoRef.current.muted = false;
        }
    };

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => setIsPlaying(false);

    if (!stream || error) {
        return (
            <div className={`hls-player no-stream ${className}`}>
                <div className="no-stream-content">
                    <div className="no-stream-icon">📺</div>
                    <h3>Нет активных трансляций</h3>
                    <p>В данный момент нет доступных потоков для воспроизведения</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`hls-player ${isLoading ? 'is-loading' : ''} ${className}`}>
            <div className="player-container">
                <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        className="video-element"
                        poster="/assets/poster.jpg"
                        muted={isMuted}
                        autoPlay
                        playsInline
                        onPlay={handleVideoPlay}
                        onPause={handleVideoPause}
                        onEnded={handleVideoEnded}
                    />

                    {isLoading && (
                        <div className="loading-overlay">

                            <div className="spinner"></div>

                            <span>Загрузка трансляции...</span>
                        </div>
                    )}

                    <div className="controls-overlay">
                        <div className="controls">
                            <button className="control-button play-pause" onClick={togglePlayPause} title={isPlaying ? 'Пауза' : 'Воспроизвести'}>
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>

                            <button className="control-button mute" onClick={toggleMute} title={isMuted ? 'Включить звук' : 'Выключить звук'}>
                                {isMuted ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                )}
                            </button>

                            <div className="volume-control">
                                <input type="range" min="0" max="100" value={volume} onChange={(e) => handleVolumeChange(Number(e.target.value))} className="volume-slider" />
                            </div>

                            <div className="stream-info">
                                <span className="stream-title">{stream.title}</span>
                                <div className="live-indicator">
                                    <div className="live-dot"></div>
                                    <span>LIVE</span>
                                </div>
                            </div>

                            <button className="control-button fullscreen" onClick={toggleFullscreen} title="Полноэкранный режим">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HLSPlayer;
