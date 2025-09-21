import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { PlayerConfig, VideoLevel } from '../types';
import { usePageVisibility } from '../hooks/usePageVisibility';
import './player.css';

// ── utils ──────────────────────────────────────────────────────────────────────
async function probeHls(url: string, timeoutMs: number): Promise<boolean> {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
        const res = await fetch(url, { method: 'GET', cache: 'no-store', redirect: 'follow', signal: ac.signal });
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
    requestTimeoutMs = 3000,
    autoPlayMuted = true,
    retryBaseDelayMs = 3000,
    retryMaxDelayMs = 15000,
    className = '',
    previewImage,
    matchTitle,
    isLive = false
}) => {
    // ── state ────────────────────────────────────────────────────────────────────
    const [effSrc, setEffSrc] = useState<string>(fallbackSrc);
    const [effType, setEffType] = useState<'video' | 'hls'>('video');
    const [isPlaying, setIsPlaying] = useState(false);
    const [muted, setMuted] = useState(autoPlayMuted);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasActiveStream, setHasActiveStream] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [levels, setLevels] = useState<VideoLevel[]>([]);
    const [currentLevel, setCurrentLevel] = useState(-1);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [playPromise, setPlayPromise] = useState<Promise<void> | null>(null);
    const [showControls, setShowControls] = useState(true);

    // ── refs ─────────────────────────────────────────────────────────────────────
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isPageVisible = usePageVisibility();

    // env
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    // helpers
    const getFsElement = () =>
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        null;

    const isDocActive = () =>
        document.visibilityState === 'visible' &&
        (document.hasFocus ? document.hasFocus() : true);

    const clearRetryTimer = useCallback(() => {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
    }, []);

    const scheduleRetry = useCallback(
        (nextAttempt?: number) => {
            clearRetryTimer();
            const attempt = nextAttempt ?? 1;
            const delay = Math.min(retryMaxDelayMs, retryBaseDelayMs * Math.pow(1.7, attempt - 1));
            retryTimerRef.current = setTimeout(() => { /* place retry action here if нужно */ }, delay);
        },
        [retryBaseDelayMs, retryMaxDelayMs, clearRetryTimer]
    );

    const exitFullscreenSafe = useCallback(async () => {
        // если уже не в ФС — ок
        const hasFs = () =>
            !!(document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement);

        const tryExit = async () => {
            if (!hasFs()) return true;
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                }
                return true;
            } catch (e: any) {
                // та самая ошибка
                if (typeof e?.message === 'string' && /Document not active/i.test(e.message)) return false;
                // иногда браузер кидает DOMException без message
                if (e?.name === 'InvalidStateError') return false;
                throw e;
            }
        };

        // iOS нативный фуллскрин у <video>
        const v: any = videoRef.current;
        if (v?.webkitDisplayingFullscreen) {
            try { v.webkitExitFullscreen?.(); } catch { }
            return;
        }

        // Ждём, пока документ станет «активным», потом пытаемся выйти.
        // 8 попыток с коротким бэк-оффом.
        for (let i = 0; i < 8; i++) {
            const active = document.visibilityState === 'visible' && (document.hasFocus?.() ?? true);
            if (active) {
                const ok = await tryExit();
                if (ok) return;
            }
            await new Promise(r => setTimeout(r, 80 * (i + 1)));
            if (!hasFs()) return; // уже вышли где-то по дороге
        }

        // последний шанс: попробуем ещё раз, не падая наружу
        try { await tryExit(); } catch { }
    }, []);


    // ── первичная проверка источника ─────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const ok = await probeHls(primarySrc, requestTimeoutMs);
            if (cancelled) return;
            if (ok) {
                setHasActiveStream(true);
                setEffSrc(primarySrc);
                setEffType('hls');
            } else {
                setHasActiveStream(false);
                setEffSrc(fallbackSrc);
                setEffType('video');
            }
        })();
        return () => { cancelled = true; clearRetryTimer(); };
    }, [primarySrc, fallbackSrc, requestTimeoutMs, clearRetryTimer]);

    // ── init / recreate media source (НЕ пересоздаём на громкости/скорости) ──────
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !effSrc) return;

        // очистка предыдущего HLS
        if (hlsRef.current) {
            try { hlsRef.current.destroy(); } catch { }
            hlsRef.current = null;
        }

        if (effType === 'hls' && Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;

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

            hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
                setCurrentLevel(typeof data?.level === 'number' ? data.level : -1);
            });

            hls.attachMedia(video);
            hls.loadSource(effSrc);
        } else {
            // прогрессивный mp4/фоллбек
            video.src = effSrc;
            video.load();
        }

        return () => {
            try { hlsRef.current?.destroy(); } catch { }
            hlsRef.current = null;
        };
    }, [effSrc, effType, reloadNonce]);

    // ── применяем параметры без пересоздания потока ──────────────────────────────
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = muted;
        v.volume = volume;
        v.playbackRate = playbackRate;
    }, [muted, volume, playbackRate]);

    // ── слушатели play/pause ─────────────────────────────────────────────────────
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

    // ── iOS атрибуты и inline ────────────────────────────────────────────────────
    useEffect(() => {
        const v = videoRef.current as any;
        if (!v) return;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
    }, []);

    // ── фуллскрин слушатели + «резюм» после выхода ───────────────────────────────
    useEffect(() => {
        const video = videoRef.current as HTMLVideoElement & { webkitDisplayingFullscreen?: boolean } | null;
        if (!video) return;

        let wasPlaying = false;

        const onFsChange = () => {
            const domFs = !!getFsElement();
            const iosFs = isIOS && !!(video as any).webkitDisplayingFullscreen;
            const nowFs = domFs || iosFs;
            setIsFullscreen(nowFs);
            if (!nowFs && wasPlaying && video.paused) {
                video.play().catch(() => { });
            }
        };
        const onPlay = () => { wasPlaying = true; };
        const onPause = () => { wasPlaying = false; };

        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange as any);
        if (isIOS) {
            (video as any).addEventListener?.('webkitbeginfullscreen', onFsChange);
            (video as any).addEventListener?.('webkitendfullscreen', onFsChange);
        }
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange as any);
            if (isIOS) {
                (video as any).removeEventListener?.('webkitbeginfullscreen', onFsChange);
                (video as any).removeEventListener?.('webkitendfullscreen', onFsChange);
            }
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
        };
    }, [isIOS]);

    // ── ручное переключение качества ─────────────────────────────────────────────
    useEffect(() => {
        const hls = hlsRef.current;
        if (!hls) return;
        if (hls.currentLevel !== currentLevel) {
            hls.currentLevel = currentLevel; // -1 = авто
        }
    }, [currentLevel]);

    // ── controls автоскрытие на десктопе (опц.) ──────────────────────────────────
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const show = () => {
            setShowControls(true);
            clearTimeout(hideControlsTimeoutRef.current!);
            hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
        };

        const mousemove = () => show();
        const mouseleave = () => setShowControls(false);

        container.addEventListener('mousemove', mousemove);
        container.addEventListener('mouseleave', mouseleave);
        show();

        return () => {
            container.removeEventListener('mousemove', mousemove);
            container.removeEventListener('mouseleave', mouseleave);
            if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
        };
    }, []);

    // ── actions ──────────────────────────────────────────────────────────────────
    const togglePlay = useCallback(async () => {
        const v = videoRef.current;
        if (!v) return;
        try {
            if (playPromise) await playPromise;
            if (v.paused || v.ended) {
                const p = v.play();
                setPlayPromise(p);
                await p;
                setPlayPromise(null);
            } else {
                v.pause();
                setPlayPromise(null);
            }
        } catch {
            setPlayPromise(null);
        }
    }, [playPromise]);

    // ГЛАВНОЕ: Фуллскриним контейнер (кроме iOS — нативный FS у video)
    const toggleFullscreen = useCallback(async () => {
        const container = containerRef.current as any;
        const video = videoRef.current as any;
        if (!container || !video) return;

        if ((toggleFullscreen as any)._busy) return;
        (toggleFullscreen as any)._busy = true;
        const release = () => setTimeout(() => ((toggleFullscreen as any)._busy = false), 120);

        try {
            const fsEl = getFsElement();
            const inIosVideoFS = !!video.webkitDisplayingFullscreen;
            const inDomFS = !!fsEl;

            if (!inIosVideoFS && !inDomFS) {
                // ENTER
                if (isIOS && typeof video.webkitEnterFullscreen === 'function') {
                    try { if (video.paused) await video.play(); } catch { }
                    video.webkitEnterFullscreen();
                    release();
                    return;
                }

                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else {
                    // крайний случай
                    if (video.requestFullscreen) await video.requestFullscreen();
                    else if (video.webkitRequestFullscreen) await video.webkitRequestFullscreen();
                }
            } else {
                // EXIT
                await exitFullscreenSafe();
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
            setIsFullscreen(false);
        } finally {
            release();
        }
    }, [isIOS, exitFullscreenSafe]);

    // ── render ───────────────────────────────────────────────────────────────────
    return (
        <div className={`player ${className} ${showControls ? 'show-controls' : ''}`} ref={containerRef}>
            {!isLive && previewImage ? (
                <div className="player-preview">
                    <img src={previewImage} alt={matchTitle || 'Превью'} className="preview-image" />
                </div>
            ) : (
                <video
                    ref={videoRef}
                    muted={muted}
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="player-video"
                />
            )}

            <div className="controls-bar">
                <button className="control-btn" onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
                <button className="control-btn" onClick={() => setMuted(m => !m)}>{muted ? 'Mute' : 'Sound'}</button>

                <input
                    className="volume-slider"
                    type="range" min="0" max="1" step="0.05"
                    value={volume}
                    onChange={e => setVolume(+e.target.value)}
                    aria-label="Volume"
                />

                <select
                    className="speed-select"
                    value={playbackRate}
                    onChange={e => setPlaybackRate(+e.target.value)}
                    aria-label="Speed"
                >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => <option key={r} value={r}>{r}×</option>)}
                </select>

                {effType === 'hls' && levels.length > 0 && (
                    <select
                        className="quality-select"
                        value={currentLevel}
                        onChange={e => setCurrentLevel(+e.target.value)}
                        aria-label="Quality"
                    >
                        <option value={-1}>Авто</option>
                        {levels.map(lv => <option key={lv.index} value={lv.index}>{lv.name}</option>)}
                    </select>
                )}

                <button className="control-btn" onClick={toggleFullscreen}>{isFullscreen ? '⤓' : '⤢'}</button>
            </div>
        </div>
    );
};

export default Player;
