import { useCallback } from 'react'

import styles from './TextInput.module.css'

export type TextInputVariant = 'default' | 'team-one' | 'team-two'

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  variant?: TextInputVariant
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
  variant = 'default',
  className,
  id,
  'aria-label': ariaLabel
}: TextInputProps) {
  const variantClass =
    variant === 'team-one' ? styles.teamOne : variant === 'team-two' ? styles.teamTwo : ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
      className={`${styles.input}${variantClass ? ` ${variantClass}` : ''}${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    />
  )
}
