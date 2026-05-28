"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useTimer(initialMinutes: number, onTimeout?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          onTimeoutRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback((minutes?: number) => {
    setRunning(false);
    setSecondsLeft((minutes ?? initialMinutes) * 60);
  }, [initialMinutes]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLow = secondsLeft <= 30;
  const isWarning = secondsLeft <= 120 && !isLow;

  return { secondsLeft, display, isLow, isWarning, running, start, pause, reset };
}
