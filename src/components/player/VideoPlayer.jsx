import { useRef, useState, useCallback, useEffect, useId, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheaterMode } from '../../store/slices/uiSlice';
import { useYouTubePlayer } from '../../hooks/utils/useYouTubePlayer';

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const QUALITY_LABELS = { highres: '4K', hd2160: '2160p', hd1440: '1440p', hd1080: '1080p', hd720: '720p', large: '480p', medium: '360p', small: '240p', tiny: '144p', auto: 'Auto' };

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const PlayIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const VolumeHighIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;
const VolumeMidIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>;
const VolumeMuteIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>;
const FullscreenIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>;
const ExitFullscreenIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>;
const TheaterIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/></svg>;
const SettingsIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const LoopIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1 11v-1H9v1h2zm4 0v-1h-2v1h2zm-2-7v4h1l-1.5 1.5L11 13h1V9h1z"/></svg>;
const SubtitleIcon = () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/></svg>;

const VideoPlayer = forwardRef(function VideoPlayer({ videoId, onEnded }, ref) {
  const uid = useId().replace(/:/g, '');
  const containerId = `yt-player-${uid}`;
  const wrapRef = useRef(null);
  const progressRef = useRef(null);
  const settingsRef = useRef(null);
  const dispatch = useDispatch();
  const theaterMode = useSelector(s => s.ui.theaterMode);

  const { ready, isPlaying, currentTime, duration, buffered, volume, muted, rate, quality, availableQualities, isLooping, isSubtitles, togglePlay, seek, setVolume, toggleMute, setRate, setQuality, toggleLoop, toggleSubtitles } = useYouTubePlayer({ videoId, containerId, onEnded });

  // Expose play controls to parent via ref
  useImperativeHandle(ref, () => ({ togglePlay, isPlaying }), [togglePlay, isPlaying]);

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('main'); // 'main' | 'speed' | 'quality'
  const [scrubbing, setScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [seekPreview, setSeekPreview] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showRewindAnim, setShowRewindAnim] = useState(false);
  const [showForwardAnim, setShowForwardAnim] = useState(false);
  const hideTimer = useRef(null);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  }, [isPlaying, showSettings]);

  useEffect(() => { resetHideTimer(); return () => clearTimeout(hideTimer.current); }, []);
  useEffect(() => { if (!isPlaying) { setShowControls(true); clearTimeout(hideTimer.current); } else resetHideTimer(); }, [isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Click outside settings to close
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
        setSettingsTab('main');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seek(Math.max(0, currentTime - 5)); setShowRewindAnim(true); setTimeout(() => setShowRewindAnim(false), 600); break;
        case 'ArrowRight': e.preventDefault(); seek(Math.min(duration, currentTime + 5)); setShowForwardAnim(true); setTimeout(() => setShowForwardAnim(false), 600); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(100, volume + 10)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, volume - 10)); break;
        case 'm': case 'M': toggleMute(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 't': case 'T': dispatch(toggleTheaterMode()); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentTime, duration, volume, isPlaying]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  // Progress bar scrubbing
  const getSeekTime = useCallback((e) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return pct * duration;
  }, [duration]);

  const handleProgressMouseMove = (e) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverX(pct * 100);
    setHoverTime(pct * duration);
    setSeekPreview(pct * duration);
    if (scrubbing) seek(pct * duration);
  };

  const handleProgressMouseDown = (e) => {
    setScrubbing(true);
    seek(getSeekTime(e));
  };

  useEffect(() => {
    const up = () => setScrubbing(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const played = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = buffered * 100;

  const VolumeIcon = muted || volume === 0 ? VolumeMuteIcon : volume < 50 ? VolumeMidIcon : VolumeHighIcon;

  return (
    <div
      ref={wrapRef}
      className="relative w-full bg-black select-none overflow-hidden group"
      style={{ aspectRatio: isFullscreen ? undefined : '16/9', height: isFullscreen ? '100%' : undefined }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
      onDoubleClick={toggleFullscreen}
    >
      {/* YT iframe container */}
      <div id={containerId} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Loading shimmer */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Rewind/Forward animation */}
      {showRewindAnim && (
        <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping-once">
          <div className="flex flex-col items-center text-white">
            <svg className="w-12 h-12 opacity-90" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
            <span className="text-xs font-bold mt-1">-5s</span>
          </div>
        </div>
      )}
      {showForwardAnim && (
        <div className="absolute right-1/4 top-1/2 translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping-once">
          <div className="flex flex-col items-center text-white">
            <svg className="w-12 h-12 opacity-90" viewBox="0 0 24 24" fill="currentColor"><path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z"/></svg>
            <span className="text-xs font-bold mt-1">+5s</span>
          </div>
        </div>
      )}

      {/* Center play/pause indicator — clickable */}
      {ready && !isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1"><PlayIcon /></div>
          </div>
        </div>
      )}

      {/* Settings menu */}
      {showSettings && (
        <div ref={settingsRef} className="absolute bottom-16 right-3 z-40 bg-black/90 rounded-xl overflow-hidden shadow-2xl min-w-[220px] backdrop-blur-sm border border-white/10" onClick={e => e.stopPropagation()}>
          {settingsTab === 'main' && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs text-white/50 font-medium uppercase tracking-wide">Settings</div>
              <button onClick={() => setSettingsTab('speed')} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
                <span>Playback speed</span>
                <span className="text-white/60">{rate === 1 ? 'Normal' : `${rate}x`}</span>
              </button>
              {availableQualities.length > 0 && (
                <button onClick={() => setSettingsTab('quality')} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
                  <span>Quality</span>
                  <span className="text-white/60">{QUALITY_LABELS[quality] || quality}</span>
                </button>
              )}
              <button onClick={() => { toggleLoop(); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
                <span>Loop</span>
                <span className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${isLooping ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <span className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${isLooping ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
              </button>
              <button onClick={() => { toggleSubtitles(); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
                <span>Subtitles / CC</span>
                <span className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${isSubtitles ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <span className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${isSubtitles ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
              </button>
            </div>
          )}
          {settingsTab === 'speed' && (
            <div className="py-2">
              <button onClick={() => setSettingsTab('main')} className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white w-full">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Playback speed
              </button>
              {SPEEDS.map(s => (
                <button key={s} onClick={() => { setRate(s); setSettingsTab('main'); }} className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-white/10 transition-colors ${rate === s ? 'text-blue-400' : 'text-white'}`}>
                  {rate === s && <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                  {rate !== s && <span className="w-4 flex-shrink-0"/>}
                  {s === 1 ? 'Normal' : `${s}x`}
                </button>
              ))}
            </div>
          )}
          {settingsTab === 'quality' && (
            <div className="py-2">
              <button onClick={() => setSettingsTab('main')} className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white w-full">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Quality
              </button>
              {['auto', ...availableQualities].map(q => (
                <button key={q} onClick={() => { setQuality(q); setSettingsTab('main'); }} className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-white/10 transition-colors ${quality === q ? 'text-blue-400' : 'text-white'}`}>
                  {quality === q && <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                  {quality !== q && <span className="w-4 flex-shrink-0"/>}
                  {QUALITY_LABELS[q] || q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={togglePlay}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Inner controls — stop propagation so clicks here don't bubble to the overlay togglePlay */}
        <div className="relative px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          {/* Progress bar */}
          {/* Progress bar wrapper — adds vertical padding for easier touch/mouse grabbing */}
          <div
            className="py-2 -my-2 cursor-pointer group/prog"
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            onMouseDown={handleProgressMouseDown}
          >
            <div ref={progressRef} className="relative h-[3px] group-hover/prog:h-[5px] transition-all duration-100 rounded-full bg-white/25">
              {/* Buffered */}
              <div className="absolute inset-y-0 left-0 bg-white/35 rounded-full" style={{ width: `${bufferedPct}%` }} />
              {/* Played — bright YouTube red */}
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${played}%`, background: '#ff0033' }} />
              {/* Thumb dot — large, always on top */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full shadow-lg opacity-0 group-hover/prog:opacity-100 transition-opacity"
                style={{ left: `calc(${played}% - 7px)`, background: '#ff0033', boxShadow: '0 0 4px rgba(255,0,51,0.6)' }}
              />
              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div className="absolute -top-9 bg-black/90 text-white text-xs px-2 py-1 rounded-md pointer-events-none font-semibold shadow-lg" style={{ left: `calc(${hoverX}% - 20px)` }}>
                  {fmt(hoverTime)}
                </div>
              )}
            </div>
          </div>

          {/* Bottom controls row */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white hover:scale-110 transition-transform flex-shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7">{isPlaying ? <PauseIcon /> : <PlayIcon />}</div>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 sm:gap-2 group/vol" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6"><VolumeIcon /></div>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                <input
                  type="range" min="0" max="100" value={muted ? 0 : volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-20 h-1 accent-white cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <div className="text-white text-xs sm:text-sm font-medium tabular-nums flex-shrink-0 ml-1">
              {fmt(currentTime)} / {fmt(duration)}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Subtitle toggle button */}
            <button onClick={toggleSubtitles} title="Subtitles/CC (c)" className={`hidden sm:flex w-8 h-8 items-center justify-center transition-all flex-shrink-0 ${isSubtitles ? 'text-blue-400' : 'text-white hover:scale-110'}`}>
              <div className="w-5 h-5 sm:w-6 sm:h-6"><SubtitleIcon /></div>
            </button>

            {/* Loop toggle button */}
            <button onClick={toggleLoop} title="Loop (l)" className={`hidden sm:flex w-8 h-8 items-center justify-center transition-all flex-shrink-0 ${isLooping ? 'text-blue-400' : 'text-white hover:scale-110'}`}>
              <div className="w-5 h-5 sm:w-6 sm:h-6"><LoopIcon /></div>
            </button>

            {/* Settings */}
            <button onClick={() => { setShowSettings(p => !p); setSettingsTab('main'); }} className={`w-8 h-8 flex items-center justify-center text-white transition-all flex-shrink-0 ${showSettings ? 'rotate-45 text-blue-400' : 'hover:rotate-45'}`}>
              <div className="w-5 h-5 sm:w-6 sm:h-6"><SettingsIcon /></div>
            </button>

            {/* Theater mode (hidden on mobile) */}
            <button onClick={() => dispatch(toggleTheaterMode())} title="Theater mode (t)" className="hidden sm:flex w-8 h-8 items-center justify-center text-white hover:scale-110 transition-transform flex-shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6"><TheaterIcon /></div>
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform flex-shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6">{isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
