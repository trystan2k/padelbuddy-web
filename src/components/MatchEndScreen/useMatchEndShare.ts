import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import type { MatchEndScreenSummary } from './view-model'

const shareButtonSelector = '[data-share-button="true"]'
const shareLabelSelector = '[data-share-label="true"]'
const statusMessageTimeoutMs = 4000

interface MatchEndShareLabels {
  idleActionLabel: string
  shareText: string
  finishedEarlyShareText: string
  errorMessage: string
  downloadMessage: string
}

interface UseMatchEndShareOptions {
  captureRef: RefObject<HTMLDivElement | null>
  matchId: string
  summary: MatchEndScreenSummary
  labels: MatchEndShareLabels
  shareScreenReady: boolean
  onCaptureComplete: () => void
}

interface UseMatchEndShareResult {
  downloadMessage: string | null
  errorMessage: string | null
  handleShareClick: () => void
  isSharing: boolean
}

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean
  share?: (data?: ShareData) => Promise<void>
}

export function useMatchEndShare({
  captureRef,
  matchId,
  summary,
  labels,
  shareScreenReady,
  onCaptureComplete
}: UseMatchEndShareOptions): UseMatchEndShareResult {
  const [isSharing, setIsSharing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null)
  const isCapturingRef = useRef(false)

  // Handle capture when ShareScreen is ready
  useEffect(() => {
    if (!shareScreenReady || isCapturingRef.current) {
      return
    }

    const captureNode = captureRef.current

    if (!captureNode) {
      setErrorMessage(labels.errorMessage)
      onCaptureComplete()
      return
    }

    isCapturingRef.current = true
    setErrorMessage(null)
    setDownloadMessage(null)

    let cancelled = false

    const performCapture = async () => {
      try {
        // Wait for paint to ensure ShareScreen is rendered
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve()
            })
          })
        })

        // Check if cancelled while waiting
        if (cancelled) {
          return
        }

        const imageBlob = await captureMatchEndScreen(captureNode, labels.idleActionLabel)
        const filename = createShareFilename(matchId)
        const shareFile = new File([imageBlob], filename, {
          type: imageBlob.type || 'image/png'
        })
        const shareText = summary.isFinishedEarly ? labels.finishedEarlyShareText : labels.shareText

        if (cancelled) {
          return
        }

        if (await shareMatchImage(navigator as ShareNavigator, shareText, shareFile)) {
          return
        }

        downloadImage(imageBlob, filename)
        setDownloadMessage(labels.downloadMessage)
      } catch (error) {
        if (cancelled) {
          return
        }

        if (isAbortError(error)) {
          return
        }

        console.error('Failed to share the match end screen.', error)
        setErrorMessage(labels.errorMessage)
      } finally {
        if (!cancelled) {
          isCapturingRef.current = false
          onCaptureComplete()
        }
      }
    }

    void performCapture()

    return () => {
      cancelled = true
    }
  }, [captureRef, labels, matchId, onCaptureComplete, shareScreenReady, summary.isFinishedEarly])

  useEffect(() => {
    if (!errorMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setErrorMessage(null)
    }, statusMessageTimeoutMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [errorMessage])

  useEffect(() => {
    if (!downloadMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setDownloadMessage(null)
    }, statusMessageTimeoutMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [downloadMessage])

  // Reset isSharing when shareScreenReady becomes false (capture complete)
  useEffect(() => {
    if (shareScreenReady) {
      return
    }

    // shareScreenReady just became false, reset isSharing
    setIsSharing(false)
  }, [shareScreenReady])

  const handleShareClick = useCallback(() => {
    if (isCapturingRef.current) {
      return
    }

    setIsSharing(true)
  }, [])

  return {
    downloadMessage,
    errorMessage,
    handleShareClick,
    isSharing
  }
}

function createShareFilename(matchId: string): string {
  return `padel-buddy-match-${matchId}.png`
}

async function captureMatchEndScreen(node: HTMLElement, idleActionLabel: string): Promise<Blob> {
  const { domToBlob } = await import('modern-screenshot')

  return domToBlob(node, {
    scale: Math.max(1, window.devicePixelRatio || 1),
    onCloneNode(cloned) {
      if (!(cloned instanceof HTMLElement)) {
        return
      }

      if (cloned.matches(shareButtonSelector)) {
        cloned.dataset.shareLoading = 'false'
        cloned.removeAttribute('disabled')
        cloned.removeAttribute('aria-busy')
      }

      if (cloned.matches(shareLabelSelector)) {
        cloned.textContent = idleActionLabel
      }
    }
  })
}

async function shareMatchImage(
  navigatorObject: ShareNavigator,
  shareText: string,
  shareFile: File
): Promise<boolean> {
  if (
    typeof navigatorObject.share !== 'function' ||
    typeof navigatorObject.canShare !== 'function' ||
    !navigatorObject.canShare({ files: [shareFile] })
  ) {
    return false
  }

  try {
    await navigatorObject.share({
      files: [shareFile],
      text: shareText
    })

    return true
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    return false
  }
}

function downloadImage(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
  )
}
