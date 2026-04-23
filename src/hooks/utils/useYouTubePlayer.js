import { useEffect, useRef, useState, useCallback } from 'react';

let ytApiLoaded = false;
let ytApiLoading = false;
const ytApiCallbacks = [];

function loadYTApi() {
  if (ytApiLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    ytApiCallbacks.push(resolve);
    if (!ytApiLoading) {
      ytApiLoading = true;
      window.onYouTubeIframeAPIReady = () => {
        ytApiLoaded = true;
        ytApiCallbacks.forEach(cb => cb());
        ytApiCallbacks.length = 0;
      };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
}

export function useYouTubePlayer({ videoId, containerId, onEnded }) {
  const playerRef = useRef(null);
  const rafRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playerState, setPlayerState] = useState(-1); // YT.PlayerState
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);
  const [quality, setQualityState] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [isLooping, setIsLooping] = useState(false);
  const [isSubtitles, setIsSubtitles] = useState(false);
  const isLoopingRef = useRef(false);

  useEffect(() => {
    let destroyed = false;
    loadYTApi().then(() => {
      if (destroyed) return;
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          disablekb: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            if (destroyed) return;
            setReady(true);
            setVolumeState(e.target.getVolume());
            setMuted(e.target.isMuted());
            setDuration(e.target.getDuration());
          },
          onStateChange: (e) => {
            setPlayerState(e.data);
            if (e.data === window.YT.PlayerState.ENDED) {
              if (isLoopingRef.current) {
                e.target.seekTo(0);
                e.target.playVideo();
              } else if (onEnded) {
                onEnded();
              }
            }
          },
          onPlaybackQualityChange: (e) => setQualityState(e.data),
          onPlaybackRateChange: (e) => setRateState(e.data),
          onError: () => {},
        },
      });
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId, containerId]);

  // Poll time + buffered
  useEffect(() => {
    const poll = () => {
      const p = playerRef.current;
      if (p && typeof p.getCurrentTime === 'function') {
        setCurrentTime(p.getCurrentTime() || 0);
        setDuration(p.getDuration() || 0);
        setBuffered(p.getVideoLoadedFraction() || 0);
        const qs = p.getAvailableQualityLevels?.();
        if (qs?.length) setAvailableQualities(qs);
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const play = useCallback(() => playerRef.current?.playVideo?.(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);
  const togglePlay = useCallback(() => {
    const state = playerRef.current?.getPlayerState?.();
    if (state === window.YT?.PlayerState?.PLAYING) playerRef.current.pauseVideo();
    else playerRef.current?.playVideo?.();
  }, []);
  const seek = useCallback((t) => playerRef.current?.seekTo?.(t, true), []);
  const setVolume = useCallback((v) => {
    playerRef.current?.setVolume?.(v);
    setVolumeState(v);
    if (v > 0) { playerRef.current?.unMute?.(); setMuted(false); }
  }, []);
  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) { p.unMute(); setMuted(false); }
    else { p.mute(); setMuted(true); }
  }, []);
  const setRate = useCallback((r) => {
    const p = playerRef.current;
    if (!p) return;
    const wasPlaying = p.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
    p.setPlaybackRate?.(r);
    setRateState(r);
    if (wasPlaying) {
      setTimeout(() => playerRef.current?.playVideo?.(), 100);
    }
  }, []);
  const setQuality = useCallback((q) => {
    const p = playerRef.current;
    if (!p) return;
    const wasPlaying = p.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
    p.setPlaybackQuality?.(q);
    setQualityState(q);
    // Resume playback if it was playing before quality switch
    if (wasPlaying) {
      setTimeout(() => playerRef.current?.playVideo?.(), 150);
    }
  }, []);
  const toggleLoop = useCallback(() => {
    setIsLooping(prev => { isLoopingRef.current = !prev; return !prev; });
  }, []);
  const toggleSubtitles = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    setIsSubtitles(prev => {
      if (!prev) {
        try { p.setOption?.('captions', 'track', {}); p.loadModule?.('captions'); } catch(_) {}
      } else {
        try { p.unloadModule?.('captions'); } catch(_) {}
      }
      return !prev;
    });
  }, []);

  const isPlaying = playerState === 1;

  return { ready, isPlaying, playerState, currentTime, duration, buffered, volume, muted, rate, quality, availableQualities, isLooping, isSubtitles, play, pause, togglePlay, seek, setVolume, toggleMute, setRate, setQuality, toggleLoop, toggleSubtitles };
}
