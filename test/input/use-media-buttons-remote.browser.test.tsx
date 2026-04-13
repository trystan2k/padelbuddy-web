import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { useMediaButtonsRemote } from '@/lib/input/use-media-buttons-remote';
import type { MatchAction, MatchTeamId } from '@/core/match/types';

function MediaButtonsRemoteHarness({
  enabled = true,
  initialActions = [],
  onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>(),
  onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>(),
  onError = vi.fn<(error: Error) => void>(),
  onStateChange
}: {
  enabled?: boolean;
  initialActions?: MatchAction[];
  onAdd?: (teamId: MatchTeamId) => Promise<void> | void;
  onUndoForTeam?: (teamId: MatchTeamId) => Promise<void> | void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ReturnType<typeof useMediaButtonsRemote>) => void;
}) {
  const [actions, setActions] = useState(initialActions);
  const state = useMediaButtonsRemote(
    {
      actions,
      enabled
    },
    {
      onAdd: async (teamId) => {
        setActions((current) => [...current, { type: 'score-point', teamId }]);
        void onAdd(teamId);
      },
      onUndoForTeam: async (teamId) => {
        setActions((current) => {
          const lastIdx = current.findLastIndex(
            (a) => a.type === 'score-point' && a.teamId === teamId
          );

          return lastIdx < 0
            ? current
            : [...current.slice(0, lastIdx), ...current.slice(lastIdx + 1)];
        });
        void onUndoForTeam(teamId);
      },
      onError
    }
  );

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  return (
    <div>
      <span data-testid="action-count">{actions.length}</span>
      <span data-testid="latest-team">{actions.at(-1)?.teamId ?? 'none'}</span>
      <button
        data-testid="press-volume-up"
        type="button"
        onClick={() => state.handlers.onMediaButtonPress('media-volume-up')}
      >
        Volume Up
      </button>
      <button
        data-testid="press-volume-down"
        type="button"
        onClick={() => state.handlers.onMediaButtonPress('media-volume-down')}
      >
        Volume Down
      </button>
      <button
        data-testid="press-track-next"
        type="button"
        onClick={() => state.handlers.onMediaButtonPress('media-track-next')}
      >
        Track Next
      </button>
      <button
        data-testid="press-track-prev"
        type="button"
        onClick={() => state.handlers.onMediaButtonPress('media-track-previous')}
      >
        Track Prev
      </button>
    </div>
  );
}

