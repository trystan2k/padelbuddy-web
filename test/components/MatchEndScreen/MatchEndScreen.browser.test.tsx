/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for readability */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { MatchEndScreen } from '@/components/MatchEndScreen/MatchEndScreen'
import { projectMatch } from '@/core/match/replay'
import { createTestSetup, winQuickSet } from '../../core/match/test-helpers'

const currentTime = new Date('2026-03-19T13:24:00.000Z')
const startedAt = currentTime.getTime() - 20 * 60 * 1000
const finishedAt = startedAt + 5 * 60 * 1000

// Mock useToast to track toast calls without rendering portal
const mockAddInfoToast = vi.fn()
const mockAddErrorToast = vi.fn()
vi.mock('@/components/ui/Toast/useToast', () => ({
  useToast: () => ({
    addInfoToast: mockAddInfoToast,
    addErrorToast: mockAddErrorToast
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  globalToastManager: { add: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn() },
  useToastManager: () => ({ toasts: [] })
}))

const {
  mockInvalidate,
  mockNavigate,
  mockPreloadRoute,
  mockClearCurrentMatch,
  mockContinuePlaying,
  mockCreateCurrentMatchSession,
  mockDomToBlob,
  mockSpeechSpeak,
  mockSpeechDestroy
} = vi.hoisted(() => {
  const mockInvalidateFn = vi.fn(async () => undefined)
  const mockNavigateFn = vi.fn()
  const mockPreloadRouteFn = vi.fn(async () => undefined)
  const mockClearCurrentMatchFn = vi.fn(async () => undefined)
  const mockContinuePlayingFn = vi.fn(async () => undefined)
  const mockDomToBlobFn = vi.fn()
  const mockSpeechSpeakFn = vi.fn()
  const mockSpeechDestroyFn = vi.fn()
  const mockCreateCurrentMatchSessionFn = vi.fn(() => ({
    continuePlaying: mockContinuePlayingFn
  }))

  return {
    mockInvalidate: mockInvalidateFn,
    mockNavigate: mockNavigateFn,
    mockPreloadRoute: mockPreloadRouteFn,
    mockClearCurrentMatch: mockClearCurrentMatchFn,
    mockContinuePlaying: mockContinuePlayingFn,
    mockCreateCurrentMatchSession: mockCreateCurrentMatchSessionFn,
    mockDomToBlob: mockDomToBlobFn,
    mockSpeechSpeak: mockSpeechSpeakFn,
    mockSpeechDestroy: mockSpeechDestroyFn
  }
})

vi.mock('modern-screenshot', () => ({
  domToBlob: mockDomToBlob
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouter: () => ({
    invalidate: mockInvalidate,
    preloadRoute: mockPreloadRoute
  })
}))

vi.mock('@/lib/current-match/indexed-db', () => ({
  clearCurrentMatch: () => mockClearCurrentMatch()
}))

vi.mock('@/lib/current-match/session', () => ({
  createCurrentMatchSession: mockCreateCurrentMatchSession
}))

vi.mock('@/lib/speech/speech-service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/speech/speech-service')>()

  return {
    ...actual,
    useSpeechService: () => ({
      speak: mockSpeechSpeak,
      announce: vi.fn(),
      cancel: vi.fn(),
      destroy: mockSpeechDestroy,
      getMuted: vi.fn(() => false),
      setMuted: vi.fn(),
      getVerbosity: vi.fn(() => 'standard'),
      setVerbosity: vi.fn(),
      getVoice: vi.fn(() => null),
      isSupported: vi.fn(() => true)
    })
  }
})

vi.mock('@/lib/i18n/i18n', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/i18n/i18n')>()

  return {
    ...original,
    getCurrentLocale: () => 'en',
    changeLocale: vi.fn()
  }
})

