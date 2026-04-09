import { useEffect, useState } from 'react';

interface OrientationState {
  isPortrait: boolean;
  isLandscape: boolean;
}

const defaultOrientationState: OrientationState = {
  isPortrait: true,
  isLandscape: false
};

function subscribeToOrientationChange(query: MediaQueryList, handler: () => void) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler);
    return;
  }

  query.addListener(handler);
}

function unsubscribeFromOrientationChange(query: MediaQueryList, handler: () => void) {
  if (typeof query.removeEventListener === 'function') {
    query.removeEventListener('change', handler);
    return;
  }

  query.removeListener(handler);
}

function getOrientationState(): OrientationState {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return defaultOrientationState;
  }

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;

  return {
    isPortrait,
    isLandscape: !isPortrait
  };
}

export function useOrientationDetection(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>(getOrientationState);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia('(orientation: portrait)');
    const update = () => {
      setOrientation(getOrientationState());
    };

    subscribeToOrientationChange(query, update);
    return () => unsubscribeFromOrientationChange(query, update);
  }, []);

  return orientation;
}
