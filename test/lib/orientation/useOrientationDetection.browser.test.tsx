import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-react';

import { useOrientationDetection } from '@/lib/orientation/useOrientationDetection';

type OrientationChangeListener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryListController {
  query: {
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };
}

function installMatchMedia(initialIsPortrait: boolean): MockMediaQueryListController {
  let isPortrait = initialIsPortrait;
  const listeners = new Set<OrientationChangeListener>();

  const dispatchChange = () => {
    const event = new Event('change') as MediaQueryListEvent;

    for (const listener of listeners) {
      listener(event);
    }
  };

  const query = {
    get matches() {
      return isPortrait;
    },
    media: '(orientation: portrait)',
    onchange: null,
    addListener: vi.fn<(listener: OrientationChangeListener) => void>((listener) => {
      listeners.add(listener);
    }),
    removeListener: vi.fn<(listener: OrientationChangeListener) => void>((listener) => {
      listeners.delete(listener);
    }),
    addEventListener: vi.fn<
      (type: string, listener: EventListenerOrEventListenerObject | null) => void
    >((type, listener) => {
      if (type === 'change' && typeof listener === 'function') {
        listeners.add(listener);
      }
    }),
    removeEventListener: vi.fn<
      (type: string, listener: EventListenerOrEventListenerObject | null) => void
    >((type, listener) => {
      if (type === 'change' && typeof listener === 'function') {
        listeners.delete(listener);
      }
    }),
    dispatchEvent: vi.fn<(event: Event) => boolean>((event) => {
      for (const listener of listeners) {
        listener(event as MediaQueryListEvent);
      }

      return true;
    })
  } satisfies Partial<MediaQueryList>;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn<(queryString: string) => MediaQueryList>((queryString) => {
      expect(queryString).toBe('(orientation: portrait)');
      return query;
    })
  });

  dispatchChange();

  return {
    query: {
      addEventListener: query.addEventListener,
      removeEventListener: query.removeEventListener,
      addListener: query.addListener,
      removeListener: query.removeListener
    }
  };
}

function installLegacyMatchMedia(initialIsPortrait: boolean): MockMediaQueryListController {
  let isPortrait = initialIsPortrait;
  const listeners = new Set<OrientationChangeListener>();

  const query = {
    get matches() {
      return isPortrait;
    },
    media: '(orientation: portrait)',
    onchange: null,
    addListener: vi.fn<(listener: OrientationChangeListener) => void>((listener) => {
      listeners.add(listener);
    }),
    removeListener: vi.fn<(listener: OrientationChangeListener) => void>((listener) => {
      listeners.delete(listener);
    }),
    dispatchEvent: vi.fn<(event: Event) => boolean>((event) => {
      for (const listener of listeners) {
        listener(event as MediaQueryListEvent);
      }

      return true;
    })
  } satisfies Partial<MediaQueryList>;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn<(queryString: string) => MediaQueryList>((queryString) => {
      expect(queryString).toBe('(orientation: portrait)');
      return query as unknown as MediaQueryList;
    })
  });

  return {
    query: {
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: query.addListener,
      removeListener: query.removeListener
    }
  };
}

function OrientationProbe() {
  const { isPortrait, isLandscape } = useOrientationDetection();

  return (
    <div>
      <span data-testid="portrait">{String(isPortrait)}</span>
      <span data-testid="landscape">{String(isLandscape)}</span>
    </div>
  );
}

describe('useOrientationDetection', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(async () => {
    await cleanup();
    vi.restoreAllMocks();

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia
    });
  });

  test('detects portrait orientation', async () => {
    installMatchMedia(true);

    const screen = await render(<OrientationProbe />);

    await expect.element(screen.getByTestId('portrait')).toHaveTextContent('true');
    await expect.element(screen.getByTestId('landscape')).toHaveTextContent('false');
  });

  test('detects landscape orientation', async () => {
    installMatchMedia(false);

    const screen = await render(<OrientationProbe />);

    await expect.element(screen.getByTestId('portrait')).toHaveTextContent('false');
    await expect.element(screen.getByTestId('landscape')).toHaveTextContent('true');
  });

  test('cleans up orientation change listeners on unmount', async () => {
    const controller = installMatchMedia(true);

    await render(<OrientationProbe />);

    const addedHandler = controller.query.addEventListener.mock.calls[0]?.[1];

    expect(controller.query.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    await cleanup();

    expect(controller.query.removeEventListener).toHaveBeenCalledWith('change', addedHandler);
  });

  test('falls back to legacy media query listeners when addEventListener is unavailable', async () => {
    const controller = installLegacyMatchMedia(true);

    await render(<OrientationProbe />);

    const addedHandler = controller.query.addListener.mock.calls[0]?.[0];

    expect(controller.query.addListener).toHaveBeenCalledWith(expect.any(Function));

    await cleanup();

    expect(controller.query.removeListener).toHaveBeenCalledWith(addedHandler);
  });

  test('defaults to portrait when matchMedia is unavailable', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: undefined
    });

    const screen = await render(<OrientationProbe />);

    await expect.element(screen.getByTestId('portrait')).toHaveTextContent('true');
    await expect.element(screen.getByTestId('landscape')).toHaveTextContent('false');
  });
});
