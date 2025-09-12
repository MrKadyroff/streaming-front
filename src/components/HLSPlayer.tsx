import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Stream } from '../services/streamApi';
import './HLSPlayer.css';

// Проверка доступности HLS потока (например, на 404)
async function checkHlsExists(url: string, timeoutMs = 3000): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        return res.ok && (await res.text()).includes('#EXTM3U');
    } catch {
        return false;
    }
}

interface HLSPlayerProps {
    stream: Stream | null;
    onError?: () => void;
    className?: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({
    stream,
    onError,
    className = ''
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(50);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Инициализация плеера с проверкой 404 для HLS
    useEffect(() => {
        let cancelled = false;

        async function setupPlayer() {
            if (!videoRef.current || !stream?.streamUrl) return;

            setError(null);
            setIsLoading(true);

            // Проверяем, существует ли поток (например, 404)
            const exists = await checkHlsExists(stream.streamUrl, 3000);
            if (cancelled) return;

            if (!exists) {
                setError('Нет активных трансляций');
                setIsLoading(false);
                onError?.();
                return;
            }

            const video = videoRef.current;

            // Проверяем поддержку HLS
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari, iOS)
                video.src = stream.streamUrl;
                video.load();
            } else if (Hls.isSupported()) {
                // HLS.js для других браузеров
                const hls = new Hls({
                    enableWorker: false,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsRef.current = hls;
                hls.loadSource(stream.streamUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        setError('Нет активных трансляций');
                        setIsLoading(false);
                        onError?.();
                    }
                });
            } else {
                setError('Ваш браузер не поддерживает воспроизведение HLS');
                setIsLoading(false);
            }

            // Событие загрузки
            const handleLoadStart = () => setIsLoading(true);
            const handleCanPlay = () => setIsLoading(false);
            const handleError = () => {
                setError('Нет активных трансляций');
                setIsLoading(false);
                onError?.();
            };

            video.addEventListener('loadstart', handleLoadStart);
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('error', handleError);

            return () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
                video.removeEventListener('loadstart', handleLoadStart);
                video.removeEventListener('canplay', handleCanPlay);
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
        };
    }, [stream?.streamUrl, onError]);

    // Управление воспроизведением
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
        } catch (error) {
            console.error('Error playing video:', error);
            // setError('Ошибка воспроизведения');
        }
    };

    // Управление звуком
    const toggleMute = () => {
        if (!videoRef.current) return;

        const newMuted = !isMuted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    // Изменение громкости
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

    // Полноэкранный режим
    const toggleFullscreen = async () => {
        if (!videoRef.current) return;

        try {
            if (!isFullscreen) {
                if (videoRef.current.requestFullscreen) {
                    await videoRef.current.requestFullscreen();
                } else if ((videoRef.current as any).webkitRequestFullscreen) {
                    await (videoRef.current as any).webkitRequestFullscreen();
                }
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                }
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    // Обновление плеера
    const handleRefresh = () => {
        setError(null);
        if (videoRef.current && stream?.streamUrl) {
            videoRef.current.load();
        }
    };

    // Обработчики событий видео
    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => setIsPlaying(false);

    // Показываем экран "нет активных трансляций" если нет потока или есть ошибка
    if (!stream || error) {
        return (
            <div className={`hls-player no-stream ${className}`}>
                <div className="no-stream-content">
                    <div className="no-stream-icon">📺</div>
                    <h3>Нет активных трансляций</h3>
                    <p>{error || 'В данный момент нет доступных потоков для воспроизведения'}</p>
                    {/* {stream && (
                        <button
                            className="refresh-button"
                            onClick={handleRefresh}
                        >
                            🔄 Попробовать снова
                        </button>
                    )} */}
                </div>
            </div>
        );
    }

    return (
        <div className={`hls-player ${className}`}>
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

                    {/* Индикатор загрузки */}
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <span>Загрузка трансляции...</span>
                            </div>
                        </div>
                    )}

                    {/* Элементы управления */}
                    <div className="controls-overlay">
                        <div className="controls">
                            {/* Play/Pause */}
                            <button
                                className="control-button play-pause"
                                onClick={togglePlayPause}
                                title={isPlaying ? 'Пауза' : 'Воспроизвести'}
                            >
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Mute/Unmute */}
                            <button
                                className="control-button mute"
                                onClick={toggleMute}
                                title={isMuted ? 'Включить звук' : 'Выключить звук'}
                            >
                                {isMuted ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>

                            {/* Громкость */}
                            <div className="volume-control">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                    className="volume-slider"
                                />
                            </div>

                            {/* Название трансляции */}
                            <div className="stream-info">
                                <span className="stream-title">{stream.title}</span>
                                <div className="live-indicator">
                                    <div className="live-dot"></div>
                                    <span>LIVE</span>
                                </div>
                            </div>

                            {/* Полноэкранный режим */}
                            <button
                                className="control-button fullscreen"
                                onClick={toggleFullscreen}
                                title="Полноэкранный режим"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HLSPlayer;
