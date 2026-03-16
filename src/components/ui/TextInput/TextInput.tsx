import { useCallback } from 'react'
import type { ChangeEvent } from 'react'

import { cn } from '@/lib/utils/cn'

import type { Accent } from '../types'
import styles from './TextInput.module.css'

export type TextInputAccent = Accent

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  accent?: TextInputAccent
  className?: string
  id?: string
  'aria-label'?: string
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  accent,
  className,
  id,
  'aria-label': ariaLabel
}: TextInputProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={cn(styles.input, accentClass, className)}
      aria-label={ariaLabel}
    />
  )
}
