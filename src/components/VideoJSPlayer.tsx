import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './VideoJSPlayer.css';
import { useStreamStatus } from '../hooks/useStreamStatus';

interface VideoJSPlayerProps {
    src: string;
    poster?: string;
    onError?: (error: any) => void;
    onPlay?: () => void;
    onPause?: () => void;
    className?: string;
}

const VideoJSPlayer: React.FC<VideoJSPlayerProps> = ({
    src,
    poster,
    onError,
    onPlay,
    onPause,
    className
}) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const { status, updateStatus, updateStatusImmediate, resetStatus, checkStreamAvailability, setLoadingWithMinimumTime } = useStreamStatus(src);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const loadingStateRef = useRef<string>('initial'); // 'initial', 'loading', 'loaded', 'error'

    const MAX_RECONNECT_ATTEMPTS = 3;
    const RECONNECT_DELAY = 3000;

    const initializePlayer = (videoElement: HTMLVideoElement) => {
        const player = videojs(videoElement, {
            controls: true,
            responsive: true,
            fluid: true,
            playsinline: true,
            preload: 'metadata',
            poster: poster,
            liveui: true,
            html5: {
                hls: {
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true,
                    overrideNative: true,
                    handlePartialData: true,
                },
                nativeVideoTracks: false,
                nativeAudioTracks: false,
                nativeTextTracks: false
            },
            techOrder: ['html5']
        });

        // Set source
        player.src({
            src: src,
            type: 'application/x-mpegURL'
        });

        // Loading events with precise state management
        player.on('loadstart', () => {
            console.log('🔄 Loading started');
            loadingStateRef.current = 'loading';
            setLoadingWithMinimumTime(true);
            updateStatusImmediate({
                hasError: false,
                isConnected: false
            });
        });

        player.on('loadedmetadata', () => {
            console.log('📊 Metadata loaded');
            loadingStateRef.current = 'loaded';
            updateStatus({
                isLoading: false,
                isConnected: true
            });
        });

        player.on('canplay', () => {
            console.log('▶️ Can play');
            if (loadingStateRef.current !== 'error') {
                loadingStateRef.current = 'loaded';
                updateStatus({
                    isLoading: false,
                    isConnected: true,
                    hasError: false
                });
            }
        });

        player.on('waiting', () => {
            console.log('⏳ Buffering');
            // Only show loading spinner for buffering, not initial load
            if (status.isConnected && loadingStateRef.current === 'loaded') {
                setLoadingWithMinimumTime(true);
            }
        });

        player.on('playing', () => {
            console.log('🎬 Playing');
            loadingStateRef.current = 'loaded';
            updateStatus({
                isLoading: false,
                isConnected: true,
                hasError: false,
                isReconnecting: false,
                reconnectAttempts: 0
            });
            onPlay?.();
        });

        player.on('pause', () => {
            console.log('⏸️ Paused');
            onPause?.();
        });

        player.on('stalled', () => {
            console.log('🚫 Stalled');
            // Only show loading if we're in a connected state
            if (status.isConnected && loadingStateRef.current === 'loaded') {
                setLoadingWithMinimumTime(true);
            }
        });

        player.on('suspend', () => {
            console.log('⏹️ Suspended');
            if (loadingStateRef.current === 'loaded') {
                updateStatus({ isLoading: false });
            }
        });

        // Comprehensive error handling
        player.on('error', async (event: any) => {
            const error = player.error();
            console.error('❌ Player error:', error);

            if (!error) return;

            let message = 'Ошибка воспроизведения';
            let shouldRetry = false;

            switch (error.code) {
                case 1: // MEDIA_ERR_ABORTED
                    message = 'Воспроизведение прервано';
                    break;
                case 2: // MEDIA_ERR_NETWORK
                    message = 'Сетевая ошибка';
                    shouldRetry = true;
                    break;
                case 3: // MEDIA_ERR_DECODE
                    message = 'Ошибка декодирования';
                    break;
                case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                    message = 'Поток недоступен';
                    shouldRetry = true;
                    break;
                default:
                    message = error.message || 'Неизвестная ошибка';
                    shouldRetry = true;
            }

            updateStatus({
                isLoading: false,
                hasError: true,
                errorMessage: message,
                isConnected: false
            });

            onError?.(error);

            // Auto-retry for network errors
            if (shouldRetry && status.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                handleAutoRetry();
            }
        });

        setIsPlayerReady(true);
        return player;
    };

    const handleAutoRetry = async () => {
        console.log(`🔄 Auto-retry attempt ${status.reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);

        updateStatus({
            isReconnecting: true,
            reconnectAttempts: status.reconnectAttempts + 1,
            hasError: false
        });

        // Check if stream is available before retrying
        const isAvailable = await checkStreamAvailability();
        if (!isAvailable) {
            console.log('📡 Stream not available, delaying retry...');
        }

        retryTimeoutRef.current = setTimeout(() => {
            if (playerRef.current) {
                loadingStateRef.current = 'loading';
                setLoadingWithMinimumTime(true);
                playerRef.current.src({
                    src: src,
                    type: 'application/x-mpegURL'
                });
                playerRef.current.load();
            }
        }, RECONNECT_DELAY);
    };

    const handleManualRetry = () => {
        console.log('🔄 Manual retry');

        // Clear auto-retry timeout
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }

        resetStatus();

        if (playerRef.current) {
            playerRef.current.src({
                src: src,
                type: 'application/x-mpegURL'
            });
            playerRef.current.load();
        }
    };

    useEffect(() => {
        if (!videoRef.current) return;

        const videoElement = document.createElement('video');
        videoElement.className = 'video-js vjs-default-skin';
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
        videoRef.current.appendChild(videoElement);

        playerRef.current = initializePlayer(videoElement);

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }

            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
            setIsPlayerReady(false);
        };
    }, [src]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    const shouldShowLoading = (status.isLoading || status.isInitializing) && !status.hasError && isPlayerReady;
    const shouldShowError = status.hasError && isPlayerReady;

    return (
        <div className={`videojs-player ${className || ''}`}>
            <div ref={videoRef} className="video-container" />

            {/* Stable Loading Overlay - only show when actually loading */}
            {shouldShowLoading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                        <div className="loading-text">
                            {status.isReconnecting
                                ? `Переподключение... (${status.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
                                : 'Подключение к трансляции...'
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Error Overlay - only show when there's an actual error */}
            {shouldShowError && (
                <div className="error-overlay">
                    <div className="error-content">
                        <div className="error-icon">📡</div>
                        <div className="error-title">Трансляция недоступна</div>
                        <div className="error-message">{status.errorMessage}</div>

                        {status.reconnectAttempts < MAX_RECONNECT_ATTEMPTS ? (
                            <button className="retry-button" onClick={handleManualRetry}>
                                Повторить подключение
                            </button>
                        ) : (
                            <div className="max-retries-reached">
                                <div className="max-retries-text">
                                    Превышено максимальное количество попыток
                                </div>
                                <button className="retry-button" onClick={handleManualRetry}>
                                    Попробовать снова
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoJSPlayer;
