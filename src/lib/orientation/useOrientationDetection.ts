import { useEffect, useState } from 'react'

export interface OrientationState {
  isPortrait: boolean
  isLandscape: boolean
}

const defaultOrientationState: OrientationState = {
  isPortrait: true,
  isLandscape: false
}

function getOrientationState(): OrientationState {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return defaultOrientationState
  }

  const isPortrait = window.matchMedia('(orientation: portrait)').matches

  return {
    isPortrait,
    isLandscape: !isPortrait
  }
}

export function useOrientationDetection(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>(getOrientationState)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const query = window.matchMedia('(orientation: portrait)')
    const update = () => {
      setOrientation(getOrientationState())
    }

    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return orientation
}
