import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

import type { Accent } from '@/components/ui/types';
import styles from './SectionLabel.module.css';

export type SectionLabelAccent = Accent;

export interface SectionLabelProps extends HTMLAttributes<HTMLParagraphElement> {
  accent?: SectionLabelAccent;
}

export function SectionLabel({ children, className, accent, ...props }: SectionLabelProps) {
  const accentClass =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
        ? styles.accentSecondary
        : undefined;

  return (
    <p className={cn(styles.label, accentClass, className)} {...props}>
      {children}
    </p>
  );
}
