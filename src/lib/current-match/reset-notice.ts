import currentMatchResetNoticeStore from './reset-notice-store';

export interface CurrentMatchResetNotice {
  reason: 'schema-version';
}

export function queueCurrentMatchResetNotice(notice: CurrentMatchResetNotice): void {
  currentMatchResetNoticeStore.set(notice);
}

export function consumeCurrentMatchResetNotice(): CurrentMatchResetNotice | null {
  return currentMatchResetNoticeStore.clear();
}
