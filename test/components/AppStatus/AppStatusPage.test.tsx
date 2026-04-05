import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  AppStatusActions,
  AppStatusDetail,
  AppStatusPage
} from '@/components/AppStatus/AppStatusPage'

describe('AppStatusPage', () => {
  test('renders the status content and optional actions', () => {
    const markup = renderToStaticMarkup(
      <AppStatusPage
        eyebrow="Unexpected error"
        title="Something went wrong"
        body="Please try again."
        liveRegion="assertive"
      >
        <AppStatusDetail role="alert">Match not found</AppStatusDetail>
        <AppStatusActions>
          <button type="button">Try again</button>
        </AppStatusActions>
      </AppStatusPage>
    )

    expect(markup).toContain('Unexpected error')
    expect(markup).toContain('Something went wrong')
    expect(markup).toContain('Please try again.')
    expect(markup).toContain('Match not found')
    expect(markup).toContain('Try again')
    expect(markup).toContain('aria-live="assertive"')
    expect(markup).toContain('role="alert"')
  })

  test('omits detail and actions when they are not provided', () => {
    const markup = renderToStaticMarkup(
      <AppStatusPage
        eyebrow="Unexpected error"
        title="Something went wrong"
        body="Please try again."
      />
    )

    expect(markup).toContain('Unexpected error')
    expect(markup).toContain('Something went wrong')
    expect(markup).toContain('Please try again.')
    expect(markup).not.toContain('aria-live=')
    expect(markup).not.toContain('role="alert"')
  })
})