describe('MatchEndScreen', () => {
  const originalNavigatorShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share')
  const originalNavigatorCanShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'canShare')
  const originalCreateObjectUrl = URL.createObjectURL.bind(URL)
  const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL)
  let createObjectUrlMock = vi.fn(() => 'blob:match-end-screen')
  let revokeObjectUrlMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(currentTime)
    mockDomToBlob.mockResolvedValue(createPngBlob())
    mockSpeechSpeak.mockReset()
    mockSpeechDestroy.mockReset()
    createObjectUrlMock = vi.fn(() => 'blob:match-end-screen')
    revokeObjectUrlMock = vi.fn()
    restoreNavigatorProperty('share', originalNavigatorShareDescriptor)
    restoreNavigatorProperty('canShare', originalNavigatorCanShareDescriptor)
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectUrlMock,
      writable: true,
      configurable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectUrlMock,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    restoreNavigatorProperty('share', originalNavigatorShareDescriptor)
    restoreNavigatorProperty('canShare', originalNavigatorCanShareDescriptor)
    Object.defineProperty(URL, 'createObjectURL', {
      value: originalCreateObjectUrl,
      writable: true,
      configurable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: originalRevokeObjectUrl,
      writable: true,
      configurable: true
    })
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  test('renders the winner, set summary, statistics, and actions', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await expect.element(screen.getByTestId('match-end-screen')).toBeInTheDocument()
    await expect.element(screen.getByText('Match Complete')).toBeInTheDocument()
    await expect.element(screen.getByText('Winners')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'Alvaro & Enrique' }))
      .toBeInTheDocument()
    await expect.element(screen.getByText('Set Summary')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-winner-card')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-summary-card')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-set-row-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-set-row-2')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-stats-card')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('region', { name: 'Match statistics' }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByTestId('match-end-stats-card'))
      .toHaveTextContent('Match length')
    await expect
      .element(screen.getByTestId('match-end-stats-card'))
      .toHaveTextContent('Total games')
    await expect.element(screen.getByTestId('match-end-total-games')).toHaveTextContent('12')
    await expect.element(screen.getByTestId('match-end-duration')).toHaveTextContent('5m')
    await expect
      .element(screen.getByText('Set 1: Alvaro & Enrique 6, Pablo & Thiago 0'))
      .toBeInTheDocument()
    await expect.element(screen.getByTestId('new-match-button')).toBeInTheDocument()
    await expect.element(screen.getByTestId('continue-match-button')).toBeInTheDocument()
    expect(screen.container.querySelector('[aria-haspopup="true"]')).toBeNull()
  })

  test('renders an enabled share action in the header', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    // i18n key: 'match.end.actions.share' — locale is mocked to 'en' above
    const shareButton = screen.getByRole('button', { name: 'Share' })

    await expect.element(shareButton).toBeEnabled()
  })

  test('announces the match result once for the current i18n language', async () => {
    await renderCompletedMatchEndScreen()

    await vi.waitFor(() => {
      expect(mockSpeechSpeak).toHaveBeenCalledTimes(1)
    })

    expect(mockSpeechSpeak).toHaveBeenCalledWith('Victory Alvaro & Enrique', {
      immediate: true,
      lang: 'en'
    })
  })

  test('announces tied matches once for the current i18n language when no winner exists', async () => {
    await renderFinishedEarlyMatchEndScreen()

    await vi.waitFor(() => {
      expect(mockSpeechSpeak).toHaveBeenCalledTimes(1)
    })

    expect(mockSpeechSpeak).toHaveBeenCalledWith('Tied match', {
      immediate: true,
      lang: 'en'
    })
  })

  test('stays silent on the match end screen when audio announcements are disabled', async () => {
    await render(
      <MatchEndScreen
        matchId="test-match"
        setup={createTestSetup({
          audioAnnouncementsEnabled: false,
          sides: [
            { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
            { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
          ]
        })}
        actions={createCompletedActions()}
        projection={createCompletedProjection()}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    expect(mockSpeechSpeak).not.toHaveBeenCalled()
  })

  test('locks the share button while capture is in progress', async () => {
    setShareNavigator({
      canShare: vi.fn((_data?: ShareData) => true),
      share: vi.fn(async (_data?: ShareData) => undefined)
    })
    const deferredCapture = createDeferred<Blob>()
    mockDomToBlob.mockReturnValueOnce(deferredCapture.promise)

    const screen = await renderCompletedMatchEndScreen()
    const shareButton = screen.getByRole('button', { name: 'Share' })

    await shareButton.click()

    const sharingButton = screen.getByRole('button', { name: 'Sharing...' })

    await expect.element(sharingButton).toBeDisabled()
    await expect.element(sharingButton).toHaveTextContent('Sharing...')

    ;(sharingButton.element() as HTMLButtonElement).click()

    // Wait for async performCapture() flow: React re-render → useEffect →
    // performCapture() → 2× requestAnimationFrame → domToBlob call.
    // Without vi.waitFor this is racy — passes on fast machines, fails on slow ones.
    await vi.waitFor(() => {
      expect(mockDomToBlob).toHaveBeenCalledTimes(1)
    })

    deferredCapture.resolve(createPngBlob())

    await vi.waitFor(() => {
      expect(
        (screen.getByRole('button', { name: 'Share' }).element() as HTMLButtonElement).disabled
      ).toBe(false)
    })
    await expect.element(screen.getByRole('button', { name: 'Share' })).toHaveTextContent('Share')
  })

  test('shares localized text with a PNG file when file sharing is supported', async () => {
    const share = vi.fn(async (_data?: ShareData) => undefined)
    const canShare = vi.fn((_data?: ShareData) => true)
    setShareNavigator({ canShare, share })

    const screen = await renderCompletedMatchEndScreen()

    await screen.getByRole('button', { name: 'Share' }).click()

    await vi.waitFor(() => {
      expect(canShare).toHaveBeenCalledWith({
        files: [expect.any(File)]
      })
      expect(share).toHaveBeenCalledTimes(1)
    })

    const sharePayload = (share.mock.calls as [ShareData?][]).at(0)?.[0]
    const sharedFile = sharePayload?.files?.[0]

    expect(sharePayload?.text).toBe(
      'Alvaro & Enrique won a Best of 3 Padel Buddy match in 5m across 12 games. Alvaro & Enrique vs Pablo & Thiago.'
    )
    expect(sharedFile).toBeInstanceOf(File)
    expect(sharedFile?.name).toBe('padel-buddy-match-202603191309.png')
    expect(sharedFile?.type).toBe('image/png')
  })

  test('downloads a PNG when file sharing is unavailable', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const share = vi.fn(async (_data?: ShareData) => undefined)
    const canShare = vi.fn((_data?: ShareData) => false)
    setShareNavigator({ canShare, share })

    const screen = await renderCompletedMatchEndScreen()

    await screen.getByRole('button', { name: 'Share' }).click()

    await vi.waitFor(() => {
      expect(createObjectUrlMock).toHaveBeenCalledWith(expect.any(Blob))
    })

    expect(share).not.toHaveBeenCalled()
    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => {
      expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:match-end-screen')
    })
    // Toast is triggered via useToast - verify mock was called
    await vi.waitFor(() => {
      expect(mockAddInfoToast).toHaveBeenCalledWith('Match image downloaded.', expect.any(Object))
    })
  })

  test('shows an error alert when capture fails', async () => {
    const share = vi.fn(async (_data?: ShareData) => undefined)
    const canShare = vi.fn((_data?: ShareData) => true)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    setShareNavigator({ canShare, share })
    mockDomToBlob.mockRejectedValueOnce(new Error('capture failed'))

    const screen = await renderCompletedMatchEndScreen()

    await screen.getByRole('button', { name: 'Share' }).click()

    await vi.waitFor(() => {
      expect(share).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to share the match end screen.',
        expect.any(Error)
      )
    })
    // Toast is triggered via useToast - verify mock was called
    await vi.waitFor(() => {
      expect(mockAddErrorToast).toHaveBeenCalledWith(
        'Unable to share this match right now.',
        expect.any(Object)
      )
    })
  })

  test('shares the finished-early copy instead of the raw i18n key', async () => {
    const share = vi.fn(async (_data?: ShareData) => undefined)
    const canShare = vi.fn((_data?: ShareData) => true)
    setShareNavigator({ canShare, share })

    const screen = await renderFinishedEarlyMatchEndScreen()

    await screen.getByRole('button', { name: 'Share' }).click()

    await vi.waitFor(() => {
      expect(share).toHaveBeenCalledTimes(1)
    })

    const sharePayload = (share.mock.calls as [ShareData?][]).at(0)?.[0]

    expect(sharePayload?.text).toBe(
      'The Best of 3 Padel Buddy match between Alvaro & Enrique and Pablo & Thiago finished early after 5m and 0 games.'
    )
    expect(sharePayload?.text).not.toContain('match.end.share.textFinishedEarly')
  })

  test('handles share-sheet cancellation without surfacing an error', async () => {
    setShareNavigator({
      canShare: vi.fn((_data?: ShareData) => true),
      share: vi.fn(async (_data?: ShareData) => {
        throw new DOMException('Share cancelled', 'AbortError')
      })
    })

    const screen = await renderCompletedMatchEndScreen()
    const shareButton = screen.getByRole('button', { name: 'Share' })

    await shareButton.click()

    await vi.waitFor(() => {
      expect((shareButton.element() as HTMLButtonElement).disabled).toBe(false)
    })

    await expect.element(screen.getByRole('button', { name: 'Share' })).toBeEnabled()
    expect(screen.container.textContent).not.toContain('Match image downloaded.')
    expect(createObjectUrlMock).not.toHaveBeenCalled()
  })

  test('starts a new match by clearing persistence and navigating home', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await screen.getByTestId('new-match-button').click()

    await vi.waitFor(() => {
      expect(mockClearCurrentMatch).toHaveBeenCalledTimes(1)
      expect(mockInvalidate).not.toHaveBeenCalled()
      expect(mockPreloadRoute).toHaveBeenCalledWith({ to: '/' })
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/', viewTransition: true })
    })
  })

  test('continues the current match and returns to the active route', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await screen.getByTestId('continue-match-button').click()

    await vi.waitFor(() => {
      expect(mockCreateCurrentMatchSession).toHaveBeenCalledWith({
        matchId: 'test-match',
        setup,
        actions,
        startedAt,
        finishedAt
      })
      expect(mockContinuePlaying).toHaveBeenCalledTimes(1)
      expect(mockInvalidate).toHaveBeenCalledTimes(1)
      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: 'test-match' }
      })
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: 'test-match' },
        replace: true,
        viewTransition: true
      })
    })

    const invalidateCall = mockInvalidate.mock.calls.at(0)
    const invalidateArgs = invalidateCall?.at(0) as
      | {
          filter: (routeMatch: { routeId: string }) => boolean
        }
      | undefined
    expect(invalidateArgs?.filter({ routeId: '/match/$id' })).toBe(true)
    expect(invalidateArgs?.filter({ routeId: '/match/finish/$id' })).toBe(true)
    expect(invalidateArgs?.filter({ routeId: '/' })).toBe(true)
    expect(invalidateArgs?.filter({ routeId: '/settings' })).toBe(false)
  })

  test('re-enables continue when continuation fails', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    mockContinuePlaying.mockRejectedValueOnce(new Error('continue failed'))

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    const continueButton = screen.getByTestId('continue-match-button')

    await continueButton.click()

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to continue the current match.',
        expect.any(Error)
      )
    })
    await vi.waitFor(() => {
      expect((continueButton.element() as HTMLButtonElement).disabled).toBe(false)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('keeps the displayed duration frozen after the match is complete', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await expect.element(screen.getByTestId('match-end-duration')).toHaveTextContent('5m')

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    await expect.element(screen.getByTestId('match-end-duration')).toHaveTextContent('5m')
  })
})

