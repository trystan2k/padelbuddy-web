import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Ref
} from 'react'

import { cn } from '@/lib/utils/cn'

import styles from './PadelCourtSpinner.module.css'

export interface PadelCourtSpinnerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  ref?: Ref<HTMLDivElement>
  label?: string
  silent?: boolean
}

const UPPER_LEFT = { x: 65, y: 25 }
const UPPER_RIGHT = { x: 219, y: 25 }
const LOWER_LEFT = { x: 65, y: 115 }
const LOWER_RIGHT = { x: 219, y: 115 }
const INITIAL_PATH = 'M 65 25 L 219 25 L 65 115 L 219 115 L 65 25'

const SEGMENTS = 4
const LOOP_DURATION = 2400

function generateRandomPath(): string {
  const points = [UPPER_LEFT]

  for (let i = 0; i < SEGMENTS; i++) {
    const prev = points[i]!
    const isLeftSide = prev.x < 142

    if (isLeftSide) {
      points.push(Math.random() > 0.5 ? UPPER_RIGHT : LOWER_RIGHT)
    } else {
      points.push(Math.random() > 0.5 ? UPPER_LEFT : LOWER_LEFT)
    }
  }

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function generateKeyTimes(count: number): string {
  return Array.from({ length: count }, (_, i) => (i / (count - 1)).toFixed(4)).join(';')
}

export function PadelCourtSpinner({
  className,
  label = 'Loading, please wait...',
  silent = false,
  ref,
  ...props
}: PadelCourtSpinnerProps) {
  const [ballPath, setBallPath] = useState(INITIAL_PATH)
  const animRef = useRef<SVGAnimateMotionElement>(null)

  const regenerate = useCallback(() => {
    setBallPath(generateRandomPath())
  }, [])

  useEffect(() => {
    const interval = setInterval(regenerate, LOOP_DURATION)
    return () => clearInterval(interval)
  }, [regenerate])

  const keyTimes = generateKeyTimes(SEGMENTS + 1)

  return (
    <div ref={ref} className={cn(styles.overlay, styles.loaderContainer)}>
      <div
        className={cn(styles.container, className)}
        {...(silent ? {} : { role: 'status', 'aria-live': 'polite' })}
        aria-busy="true"
        aria-label={label}
        {...props}
      >
        <svg
          className={styles.court}
          viewBox="0 0 284 140"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Court background */}
          <rect
            x="1.5"
            y="1.5"
            width="281"
            height="137"
            rx="10.5"
            fill="#1a3a5c"
            stroke="#2f7cf6"
            strokeWidth="3"
          />

          {/* Net - center dashed line */}
          <line
            x1="142"
            y1="5"
            x2="142"
            y2="135"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Service lines */}
          <line x1="56" y1="5" x2="56" y2="135" stroke="white" strokeWidth="2" />
          <line x1="228" y1="5" x2="228" y2="135" stroke="white" strokeWidth="2" />

          {/* Center service lines - horizontal */}
          <line x1="56" y1="67" x2="140" y2="67" stroke="white" strokeWidth="2" />
          <line x1="144" y1="67" x2="228" y2="67" stroke="white" strokeWidth="2" />

          {/* Ball trajectory path (hidden, for animateMotion) */}
          <path id="ballPath" d={ballPath} fill="none" stroke="none" />

          {/* Animated ball */}
          <circle className={styles.ball} r="7">
            <animateMotion
              ref={animRef}
              key={ballPath}
              dur={`${LOOP_DURATION}ms`}
              repeatCount="indefinite"
              calcMode="linear"
              keyTimes={keyTimes}
            >
              <mpath href="#ballPath" />
            </animateMotion>
          </circle>

          {/* Static ball (visible when prefers-reduced-motion) */}
          <circle className={styles.ballStatic} cx="142" cy="67" r="7" />
        </svg>

        <span className={styles.label}>{label}</span>
        <span className={styles.visuallyHidden}>{label}</span>
      </div>
    </div>
  )
}
