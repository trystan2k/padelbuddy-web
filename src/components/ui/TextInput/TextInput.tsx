import { useCallback, type ComponentPropsWithoutRef } from 'react'

import { Input } from '@base-ui/react/input'

import { cn } from '@/lib/utils/cn'

import type { Accent } from '../types'
import styles from './TextInput.module.css'

export type TextInputAccent = Accent

export interface TextInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'onChange' | 'value'
> {
  value: string
  onChange: (value: string) => void
  accent?: TextInputAccent
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
  'aria-label': ariaLabel,
  ...props
}: TextInputProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined

  const handleValueChange = useCallback((newValue: string) => onChange(newValue), [onChange])

  return (
    <Input
      type="text"
      id={id}
      value={value}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={cn(styles.input, accentClass, className)}
      aria-label={ariaLabel}
      {...props}
    />
  )
}