function createCompletedProjection() {
  const setup = createCompletedSetup()

  return projectMatch(setup, createCompletedActions())
}

function createCompletedActions() {
  return [...winQuickSet('team-1'), ...winQuickSet('team-1')]
}

function createCompletedSetup() {
  return createTestSetup({
    sides: [
      { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
      { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
    ]
  })
}

async function renderCompletedMatchEndScreen() {
  return render(
    <MatchEndScreen
      matchId="test-match"
      setup={createCompletedSetup()}
      actions={createCompletedActions()}
      projection={createCompletedProjection()}
      startedAt={startedAt}
      finishedAt={finishedAt}
    />
  )
}

async function renderFinishedEarlyMatchEndScreen() {
  return render(
    <MatchEndScreen
      matchId="test-match"
      setup={createCompletedSetup()}
      actions={[]}
      projection={projectMatch(createCompletedSetup(), [])}
      startedAt={startedAt}
      finishedAt={finishedAt}
    />
  )
}

function createPngBlob() {
  return new Blob(['share-image'], { type: 'image/png' })
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return {
    promise,
    resolve,
    reject
  }
}

function setShareNavigator({
  canShare,
  share
}: {
  canShare?: ((data?: ShareData) => boolean) | undefined
  share?: ((data?: ShareData) => Promise<void>) | undefined
}) {
  Object.defineProperty(navigator, 'canShare', {
    value: canShare,
    writable: true,
    configurable: true
  })
  Object.defineProperty(navigator, 'share', {
    value: share,
    writable: true,
    configurable: true
  })
}

function restoreNavigatorProperty(
  propertyName: 'canShare' | 'share',
  descriptor: PropertyDescriptor | undefined
) {
  if (descriptor) {
    Object.defineProperty(navigator, propertyName, descriptor)
    return
  }

  delete (navigator as Navigator & Partial<Record<'canShare' | 'share', unknown>>)[propertyName]
}
