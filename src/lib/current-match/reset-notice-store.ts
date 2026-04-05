import type { CurrentMatchResetNotice } from './reset-notice'

export interface CurrentMatchResetNoticeStore {
  get(): CurrentMatchResetNotice | null
  set(notice: CurrentMatchResetNotice): void
  clear(): CurrentMatchResetNotice | null
  reset(): void
}

export function createCurrentMatchResetNoticeStore(): CurrentMatchResetNoticeStore {
  let notice: CurrentMatchResetNotice | null = null

  return {
    get() {
      return notice
    },
    set(nextNotice) {
      notice = nextNotice
    },
    clear() {
      const currentNotice = notice

      notice = null

      return currentNotice
    },
    reset() {
      notice = null
    }
  }
}

const currentMatchResetNoticeStore = createCurrentMatchResetNoticeStore()

export default currentMatchResetNoticeStore
