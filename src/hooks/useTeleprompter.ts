import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

export function useTeleprompter(containerRef: RefObject<HTMLDivElement>, speed: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(speed);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const animate = useCallback((timestamp: number) => {
    if (!isPlayingRef.current || !containerRef.current) return;

    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = Math.min(timestamp - lastTimeRef.current, 100);
    lastTimeRef.current = timestamp;

    const el = containerRef.current;
    el.scrollTop += (speedRef.current * dt) / 1000;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      setIsPlaying(false);
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [containerRef]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, animate]);

  const toggle = useCallback(() => setIsPlaying(p => !p), []);

  const pause = useCallback(() => setIsPlaying(false), []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [containerRef]);

  const scrollBy = useCallback((px: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = Math.max(0, containerRef.current.scrollTop + px);
    }
  }, [containerRef]);

  const scrollToFraction = useCallback((fraction: number) => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.scrollTop = fraction * (el.scrollHeight - el.clientHeight);
  }, [containerRef]);

  return { isPlaying, toggle, pause, reset, scrollBy, scrollToFraction };
}
