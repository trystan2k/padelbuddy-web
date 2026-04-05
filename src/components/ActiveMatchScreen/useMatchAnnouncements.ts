import { useEffect, useRef } from 'react'

import type { MatchProjection } from '@/core/match/types'
import { createMatchSpeechEvent } from '@/lib/speech/match-announcer'
import { useSpeechService } from '@/lib/speech/speech-service'
import type { SpeechEventData } from '@/lib/speech/types'

interface UseMatchAnnouncementsParams {
  projection: MatchProjection
  actionCount: number
  team1Name: string
  team2Name: string
}

export function useMatchAnnouncements({
  projection,
  actionCount,
  team1Name,
  team2Name
}: UseMatchAnnouncementsParams) {
  const speechService = useSpeechService()
  const previousProjectionRef = useRef(projection)
  const previousActionCountRef = useRef(actionCount)
  const hasInitializedSpeechRef = useRef(false)
  const announceSpeechRef = useRef<(event: Omit<SpeechEventData, 'verbosity'>) => void>((event) =>
    speechService.announce(event)
  )
  const cancelRef = useRef<() => void>(() => {})

  useEffect(() => {
    announceSpeechRef.current = (event) => {
      speechService.announce(event)
    }
    cancelRef.current = () => {
      speechService.cancel()
    }
  }, [speechService])

  useEffect(() => {
    if (!hasInitializedSpeechRef.current) {
      hasInitializedSpeechRef.current = true
      previousProjectionRef.current = projection
      previousActionCountRef.current = actionCount

      return
    }

    if (!projection.setup.audioAnnouncementsEnabled) {
      previousProjectionRef.current = projection
      previousActionCountRef.current = actionCount

      return
    }

    const announcement = createMatchSpeechEvent(
      previousProjectionRef.current,
      projection,
      previousActionCountRef.current,
      actionCount,
      team1Name,
      team2Name
    )

    previousProjectionRef.current = projection
    previousActionCountRef.current = actionCount

    if (announcement === null) {
      return
    }

    announceSpeechRef.current(announcement)
  }, [actionCount, projection, team1Name, team2Name])

  useEffect(
    () => () => {
      cancelRef.current()
    },
    []
  )
}
