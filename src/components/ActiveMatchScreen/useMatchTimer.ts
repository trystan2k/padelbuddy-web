import { useEffect, useState } from 'react';

import type { CountdownTimerDuration } from '@/core/match/types';

interface UseMatchTimerOptions {
  startedAt: number | null;
  finishedAt?: number;
  isMatchCompleted: boolean;
  countdownEnabled: boolean;
  countdownDuration: CountdownTimerDuration;
}

interface UseMatchTimerReturn {
  elapsedSeconds: number;
  formattedTime: string;
  isRunning: boolean;
}

const millisecondsPerSecond = 1000;
const secondsPerMinute = 60;

function formatClockTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / (secondsPerMinute * secondsPerMinute));
  const minutes = Math.floor(
    (totalSeconds % (secondsPerMinute * secondsPerMinute)) / secondsPerMinute
  );
  const seconds = totalSeconds % secondsPerMinute;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatTimeOfDay(timestamp: number): string {
  const currentTime = new Date(timestamp);

  return [currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

export function useMatchTimer(options: UseMatchTimerOptions): UseMatchTimerReturn {
  const { startedAt, finishedAt, isMatchCompleted, countdownEnabled, countdownDuration } = options;

  const [now, setNow] = useState(Date.now());
  const isLiveClockMode = !countdownEnabled;

  const referenceTimestamp = isMatchCompleted && typeof finishedAt === 'number' ? finishedAt : now;
  const liveReferenceTimestamp =
    isMatchCompleted && typeof finishedAt === 'number' ? finishedAt : Date.now();

  const countdownEndTimestamp =
    startedAt === null
      ? null
      : startedAt + countdownDuration * secondsPerMinute * millisecondsPerSecond;

  const hasCountdownExpired =
    countdownEnabled &&
    countdownEndTimestamp !== null &&
    liveReferenceTimestamp >= countdownEndTimestamp;

  useEffect(() => {
    if (!isLiveClockMode && (startedAt === null || isMatchCompleted || hasCountdownExpired)) {
      return;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [hasCountdownExpired, isLiveClockMode, isMatchCompleted, startedAt]);

  const elapsedSeconds =
    startedAt === null
      ? 0
      : Math.max(0, Math.floor((referenceTimestamp - startedAt) / millisecondsPerSecond));

  const displayedSeconds = !countdownEnabled
    ? elapsedSeconds
    : isMatchCompleted && typeof finishedAt !== 'number'
      ? 0
      : Math.max(
          0,
          Math.floor(
            ((countdownEndTimestamp ?? liveReferenceTimestamp) - liveReferenceTimestamp) /
              millisecondsPerSecond
          )
        );

  const formattedTime = countdownEnabled ? formatClockTime(displayedSeconds) : formatTimeOfDay(now);

  return {
    elapsedSeconds,
    formattedTime,
    isRunning: startedAt !== null && !isMatchCompleted && !hasCountdownExpired
  };
}
