import type { ComponentPropsWithoutRef } from 'react';

import { Separator } from '@base-ui/react/separator';

import { cn } from '@/lib/utils/cn';

import styles from './Divider.module.css';

export type DividerProps = ComponentPropsWithoutRef<'div'>;

export function Divider({ className, ...props }: DividerProps) {
  return (
    <Separator orientation="horizontal" className={cn(styles.divider, className)} {...props} />
  );
}
