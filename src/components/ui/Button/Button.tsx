import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import { Button as BaseButton } from '@base-ui/react/button';

import { cn } from '@/lib/utils/cn';

import styles from './Button.module.css';

export type ButtonVariant = 'solid' | 'outline' | 'soft';
export type ButtonSize = 'sm' | 'lg';
export type ButtonAccent = 'primary' | 'secondary' | 'success' | 'danger';

export interface ButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'className'
> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  className?: string | undefined;
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: ButtonAccent;
}

export function Button({
  children,
  disabled = false,
  type = 'button',
  className,
  variant = 'solid',
  size = 'lg',
  accent = 'success',
  ref,
  ...buttonProps
}: ButtonProps) {
  const variantClass =
    variant === 'solid' ? styles.solid : variant === 'outline' ? styles.outline : styles.soft;

  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeLg;

  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : accent === 'danger'
          ? styles.accentDanger
          : styles.accentSuccess;

  return (
    <BaseButton
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(styles.button, variantClass, sizeClass, accentClass, className)}
      {...buttonProps}
    >
      {children}
    </BaseButton>
  );
}
