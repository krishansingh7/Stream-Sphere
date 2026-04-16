/**
 * useMediaSession — Background Audio + OS Media Controls
 *
 * How it works:
 * 1. Web Audio API creates a subsonic (1 Hz) oscillator at near-zero gain.
 *    This registers the page as "playing audio", which is required for
 *    the Media Session API to surface on the OS lock screen / notification
 *    shade, AND prevents the browser from throttling/suspending the tab.
 *
 * 2. The AudioContext is started lazily on first user interaction
 *    (click / touchend) to comply with autoplay policies.
 *
 * 3. Media Session API is populated with title, artist, artwork so the
 *    OS controls show the correct track info.
 *
 * 4. Screen Wake Lock prevents the device from sleeping while playing.
 */

import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setPlaying, closePlayer } from "../../store/slices/playerSlice";

export function useMediaSession(
  { title, channelTitle, thumbnail, isPlaying, videoId },
  handlers = {},
) {
  const dispatch = useDispatch();

  // Web Audio API refs
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const wakeLockRef = useRef(null);
  const startedRef = useRef(false);

  // ── Build the AudioContext once ───────────────────────────────────────────
  const buildAudioContext = useCallback(() => {
    if (audioCtxRef.current) return; // already built

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const gain = ctx.createGain();
      gain.gain.value = 0.0001; // subsonic level — completely inaudible

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 1; // 1 Hz — far below human hearing

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscillatorRef.current = osc;
      gainRef.current = gain;
    } catch {
      // Web Audio API unavailable — graceful no-op
    }
  }, []);

  // ── Resume / Suspend based on play state ─────────────────────────────────
  const resumeAudio = useCallback(async () => {
    buildAudioContext();
    try {
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }
    } catch {
      /* ignore */
    }
  }, [buildAudioContext]);

  const suspendAudio = useCallback(async () => {
    try {
      if (audioCtxRef.current?.state === "running") {
        await audioCtxRef.current.suspend();
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Start audio on first user interaction (autoplay policy) ──────────────
  useEffect(() => {
    const onInteraction = () => {
      if (!startedRef.current && videoId && isPlaying) {
        resumeAudio();
        startedRef.current = true;
      }
      // After first interaction audio context can freely resume later
    };
    document.addEventListener("click", onInteraction, { passive: true });
    document.addEventListener("touchend", onInteraction, { passive: true });
    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchend", onInteraction);
    };
  }, [videoId, isPlaying, resumeAudio]);

  // ── Sync audio context with Redux play state ──────────────────────────────
  useEffect(() => {
    if (!videoId) {
      suspendAudio();
      return;
    }
    if (isPlaying) {
      resumeAudio();
    } else {
      suspendAudio();
    }
  }, [isPlaying, videoId, resumeAudio, suspendAudio]);

  // ── Resume after tab becomes visible again ────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && isPlaying && videoId) {
        resumeAudio();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isPlaying, videoId, resumeAudio]);

  // ── Screen Wake Lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!("wakeLock" in navigator) || !videoId) return;

    let lock = null;

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        /* unsupported */
      }
    };
    const release = async () => {
      try {
        await lock?.release();
        lock = null;
      } catch {
        /* ignore */
      }
    };

    if (isPlaying) {
      request();
    } else {
      release();
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible" && isPlaying) request();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      release();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isPlaying, videoId]);

  // ── Media Session API — OS lock screen / notification controls ────────────
  useEffect(() => {
    if (!("mediaSession" in navigator) || !videoId) return;

    // Track metadata shown on lock screen, Bluetooth devices, car HUDs, etc.
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "StreamSphere",
        artist: channelTitle || "YouTube",
        album: "StreamSphere",
        artwork: thumbnail
          ? [
              { src: thumbnail, sizes: "96x96", type: "image/jpeg" },
              { src: thumbnail, sizes: "128x128", type: "image/jpeg" },
              { src: thumbnail, sizes: "256x256", type: "image/jpeg" },
              { src: thumbnail, sizes: "512x512", type: "image/jpeg" },
            ]
          : [],
      });
    } catch {
      /* MediaMetadata not supported */
    }

    // playbackState drives the play/pause icon on the lock screen
    try {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {
      /* ignore */
    }

    // Safe action handler helper
    const setHandler = (action, fn) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        /* action unsupported */
      }
    };

    setHandler("play", () => {
      dispatch(setPlaying(true));
      resumeAudio();
    });

    setHandler("pause", () => {
      dispatch(setPlaying(false));
      suspendAudio();
    });

    setHandler("stop", () => {
      dispatch(closePlayer());
      suspendAudio();
    });

    // Only wire next/prev if the caller provides handlers (playlist mode)
    setHandler("nexttrack", handlers.onNext || null);
    setHandler("previoustrack", handlers.onPrev || null);

    return () => {
      ["play", "pause", "stop", "nexttrack", "previoustrack"].forEach((a) =>
        setHandler(a, null),
      );
    };
  }, [
    isPlaying,
    videoId,
    title,
    channelTitle,
    thumbnail,
    dispatch,
    resumeAudio,
    suspendAudio,
    handlers.onNext,
    handlers.onPrev,
  ]);

  // ── Cleanup on full unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      try {
        oscillatorRef.current?.stop();
        audioCtxRef.current?.close();
      } catch {
        /* ignore */
      }
    };
  }, []);
}
