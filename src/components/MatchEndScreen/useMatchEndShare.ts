import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import type { MatchEndScreenSummary } from './view-model'

const statusMessageTimeoutMs = 4000

interface MatchEndShareLabels {
  shareText: string
  finishedEarlyShareText: string
  errorMessage: string
  downloadMessage: string
}

interface UseMatchEndShareOptions {
  captureRef: RefObject<HTMLDivElement | null>
  finishedAt: number
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
  finishedAt,
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

        const imageBlob = await captureMatchEndScreen(captureNode)
        const filename = createShareFilename(finishedAt)
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
  }, [captureRef, labels, finishedAt, onCaptureComplete, shareScreenReady, summary.isFinishedEarly])

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

function createShareFilename(finishedAt: number): string {
  const d = new Date(finishedAt)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  const formatted = `${year}${month}${day}${hours}${minutes}`
  return `padel-buddy-match-${formatted}.png`
}

async function captureMatchEndScreen(node: HTMLElement): Promise<Blob> {
  const { domToBlob } = await import('modern-screenshot')

  return domToBlob(node, {
    scale: Math.max(1, window.devicePixelRatio || 1)
  })
}

async function shareMatchImage(
  navigatorObject: ShareNavigator,
  shareText: string,
  shareFile: File
): Promise<boolean> {
  if (
    typeof navigatorObject.share !== 'function' ||
    typeof navigatorObject.canShare !== 'function'
  ) {
    return false
  }

  let canShareFiles = false
  try {
    canShareFiles = navigatorObject.canShare({ files: [shareFile] })
  } catch {
    canShareFiles = false
  }

  if (!canShareFiles) {
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
  // Revoke after a macrotask to ensure the browser has finished consuming the URL
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
  )
}
