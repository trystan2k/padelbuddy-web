import type { MatchTeamId } from '@/core/match'
import { useTranslation } from 'react-i18next'

import { TopBar } from '@/components/ui/TopBar'

import styles from './ShareScreen.module.css'
import { cn } from '@/lib/utils/cn'

export interface ShareScreenProps {
  ref?: import('react').Ref<HTMLDivElement>
  winnerName: string
  loserName: string
  winnerTeamId: MatchTeamId
  formatLabel: string
  setRows: Array<{
    setNumber: number
    team1Games: number
    team2Games: number
  }>
  durationValue: string
  dateValue: string
}

export function ShareScreen({
  ref,
  winnerName,
  loserName,
  winnerTeamId,
  formatLabel,
  setRows,
  durationValue,
  dateValue
}: ShareScreenProps) {
  const { t } = useTranslation()

  const winnerIsTeam1 = winnerTeamId === 'team-1'

  const matchCompleteBadge = t('share.topbar.badge')

  return (
    <div
      ref={ref}
      className={cn('screen', styles.shareScreen)}
      aria-hidden="true"
      data-share-screen
    >
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('share.topbar.appName')}
        subtitle={matchCompleteBadge}
      />

      <div className={styles.content}>
        {/* Result Card */}
        <div className={styles.resultCard}>
          <div className={styles.trophyWrap}>
            <TrophyIcon />
          </div>
          <span className={styles.winnersLabel}>{t('share.result.winners')}</span>
          <span className={styles.winnerName}>{winnerName}</span>
          <div className={styles.loserRow}>
            <span className={styles.vsLabel}>{t('share.result.vs')}</span>
            <span className={styles.loserName}>{loserName}</span>
          </div>
        </div>

        {/* Score Card */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreHeader}>
            <span className={styles.scoreTitle}>{t('share.score.title')}</span>
            <span className={styles.bestOfBadge}>{formatLabel}</span>
          </div>

          <div className={styles.teamHeaders}>
            <span className={winnerIsTeam1 ? styles.teamAHeader : styles.teamBHeader}>
              {winnerName}
            </span>
            <span className={!winnerIsTeam1 ? styles.teamAHeader : styles.teamBHeader}>
              {loserName}
            </span>
          </div>

          <div className={styles.scoreRows}>
            {setRows.map((row) => {
              const col1Score = winnerIsTeam1 ? row.team1Games : row.team2Games
              const col2Score = winnerIsTeam1 ? row.team2Games : row.team1Games
              return (
                <div key={row.setNumber} className={styles.setRow}>
                  <span className={styles.setLabel}>
                    {t('share.score.set', { number: row.setNumber })}
                  </span>
                  <span className={styles.winnerScore}>{col1Score}</span>
                  <span className={styles.setDash}>-</span>
                  <span className={styles.loserScore}>{col2Score}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>{t('share.stats.duration')}</span>
            <span className={styles.statValue}>{durationValue}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>{t('share.stats.date')}</span>
            <span className={styles.statValue}>{dateValue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrophyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.trophyIcon}
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
