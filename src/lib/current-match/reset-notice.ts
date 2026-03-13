export interface CurrentMatchResetNotice {
  reason: 'schema-version'
}

let pendingCurrentMatchResetNotice: CurrentMatchResetNotice | null = null

export function queueCurrentMatchResetNotice(notice: CurrentMatchResetNotice): void {
  pendingCurrentMatchResetNotice = notice
}

export function consumeCurrentMatchResetNotice(): CurrentMatchResetNotice | null {
  const notice = pendingCurrentMatchResetNotice

  pendingCurrentMatchResetNotice = null

  return notice
}