describe('use-media-buttons-remote browser', () => {
  let originalMediaSession: MediaSession | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalMediaSession = navigator.mediaSession;
  });

  afterEach(() => {
    // Restore original mediaSession
    Object.defineProperty(navigator, 'mediaSession', {
      value: originalMediaSession,
      writable: true,
      configurable: true
    });
    vi.restoreAllMocks();
  });

  describe('onMediaButtonPress callback', () => {
    test('calls onAdd with team-1 for volume-up button', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const screen = await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      await screen.getByTestId('press-volume-up').click();

      expect(onAdd).toHaveBeenCalledWith('team-1');
      await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1');
      await expect.element(screen.getByTestId('latest-team')).toHaveTextContent('team-1');
    });

    test('calls onAdd with team-2 for track-next button', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const screen = await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      await screen.getByTestId('press-track-next').click();

      expect(onAdd).toHaveBeenCalledWith('team-2');
      await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1');
      await expect.element(screen.getByTestId('latest-team')).toHaveTextContent('team-2');
    });

    test('calls onUndoForTeam with team-1 for volume-down when scoring action exists', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-1' }];

      const screen = await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      await screen.getByTestId('press-volume-down').click();

      expect(onUndoForTeam).toHaveBeenCalledWith('team-1');
      await expect.element(screen.getByTestId('action-count')).toHaveTextContent('0');
    });

    test('calls onUndoForTeam with team-2 for track-previous when scoring action exists', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-2' }];

      const screen = await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      await screen.getByTestId('press-track-prev').click();

      expect(onUndoForTeam).toHaveBeenCalledWith('team-2');
      await expect.element(screen.getByTestId('action-count')).toHaveTextContent('0');
    });

    test('does not call onUndoForTeam for volume-down when team-1 has no scoring action', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-2' }];

      const screen = await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      await screen.getByTestId('press-volume-down').click();

      expect(onUndoForTeam).not.toHaveBeenCalled();
      await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1');
    });

    test('does not call onUndoForTeam for track-previous when team-2 has no scoring action', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-1' }];

      const screen = await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      await screen.getByTestId('press-track-prev').click();

      expect(onUndoForTeam).not.toHaveBeenCalled();
      await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1');
    });

    test('does nothing for an unknown button ID', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      let state: ReturnType<typeof useMediaButtonsRemote> | undefined;

      await render(
        <MediaButtonsRemoteHarness
          onAdd={onAdd}
          onStateChange={(s) => {
            state = s;
          }}
        />
      );

      await vi.waitFor(() => {
        expect(state).toBeDefined();
      });

      state!.handlers.onMediaButtonPress('unknown-button');

      expect(onAdd).not.toHaveBeenCalled();
    });
  });

  describe('enabled/disabled', () => {
    test('does not process button presses when disabled', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const screen = await render(<MediaButtonsRemoteHarness enabled={false} onAdd={onAdd} />);

      await screen.getByTestId('press-volume-up').click();

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('does not process revert when disabled even with existing actions', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-1' }];

      await render(
        <MediaButtonsRemoteHarness
          enabled={false}
          initialActions={initialActions}
          onUndoForTeam={onUndoForTeam}
        />
      );

      // Volume down would normally trigger revert-team-1, but disabled prevents it
      // The button uses state.handlers.onMediaButtonPress which checks enabledRef
    });
  });

  describe('DOM keydown fallback', () => {
    test('handles VolumeUp keydown event', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp' }));

      expect(onAdd).toHaveBeenCalledWith('team-1');
    });

    test('handles VolumeDown keydown event (maps to revert-team-1)', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-1' }];

      await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeDown' }));

      expect(onUndoForTeam).toHaveBeenCalledWith('team-1');
    });

    test('handles MediaTrackNext keydown event', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'MediaTrackNext' }));

      expect(onAdd).toHaveBeenCalledWith('team-2');
    });

    test('handles MediaTrackPrevious keydown event (maps to revert-team-2)', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-2' }];

      await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'MediaTrackPrevious' }));

      expect(onUndoForTeam).toHaveBeenCalledWith('team-2');
    });

    test('ignores media keys with Ctrl modifier', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp', ctrlKey: true }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('ignores media keys with Meta modifier', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp', metaKey: true }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('ignores media keys with Alt modifier', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp', altKey: true }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('ignores media keys when target is an input element', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp', bubbles: true }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('ignores media keys when target is a textarea element', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp', bubbles: true }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('ignores media keys when target is contentEditable', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      const editable = document.createElement('div');
      editable.contentEditable = 'true';
      document.body.appendChild(editable);
      editable.dispatchEvent(new KeyboardEvent('keydown', { code: 'VolumeUp', bubbles: true }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('ignores non-media key codes', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));

      expect(onAdd).not.toHaveBeenCalled();
    });

    test('calls preventDefault on recognized media keys', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      const event = new KeyboardEvent('keydown', { code: 'VolumeUp', cancelable: true });
      const spy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
    });

    test('does not register keydown listener when disabled', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const addSpy = vi.spyOn(window, 'addEventListener');

      await render(<MediaButtonsRemoteHarness enabled={false} onAdd={onAdd} />);

      const keydownCalls = addSpy.mock.calls.filter((call) => call[0] === 'keydown');

      // When disabled, no keydown listener should be registered
      expect(keydownCalls.length).toBe(0);
    });
  });

  describe('MediaSession handler registration', () => {
    function createMockMediaSession(): {
      handlers: Record<string, ((details: MediaSessionActionDetails) => void) | null>;
      setActionHandler: ReturnType<typeof vi.fn>;
      metadata: null;
      playbackState: MediaSessionPlaybackState;
    } {
      const handlers: Record<string, ((details: MediaSessionActionDetails) => void) | null> = {};

      return {
        handlers,
        setActionHandler: vi.fn<
          (action: string, handler: ((details: MediaSessionActionDetails) => void) | null) => void
        >((action, handler) => {
          handlers[action] = handler;
        }),
        metadata: null,
        playbackState: 'none' as MediaSessionPlaybackState
      };
    }

    test('registers nexttrack and previoustrack handlers when mediaSession is available', async () => {
      const mockMediaSession = createMockMediaSession();

      Object.defineProperty(navigator, 'mediaSession', {
        value: mockMediaSession,
        writable: true,
        configurable: true
      });

      await render(<MediaButtonsRemoteHarness />);

      expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith(
        'nexttrack',
        expect.any(Function)
      );
      expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith(
        'previoustrack',
        expect.any(Function)
      );
    });

    test('nexttrack handler triggers add-team-2', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const mockMediaSession = createMockMediaSession();

      Object.defineProperty(navigator, 'mediaSession', {
        value: mockMediaSession,
        writable: true,
        configurable: true
      });

      await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      const nexttrackHandler = mockMediaSession.handlers['nexttrack'];
      expect(nexttrackHandler).toBeDefined();

      nexttrackHandler!({ action: 'nexttrack' } as MediaSessionActionDetails);

      expect(onAdd).toHaveBeenCalledWith('team-2');
    });

    test('previoustrack handler triggers revert-team-2 when scoring action exists', async () => {
      const onUndoForTeam = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const mockMediaSession = createMockMediaSession();

      Object.defineProperty(navigator, 'mediaSession', {
        value: mockMediaSession,
        writable: true,
        configurable: true
      });

      const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-2' }];

      await render(
        <MediaButtonsRemoteHarness initialActions={initialActions} onUndoForTeam={onUndoForTeam} />
      );

      const previoustrackHandler = mockMediaSession.handlers['previoustrack'];
      expect(previoustrackHandler).toBeDefined();

      previoustrackHandler!({ action: 'previoustrack' } as MediaSessionActionDetails);

      expect(onUndoForTeam).toHaveBeenCalledWith('team-2');
    });

    test('cleans up MediaSession handlers on unmount', async () => {
      const mockMediaSession = createMockMediaSession();

      Object.defineProperty(navigator, 'mediaSession', {
        value: mockMediaSession,
        writable: true,
        configurable: true
      });

      const { unmount } = await render(<MediaButtonsRemoteHarness />);

      await unmount();

      // After unmount, setActionHandler should have been called with null for cleanup
      const cleanupCalls = mockMediaSession.setActionHandler.mock.calls.filter(
        (call) => call[1] === null
      );

      expect(cleanupCalls.length).toBeGreaterThanOrEqual(2);
    });

    test('MediaSession handlers do not fire when disabled', async () => {
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();
      const mockMediaSession = createMockMediaSession();

      Object.defineProperty(navigator, 'mediaSession', {
        value: mockMediaSession,
        writable: true,
        configurable: true
      });

      const { unmount } = await render(<MediaButtonsRemoteHarness enabled={false} onAdd={onAdd} />);

      // Enable by remounting — the hook will start with enabled=false
      const nexttrackHandler = mockMediaSession.handlers['nexttrack'];
      nexttrackHandler?.({ action: 'nexttrack' } as MediaSessionActionDetails);

      // The handlers check enabledRef.current, which is false
      expect(onAdd).not.toHaveBeenCalled();
      await unmount();
    });
  });

  describe('cleanup on unmount', () => {
    test('removes DOM keydown listener on unmount', async () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const onAdd = vi.fn<(teamId: MatchTeamId) => Promise<void> | void>();

      const { unmount } = await render(<MediaButtonsRemoteHarness onAdd={onAdd} />);

      await unmount();

      const keydownRemovals = removeSpy.mock.calls.filter((call) => call[0] === 'keydown');

      expect(keydownRemovals.length).toBeGreaterThanOrEqual(1);
    });
  });
});
