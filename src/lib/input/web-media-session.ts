const webMediaSessionMetadata = {
  title: 'Padel Buddy',
  artist: 'Match Remote',
  album: 'Score Control'
};

let backgroundAudioElement: HTMLAudioElement | null = null;
let silentAudioUrl: string | null = null;

type SupportedMediaSessionAction = 'nexttrack' | 'previoustrack';

const supportedMediaSessionActions: SupportedMediaSessionAction[] = ['nexttrack', 'previoustrack'];

function getMediaSession(): MediaSession | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return navigator.mediaSession;
}

function getSilentAudioUrl(): string {
  if (silentAudioUrl) {
    return silentAudioUrl;
  }

  const sampleRate = 8000;
  const channelCount = 1;
  const bitsPerSample = 8;
  const durationSeconds = 1;
  const sampleCount = sampleRate * durationSeconds;
  const blockAlign = channelCount * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < sampleCount; index += 1) {
    view.setUint8(44 + index, 128);
  }

  silentAudioUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));

  return silentAudioUrl;
}

function getBackgroundAudioElement(): HTMLAudioElement {
  if (backgroundAudioElement) {
    return backgroundAudioElement;
  }

  const audioElement = new Audio(getSilentAudioUrl());
  audioElement.loop = true;
  audioElement.preload = 'auto';
  audioElement.crossOrigin = 'anonymous';

  backgroundAudioElement = audioElement;

  return audioElement;
}

async function startBackgroundPlayback(): Promise<void> {
  const audioElement = getBackgroundAudioElement();

  if (!audioElement.paused) {
    return;
  }

  try {
    await audioElement.play();
  } catch {
    // Ignore autoplay failures; match-start user gesture is the main activation path.
  }
}

function stopBackgroundPlayback(): void {
  if (!backgroundAudioElement) {
    return;
  }

  backgroundAudioElement.pause();
  backgroundAudioElement.currentTime = 0;
}

export function activateWebMediaSession(): void {
  const mediaSession = getMediaSession();

  if (!mediaSession) {
    return;
  }

  if (typeof MediaMetadata !== 'undefined') {
    try {
      mediaSession.metadata = new MediaMetadata(webMediaSessionMetadata);
    } catch {
      // Ignore metadata failures on partial implementations.
    }
  }

  try {
    mediaSession.playbackState = 'playing';
  } catch {
    // Ignore playbackState failures on partial implementations.
  }

  try {
    mediaSession.setActionHandler('play', () => {
      void startBackgroundPlayback();
      mediaSession.playbackState = 'playing';
    });
  } catch {
    // Ignore unsupported actions.
  }

  try {
    mediaSession.setActionHandler('pause', () => {
      stopBackgroundPlayback();
      mediaSession.playbackState = 'paused';
    });
  } catch {
    // Ignore unsupported actions.
  }
}

export function primeWebMediaSession(): void {
  const mediaSession = getMediaSession();

  if (!mediaSession) {
    return;
  }

  activateWebMediaSession();
  void startBackgroundPlayback();

  for (const action of supportedMediaSessionActions) {
    try {
      mediaSession.setActionHandler(action, () => {
        // Register no-op handlers during the user gesture so later handlers can take over.
      });
    } catch {
      // Ignore unsupported actions.
    }
  }
}

export function clearWebMediaSession(): void {
  const mediaSession = getMediaSession();

  stopBackgroundPlayback();

  if (!mediaSession) {
    return;
  }

  try {
    mediaSession.playbackState = 'none';
  } catch {
    // Ignore playbackState failures on partial implementations.
  }

  try {
    mediaSession.setActionHandler('play', null);
  } catch {
    // Ignore unsupported actions.
  }

  try {
    mediaSession.setActionHandler('pause', null);
  } catch {
    // Ignore unsupported actions.
  }
}
